#!/usr/bin/env node
/**
 * Interactive i18n fixer for Next.js + next-intl
 * ------------------------------------------------
 * - Scans files for untranslated text.
 * - Checks if translation hook exists.
 * - Proposes t() replacement and message key.
 * - Inserts useTranslations() and import if missing.
 * - Updates messages/en.json interactively.
 */

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { existsSync } from 'fs';
import { scanFile } from './scan-i18n.mjs'; // your improved version

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

const rootDir = path.resolve(process.cwd(), 'src');
const messagesPath = path.resolve(process.cwd(), 'messages/en.json');
let messages = existsSync(messagesPath)
  ? JSON.parse(await fs.readFile(messagesPath, 'utf8'))
  : {};

function suggestNamespace(file) {
  const parts = file.split(path.sep);
  const name = parts.at(-1).replace(/\.[tj]sx?$/, '');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function suggestKey(snippet) {
  return snippet
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 40);
}

function hasTranslationHook(content) {
  return /\buseTranslations\s*\(/.test(content);
}

/* -------------------------------------------------------------------------- */
/* Insert import + hook                                                       */
/* -------------------------------------------------------------------------- */

async function insertTranslationHook(content, namespace) {
  const lines = content.split('\n');

  // 1️⃣ Ensure import { useTranslations } from 'next-intl';
  const hasImport = lines.some((l) => l.includes("from 'next-intl'"));
  if (!hasImport) {
    const firstImport = lines.findIndex((l) => /^\s*import\s/.test(l));
    const importLine = `import { useTranslations } from 'next-intl';`;
    if (firstImport >= 0) {
      lines.splice(firstImport, 0, importLine);
    } else {
      lines.unshift(importLine, '');
    }
  }

  // 2️⃣ Insert const t = useTranslations('<Namespace>');
  const hasHook = lines.some((l) => /useTranslations\s*\(/.test(l));
  if (hasHook) return lines.join('\n');

  const hookLine = `  const t = useTranslations('${namespace}');`;

  // Patterns for React component styles
  const patterns = [
    /^\s*(export\s+)?function\s+\w+\s*\(/, // function Foo() { ...
    /^\s*(export\s+)?const\s+\w+\s*[:=].*=>\s*\{?/, // const Foo = () => { ...
    /^\s*(export\s+)?let\s+\w+\s*[:=].*=>\s*\{?/, // let Foo = () => { ...
    /^\s*(export\s+)?var\s+\w+\s*[:=].*=>\s*\{?/, // var Foo = () => { ...
    /^\s*(export\s+)?const\s+\w+\s*:\s*React\.FC/, // const Foo: React.FC = ...
    /^\s*(export\s+)?const\s+\w+\s*=\s*memo\s*\(/ // export const Foo = memo( ...
  ];

  let insertIndex = -1;
  for (const p of patterns) {
    insertIndex = lines.findIndex((l) => p.test(l));
    if (insertIndex !== -1) break;
  }

  if (insertIndex !== -1) {
    lines.splice(insertIndex + 1, 0, hookLine);
  } else {
    // fallback after imports
    const lastImport = lines
      .map((l, i) => (l.startsWith('import') ? i : -1))
      .filter((i) => i !== -1)
      .pop();
    const pos = lastImport !== undefined ? lastImport + 1 : 0;
    lines.splice(pos, 0, '', hookLine, '');
  }

  return lines.join('\n');
}

/* -------------------------------------------------------------------------- */
/* Process each file                                                          */
/* -------------------------------------------------------------------------- */

async function processFile(file) {
  const content = await fs.readFile(file, 'utf8');
  const findings = await scanFile(file, 't');
  if (!findings.length) return;

  const rel = path.relative(process.cwd(), file);
  let modified = false;
  let newContent = content;
  const namespace = suggestNamespace(file);
  const hasT = hasTranslationHook(content);

  console.log(`\n📂 ${rel}`);
  console.log(
    hasT ? '✅ Translation hook detected.' : '⚠️ No translation hook found.'
  );

  for (const f of findings) {
    const { line, snippet } = f;
    const key = `${namespace}.${suggestKey(snippet)}`;

    console.log(`\n${rel}:${line}`);
    console.log(`> "${snippet}"`);
    const ans = await ask(`→ Replace with {t('${key}')} ? [y/n/custom/skip]: `);

    if (ans.toLowerCase() === 'skip' || ans.toLowerCase() === 'n') continue;

    const finalKey =
      ans.toLowerCase() === 'y' || !ans.trim() ? key : ans.trim();

    // replace first occurrence safely
    const escaped = snippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(escaped);
    const replaced = newContent.replace(re, `{t('${finalKey}')}`);
    if (replaced !== newContent) {
      newContent = replaced;
      messages[finalKey] = snippet;
      modified = true;
      console.log(`✅ Added key "${finalKey}"`);
    } else {
      console.log(`⚠️ Could not safely replace snippet.`);
    }
  }

  if (modified) {
    if (!hasT) {
      const answer = await ask(
        `Add translation hook (useTranslations) for "${namespace}"? [y/n]: `
      );
      if (answer.toLowerCase() === 'y') {
        newContent = await insertTranslationHook(newContent, namespace);
      }
    }

    await fs.writeFile(file, newContent, 'utf8');
    console.log(`💾 Updated ${rel}`);
  }
}

/* -------------------------------------------------------------------------- */
/* Main loop                                                                  */
/* -------------------------------------------------------------------------- */

async function main() {
  const entries = await fs.readdir(rootDir, { recursive: true });
  for (const entry of entries) {
    const full = path.join(rootDir, entry);
    if (/\.(tsx|jsx)$/.test(entry)) {
      await processFile(full);
    }
  }

  await fs.mkdir(path.dirname(messagesPath), { recursive: true });
  await fs.writeFile(messagesPath, JSON.stringify(messages, null, 2));
  rl.close();
  console.log('\n✅ Done. messages/en.json updated.');
}

await main();
