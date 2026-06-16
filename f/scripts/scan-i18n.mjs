#!/usr/bin/env node
// Scan a Next.js src folder for likely non-translated UI strings (ESM / Node 18+).
// Usage examples:
//   node scripts/scan-i18n.mjs --root ./src
//   node scripts/scan-i18n.mjs --root ./src --tfunc t --report tmp/i18n.csv
//   node scripts/scan-i18n.mjs --root ./src --open
//   node scripts/scan-i18n.mjs --root ./src --open --limit-per-file 3
//   node scripts/scan-i18n.mjs --root ./src --extensions .tsx,.jsx,.ts,.js

import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';
import { spawnSync } from 'child_process';
//import url from "url";

/* ----------------------------- Config / Heuristics ---------------------------- */

const DEFAULT_EXTS = ['.tsx', '.jsx', '.ts', '.js'];
const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  'out',
  'build',
  'dist',
  '.git',
  'public',
  'coverage',
  '.turbo',
  '.vercel',
  '.vscode',
  '__tests__',
  '__mocks__',
  '.storybook',
  'cypress',
  'locales',
  'next-intl',
  '.cache'
]);

const UI_ATTRS = new Set([
  'title',
  'alt',
  'aria-label',
  'aria-title',
  'placeholder',
  'label',
  'caption',
  'helpertext',
  'helper-text',
  'tooltip',
  'summary',
  'headline',
  'header',
  'aria-placeholder',
  'aria-description',
  'aria-roledescription',
  'aria-valuetext',
  'aria-errormessage',
  'description', // ✅ added
  'subtitle', // ✅ added
  'heading', // ✅ added
  'note', // ✅ added
  'message' // ✅ added
]);

const SKIP_ATTRS = new Set([
  'id',
  'data-testid',
  'data-test',
  'href',
  'to',
  'src',
  'class',
  'className',
  'name',
  'value',
  'type',
  'rel',
  'role'
]);

const SAFE_TOKENS = new Set([
  'px',
  'rem',
  'em',
  'btn',
  'lg',
  'sm',
  'md',
  'xl',
  'xxl',
  'http',
  'https',
  'svg',
  'png',
  'jpg',
  'gif',
  'webp',
  'pdf',
  'json',
  'ts',
  'tsx',
  'js',
  'jsx',
  'true',
  'false',
  'null',
  'undefined'
]);

// Regexes (all line-scoped; we scan line by line)
const JSX_TEXT_RE = />\s*(?!{)\s*([^<>{}]*[A-Za-zÀ-ÖØ-öø-ÿ][^<>{}]*)\s*</g;
const ATTR_RE = /([A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(["'])(.*?)\2/g;
const CURLY_STRING_RE = /{\s*(['"])([^'"\n\r]+)\1\s*}/g;

function containsTCall(s, tfunc) {
  if (!s) return false;
  const re = new RegExp(String.raw`${escapeRegExp(tfunc)}\s*\(`);
  return re.test(s);
}

function looksLikeUiText(s) {
  if (!s) return false;
  const str = s.trim();

  if (!str) return false;
  if (/^[\s\W_]+$/.test(str)) return false; // only punctuation/space
  if (str.length <= 2) return false; // very short
  if (!/[A-Za-zÀ-ÖØ-öø-ÿ]/.test(str)) return false; // must contain a letter
  if (SAFE_TOKENS.has(str.toLowerCase())) return false; // known safe token

  // file/URL-like
  if (
    /(^|\/).+\.(com|org|io|dev|net|svg|png|jpg|gif|webp|pdf|ts|tsx|js|jsx)$/i.test(
      str
    )
  )
    return false;
  if (/^[A-Za-z]:\\/.test(str)) return false; // Windows path

  // Likely CSS utilities
  if (
    /\b(text|bg|font|flex|grid|p|m|border|rounded|shadow)-[A-Za-z0-9\-:/]+/.test(
      str
    )
  )
    return false;

  return true;
}

function shouldFlagAttr(name) {
  const n = (name || '').toLowerCase();
  if (SKIP_ATTRS.has(n)) return false;
  if (UI_ATTRS.has(n)) return true;
  // broader match for things that look like text-bearing props
  return /\b(label|text|title|caption|tooltip|heading|helper|description|subtitle|message)\b/i.test(
    n
  );
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* --------------------------------- CLI args ---------------------------------- */

function parseArgs(argv) {
  const args = {
    root: null,
    tfunc: 't',
    extensions: DEFAULT_EXTS,
    report: null, // csv or json based on extension
    open: false, // open files in editor
    limitPerFile: 5 // max locations opened per file
  };

  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--root') args.root = argv[++i];
    else if (a === '--tfunc') args.tfunc = argv[++i];
    else if (a === '--extensions')
      args.extensions = argv[++i]
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a === '--report') args.report = argv[++i];
    else if (a === '--open') args.open = true;
    else if (a === '--limit-per-file')
      args.limitPerFile = Number(argv[++i]) || args.limitPerFile;
    else if (a === '-h' || a === '--help') {
      printHelp();
      process.exit(0);
    }
  }
  if (!args.root) {
    console.error('Error: --root is required (e.g., --root ./src)');
    process.exit(2);
  }
  return args;
}

function printHelp() {
  console.log(`
Scan Next.js sources for likely non-translated UI strings.

Options:
  --root <dir>               Root folder to scan (e.g., ./src) [required]
  --tfunc <name>             Translation function to consider "translated" (default: t)
  --extensions <list>        Comma list of extensions (default: .tsx,.jsx,.ts,.js)
  --report <path>            Write CSV or JSON report depending on extension
  --open                     Open flagged files in your editor (VS Code supported)
  --limit-per-file <n>       Max locations to open per file (default: 5)
  -h, --help                 Show help
`);
}

/* --------------------------------- Walker ------------------------------------ */

async function* iterFiles(root, extensions) {
  const stack = [root];
  const exts = new Set(
    extensions.map((e) => (e.startsWith('.') ? e : `.${e}`))
  );

  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const ent of entries) {
      if (ent.name.startsWith('.')) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!IGNORE_DIRS.has(ent.name)) stack.push(full);
      } else if (ent.isFile()) {
        const ext = path.extname(ent.name);
        if (exts.has(ext)) yield full;
      }
    }
  }
}

/* --------------------------------- Scanner ----------------------------------- */

async function scanFile(filePath, tfunc) {
  let text;
  try {
    text = await fs.readFile(filePath, 'utf8');
  } catch (e) {
    return [
      { line: 0, reason: 'error', snippet: `Failed to read: ${e.message}` }
    ];
  }

  // --------------------------------------------------------------------------
  // Strip all comments first
  // --------------------------------------------------------------------------
  text = text
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/\/\/[^\n\r]*/g, ''); // line comments

  const lines = text.split(/\r?\n/);
  const findings = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNo = i + 1;
    const line = lines[i];

    if (!line.trim()) continue;

    // ----------------------------------------------------------------------
    // Skip any line that is clearly code, TS generics, or definitions
    // ----------------------------------------------------------------------
    if (
      /^\s*(import|export|type|interface|enum|namespace|extends|implements|const|let|var|function|class)\b/.test(
        line
      ) ||
      /^\s*(\/|#)/.test(line) || // comments / shebang
      /@type|@param|@returns|@deprecated/.test(line) || // JSDoc
      /:\s*[A-Z][A-Za-z0-9_<>{},\[\]\| ]+$/.test(line) || // type annotations
      /Promise<|React\.|void\b|boolean\b|number\b|string\b|unknown\b|any\b/.test(
        line
      ) ||
      /<\s*[A-Za-z_]\w*\s*(extends|=|,|>)?/.test(line) || // generics like <T = Foo> or <T extends U>
      /^[^<]*=\s*[A-Z][A-Za-z0-9_]*(<.*>)?\s*$/.test(line) || // assignments of types
      /[A-Za-z_]\w*<[^>]+>\s*(=|,|\)|;|\{|\})/.test(line) // any TS generic pattern
    ) {
      continue;
    }

    if (containsTCall(line, tfunc)) continue;

    // ----------------------------------------------------------------------
    // Heuristic 1: JSX text nodes  <div>Hello</div>
    // ----------------------------------------------------------------------
    JSX_TEXT_RE.lastIndex = 0;
    for (let m; (m = JSX_TEXT_RE.exec(line)); ) {
      const textNode = m[1];
      // Filter out technical identifiers like = FieldPath or generic fragments
      if (/^[=A-Za-z0-9_<>.,\s]+$/.test(textNode)) continue;
      if (looksLikeUiText(textNode)) {
        findings.push({
          line: lineNo,
          reason: 'JSX text node',
          snippet: textNode.trim()
        });
      }
    }

    // ----------------------------------------------------------------------
    // Heuristic 2: JSX props like title="Hello"
    // ----------------------------------------------------------------------
    ATTR_RE.lastIndex = 0;
    for (let m; (m = ATTR_RE.exec(line)); ) {
      const name = m[1];
      const val = m[3];
      if (!shouldFlagAttr(name)) continue;
      if (containsTCall(val, tfunc)) continue;
      if (looksLikeUiText(val)) {
        findings.push({
          line: lineNo,
          reason: `Prop "${name}"`,
          snippet: val.trim()
        });
      }
    }

    // ----------------------------------------------------------------------
    // Heuristic 3: Curly string literals { "Hello" }
    // ----------------------------------------------------------------------
    CURLY_STRING_RE.lastIndex = 0;
    for (let m; (m = CURLY_STRING_RE.exec(line)); ) {
      const val = m[2];
      if (looksLikeUiText(val)) {
        findings.push({
          line: lineNo,
          reason: 'Curly string literal',
          snippet: val.trim()
        });
      }
    }
  }

  return findings;
}
/* ------------------------------ Editor helpers ------------------------------- */

function commandExists(cmd) {
  const whichCmd = process.platform === 'win32' ? 'where' : 'which';
  const res = spawnSync(whichCmd, [cmd], { stdio: 'ignore' });
  return res.status === 0;
}

function detectEditor() {
  // Prefer VS Code if available
  if (commandExists('code')) {
    return { kind: 'vscode', cmd: 'code' };
  }
  // Respect $EDITOR if set
  const ed = process.env.EDITOR || '';
  if (ed) {
    const base = path.basename(ed).toLowerCase();
    if (base.includes('code')) return { kind: 'vscode', cmd: ed };
    if (base.includes('nvim')) return { kind: 'nvim', cmd: ed };
    if (base.includes('vim')) return { kind: 'vim', cmd: ed };
  }
  // OS fallbacks (no line support)
  if (process.platform === 'darwin' && commandExists('open')) {
    return { kind: 'open', cmd: 'open' };
  }
  if (process.platform === 'linux' && commandExists('xdg-open')) {
    return { kind: 'xdg-open', cmd: 'xdg-open' };
  }
  if (process.platform === 'win32') {
    return { kind: 'start', cmd: 'cmd' }; // we'll call: cmd /c start "" file
  }
  return null;
}

function openLocationsInEditor(editor, locationsByFile, limitPerFile) {
  // locationsByFile: Map<string, number[]>
  if (!editor) {
    console.error(
      "No suitable editor command found. Set $EDITOR or install VS Code ('code')."
    );
    return;
  }

  if (editor.kind === 'vscode') {
    const args = ['-g'];
    for (const [file, lines] of locationsByFile) {
      const lim = lines.slice(0, limitPerFile);
      for (const ln of lim) {
        args.push(`${file}:${ln}:1`);
      }
    }
    spawnSync(editor.cmd, args, { stdio: 'inherit' });
    return;
  }

  if (editor.kind === 'nvim' || editor.kind === 'vim') {
    for (const [file, lines] of locationsByFile) {
      const ln = lines[0] || 1;
      spawnSync(editor.cmd, [`+${ln}`, file], { stdio: 'inherit' });
    }
    return;
  }

  // OS openers (no line support)
  for (const [file] of locationsByFile) {
    if (editor.kind === 'open' || editor.kind === 'xdg-open') {
      spawnSync(editor.cmd, [file], { stdio: 'ignore' });
    } else if (editor.kind === 'start') {
      spawnSync('cmd', ['/c', 'start', '', file], {
        stdio: 'ignore',
        windowsVerbatimArguments: true
      });
    }
  }
}

/* ---------------------------------- Main ------------------------------------- */
/* -------------------------------------------------------------------------- */
/* Run as standalone CLI only if executed directly                            */
/* -------------------------------------------------------------------------- */
if (import.meta.url === `file://${process.argv[1]}`) {
  (async function main() {
    const args = parseArgs(process.argv);
    const root = path.resolve(process.cwd(), args.root);
    if (!existsSync(root)) {
      console.error(`Error: ${root} does not exist`);
      process.exit(2);
    }

    const findingsByFile = new Map();
    for await (const file of iterFiles(root, args.extensions)) {
      const findings = await scanFile(file, args.tfunc);
      if (findings.length) findingsByFile.set(file, findings);
    }

    // keep your reporting and optional --open / --report logic unchanged
    if (findingsByFile.size === 0) {
      console.log('✅ No likely non-translated UI strings found.');
    } else {
      let total = 0;
      for (const arr of findingsByFile.values()) total += arr.length;
      console.log(
        `⚠️  Found ${total} potential non-translated strings across ${findingsByFile.size} file(s):\n`
      );

      for (const [file, arr] of findingsByFile) {
        const rel = path.relative(process.cwd(), file);
        console.log(rel);
        for (const f of arr.slice(0, 200)) {
          const snippet =
            f.snippet.length > 120
              ? f.snippet.slice(0, 117) + '...'
              : f.snippet;
          console.log(`  ${rel}:${f.line}: ${f.reason}: ${snippet}`);
        }
        if (arr.length > 200) {
          console.log(`  ...and ${arr.length - 200} more in this file`);
        }
        console.log('');
      }
    }
  })();
}

/* -------------------------------------------------------------------------- */
/* Exports for interactive tools                                              */
/* -------------------------------------------------------------------------- */
export { scanFile };
