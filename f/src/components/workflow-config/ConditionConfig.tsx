'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { useState, useMemo } from 'react';
import { useWorkflowConfig } from './use-workflow-config';
import { type Edge, type Node } from '@xyflow/react';
import { useTranslations } from 'next-intl';

interface Branch {
  variable: string;
  operator: string;
  value: string;
  failsafe?: boolean;
}
const OPS = ['==', '!=', '>', '>=', '<', '<=', 'contains'];

export function ConditionConfig({
  node,
  nodes = [],
  edges = [],
  onConfigChange
}: {
  node: Node;
  nodes?: Node[];
  edges?: Edge[];
  onConfigChange?: (c: any) => void;
}) {
  const t = useTranslations('workflow_config');
  const { saveConfig } = useWorkflowConfig(node, onConfigChange);

  /* ---------------------------------------------------------------------- */
  /* 🔹 Local state initialized once                                        */
  /* ---------------------------------------------------------------------- */
  const getInitialBranches = (): Branch[] => {
    if (
      node.data?.config &&
      typeof node.data.config === 'object' &&
      node.data.config !== null &&
      'branches' in node.data.config &&
      Array.isArray(node.data.config.branches)
    ) {
      return node.data.config.branches as Branch[];
    }
    return [
      { variable: '', operator: '>=', value: '50', failsafe: false },
      { variable: '', operator: '', value: '', failsafe: true }
    ];
  };
  const [branches, setBranches] = useState<Branch[]>(getInitialBranches());

  /* ---------------------------------------------------------------------- */
  /* 🔹 Compute parent-only variables                                       */
  /* ---------------------------------------------------------------------- */
  const contextVars = useMemo(() => {
    const parentIds = edges
      .filter((e) => e.target === node.id)
      .map((e) => e.source);
    const parents = nodes.filter((n) => parentIds.includes(n.id));
    const vars: string[] = [];
    parents.forEach((p) => {
      const t = typeof p.data?.type === 'string' ? p.data.type : '';
      if (['soft', 'hard', 'interview'].includes(t)) vars.push(`${p.id}/score`);
      if (t === 'eligibility') vars.push(`${p.id}/eligibility_pass`);
    });
    return vars;
  }, [nodes, edges, node.id]);

  /* ---------------------------------------------------------------------- */
  /* 🔹 Safe helpers – only call saveConfig on explicit user change         */
  /* ---------------------------------------------------------------------- */
  const commit = (next: Branch[]) => {
    setBranches(next);
    let prev: Branch[] = [];
    if (
      node.data?.config &&
      typeof node.data.config === 'object' &&
      node.data.config !== null &&
      'branches' in node.data.config &&
      Array.isArray(node.data.config.branches)
    ) {
      prev = node.data.config.branches as Branch[];
    }
    if (JSON.stringify(prev) !== JSON.stringify(next))
      saveConfig({ branches: next });
  };

  const change = (i: number, f: keyof Branch, v: string) => {
    const next = [...branches];
    next[i] = { ...next[i], [f]: v };
    commit(next);
  };
  const add = () => {
    const nb: Branch = {
      variable: contextVars[0] || '',
      operator: '>=',
      value: '50'
    };
    commit([
      ...branches.filter((b) => !b.failsafe),
      nb,
      ...branches.filter((b) => b.failsafe)
    ]);
  };
  const remove = (i: number) => commit(branches.filter((_, x) => x !== i));

  /* ---------------------------------------------------------------------- */
  /* 🔹 Render                                                             */
  /* ---------------------------------------------------------------------- */
  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{t('condition.title')}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {branches.map((b, i) => (
          <div
            key={i}
            className={`space-y-3 rounded-md border p-3 ${
              b.failsafe ? 'border-amber-200 bg-amber-50' : 'bg-muted/10'
            }`}
          >
            <div className='flex items-center justify-between'>
              <Label>
                {b.failsafe
                  ? t('condition.failsafe')
                  : t('condition.branch_label', { index: i + 1 })}
              </Label>
              {!b.failsafe && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => remove(i)}
                  className='h-6 w-6 p-0'
                >
                  ×
                </Button>
              )}
            </div>

            {!b.failsafe && (
              <>
                <div>
                  <Label>{t('condition.variable_label')}</Label>
                  <Select
                    value={b.variable}
                    onValueChange={(v) => change(i, 'variable', v)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('condition.select_variable')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {contextVars.length ? (
                        contextVars.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
                          </SelectItem>
                        ))
                      ) : (
                        <div className='text-muted-foreground px-2 py-1 text-xs'>
                          {t('condition.no_parent_variables')}
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('condition.operator_label')}</Label>
                  <Select
                    value={b.operator}
                    onValueChange={(v) => change(i, 'operator', v)}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t('condition.operator_placeholder')}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {OPS.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('condition.value_label')}</Label>
                  <Input
                    value={b.value}
                    onChange={(e) => change(i, 'value', e.target.value)}
                    placeholder={t('condition.value_placeholder')}
                  />
                </div>
              </>
            )}
          </div>
        ))}

        <Button variant='secondary' onClick={add}>
          + {t('condition.add_branch')}
        </Button>
      </CardContent>
    </Card>
  );
}
