'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Users, ScrollText, Star } from 'lucide-react';
import { QuizService } from '@/services/quiz-service';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from 'next-intl';

type SkillLike = {
  id: number;
  name: string;
  description?: string | null;
  level?: number | null;
};

type ConditionLike = {
  id: number;
  name: string;
  description?: string | null;
};

type PositionResponse = {
  id: number;
  name: string;
  hard_skills: SkillLike[];
  soft_skills: SkillLike[];
  conditions: ConditionLike[];
};

export default function MatricePage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const locale = pathname.split('/')[1] || 'en';
  const t = useTranslations('matrice_page');

  const [position, setPosition] = useState<PositionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedPositionId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('selectedPositionId');
    return stored ? parseInt(stored, 10) : null;
  }, []);

  useEffect(() => {
    const loadPosition = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!selectedPositionId) {
          setError('No position selected. Open Positions and click Matrice.');
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/positions/${selectedPositionId}`, {
          headers: session?.accessToken
            ? { Authorization: `Bearer ${session.accessToken}` }
            : undefined,
          cache: 'no-store'
        });
        if (!res.ok) {
          throw new Error(`Failed to load position ${selectedPositionId}`);
        }
        const data: PositionResponse = await res.json();
        setPosition(data);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : 'Failed to load position details'
        );
      } finally {
        setLoading(false);
      }
    };
    loadPosition();
  }, [selectedPositionId, session?.accessToken]);

  const rows = useMemo(() => {
    if (!position) return [];
    const hard = position.hard_skills.map((s) => ({
      kind: 'hard' as const,
      id: `hard-${s.id}`,
      name: s.name,
      description: (s as any).description || '',
      level: (s as any).level ?? null,
      weight: (s as any).weight ?? null
    }));
    const soft = position.soft_skills.map((s) => ({
      kind: 'soft' as const,
      id: `soft-${s.id}`,
      name: s.name,
      description: (s as any).description || '',
      level: (s as any).level ?? null,
      weight: (s as any).weight ?? null
    }));
    const conditions = position.conditions.map((c) => ({
      kind: 'condition' as const,
      id: `condition-${c.id}`,
      name: c.name,
      description: (c as any).description || ''
    }));
    return [...hard, ...soft, ...conditions];
  }, [position]);

  // Enrich skills with description/level and fetch quizzes per skill
  const [skillMeta, setSkillMeta] = useState<
    Map<
      string,
      {
        description?: string | null;
        level?: number | null;
        weight?: number | null;
        quizzes?: { id: number; name: string }[];
        formula?: string | null;
      }
    >
  >(new Map());

  useEffect(() => {
    const enrich = async () => {
      if (!position) return;
      const map = new Map(skillMeta);
      try {
        // Hard + Soft skills
        const allSkills = [
          ...position.hard_skills.map((s) => ({ ...s, kind: 'hard' as const })),
          ...position.soft_skills.map((s) => ({ ...s, kind: 'soft' as const }))
        ];

        // Fetch metadata for each skill: detail + quizzes
        await Promise.all(
          allSkills.map(async (s) => {
            const key = `${s.kind}-${s.id}`;
            if (!map.has(key)) {
              let description = s.description ?? null;
              let level = s.level ?? null;
              try {
                const res = await fetch(`/api/skills/${s.id}`, {
                  headers: session?.accessToken
                    ? { Authorization: `Bearer ${session.accessToken}` }
                    : undefined
                });
                if (res.ok) {
                  const data = await res.json();
                  description = data.description ?? description ?? null;
                  level = data.level ?? level ?? null;
                  const w =
                    data.weight ?? (data.default_weight as number | undefined);
                  map.set(key, {
                    ...(map.get(key) || {}),
                    description,
                    level,
                    weight: w ?? map.get(key)?.weight ?? null
                  });
                } else {
                  map.set(key, { description, level });
                }
              } catch {
                // ignore
              }
              let quizzes:
                | {
                    id: number;
                    name: string;
                  }[]
                | undefined;
              try {
                if (session?.accessToken) {
                  const templates = await QuizService.getTemplates(
                    session.accessToken,
                    s.id
                  );
                  quizzes =
                    templates?.map((t) => ({ id: t.id, name: t.name })) ?? [];
                }
              } catch {
                // ignore quizzes errors
              }
              const prev = map.get(key) || {};
              map.set(key, { ...prev, description, level, quizzes });
            }
          })
        );

        // Conditions
        await Promise.all(
          position.conditions.map(async (c) => {
            const key = `condition-${c.id}`;
            if (!map.has(key)) {
              let description = (c as any).description ?? null;
              let formula: string | null = null;
              try {
                const res = await fetch(`/api/conditions/${c.id}`, {
                  headers: session?.accessToken
                    ? { Authorization: `Bearer ${session.accessToken}` }
                    : undefined
                });
                if (res.ok) {
                  const data = await res.json();
                  description = data.description ?? description ?? null;
                  formula = data.formula ?? null;
                }
              } catch {}
              map.set(key, { description, formula });
            }
          })
        );
      } finally {
        setSkillMeta(map);
      }
    };
    enrich();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position, session?.accessToken]);

  /* const goToQuizzes = (entry: { kind: string; name: string }) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedSkillName', entry.name);
      localStorage.setItem('selectedSkillType', entry.kind);
    }
    router.push(`/${locale}/dashboard/quizzes`);
  }; */

  if (loading) {
    return (
      <div className='container px-10 py-6'>
        <p className='text-muted-foreground text-sm'>{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='container py-6'>
        <Card className='p-6'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-red-600'>{error}</p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push(`/${locale}/dashboard/positions`)}
            >
              {t('back_to_positions')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className='container px-10 py-6'>
      <div className='mb-4 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold'>
          {t('title')}
          {position?.name ? ` — ${position.name}` : ''}
        </h1>
        <Button
          variant='outline'
          size='sm'
          onClick={() => router.push(`/${locale}/dashboard/positions`)}
        >
          {t('back_to_positions')}
        </Button>
      </div>
      <p className='text-muted-foreground -mt-2 mb-2 text-sm'>
        {t('subtitle')}
      </p>
      <Separator className='mb-4' />

      <div className='overflow-x-auto rounded-lg border'>
        <table className='w-full table-auto text-sm md:table-fixed'>
          <thead className='bg-muted/50'>
            <tr>
              <th className='w-[28%] min-w-[180px] px-3 py-2 text-left'>
                {t('col_skills')}
              </th>
              <th className='w-[32%] min-w-[220px] px-3 py-2 text-left'>
                {t('col_description')}
              </th>
              <th className='w-[14%] min-w-[120px] px-3 py-2 text-left'>
                {t('col_verification')}
              </th>
              <th className='w-[12%] min-w-[120px] px-3 py-2 text-left'>
                {t('col_level')}
              </th>
              <th className='w-[14%] min-w-[180px] px-3 py-2 text-left'>
                {t('col_evaluation')}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isHard = row.kind === 'hard';
              const isSoft = row.kind === 'soft';
              const isCond = row.kind === 'condition';
              const metaKey = `${row.kind}-${String((row as any).id)
                .split('-')
                .pop()}`;
              const meta = skillMeta.get(metaKey);

              return (
                <tr
                  key={row.id}
                  className='border-t'
                  style={{
                    background: isHard
                      ? 'rgba(59,130,246,0.04)'
                      : isSoft
                        ? 'rgba(234,179,8,0.05)'
                        : 'rgba(107,114,128,0.05)'
                  }}
                >
                  {/* Skills/Condition (single column with icon + type) */}
                  <td className='px-3 py-2 font-medium'>
                    <span className='inline-flex items-center gap-2'>
                      {isHard && <Brain className='h-4 w-4 text-blue-500' />}
                      {isSoft && <Users className='h-4 w-4 text-yellow-600' />}
                      {isCond && (
                        <ScrollText className='h-4 w-4 text-gray-600' />
                      )}
                      <span>{row.name}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[11px] ${
                          isHard
                            ? 'bg-blue-100 text-blue-700'
                            : isSoft
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {isHard
                          ? t('type_hard')
                          : isSoft
                            ? t('type_soft')
                            : t('type_condition')}
                      </span>
                    </span>
                  </td>
                  <td className='px-3 py-2'>
                    <div className='max-w-[72ch] break-words whitespace-pre-wrap'>
                      {'description' in row &&
                      (meta?.description ?? row.description)
                        ? (meta?.description ?? row.description)
                        : t('none')}
                      {row.kind === 'condition' && meta?.formula ? (
                        <span className='text-muted-foreground ml-1'>
                          — {meta.formula}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className='px-3 py-2'> </td>
                  <td className='px-3 py-2'>
                    {isCond ? (
                      <span className='text-muted-foreground'>{t('none')}</span>
                    ) : (
                      <span className='inline-flex items-center'>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const stars =
                            (meta?.weight ??
                              meta?.level ??
                              (row as any).weight ??
                              (row as any).level ??
                              0) ||
                            0;
                          const filled = stars >= i + 1;
                          return (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                filled
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          );
                        })}
                        <span className='text-muted-foreground ml-1 text-xs'>
                          {(meta?.weight ??
                            meta?.level ??
                            (row as any).weight ??
                            (row as any).level ??
                            0) ||
                            0}
                        </span>
                      </span>
                    )}
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex items-center gap-2'>
                      <span className='text-muted-foreground'>
                        {isCond
                          ? '—'
                          : meta?.quizzes && meta.quizzes.length > 0
                            ? meta.quizzes.map((q) => q.name).join(', ')
                            : t('no_quiz')}
                      </span>
                      {/* {!isCond && (
                        <Button
                          size='sm'
                          onClick={() =>
                            goToQuizzes({
                              kind: row.kind,
                              name: (row as any).name
                            })
                          }
                        >
                          +Quiz
                        </Button>
                      )} */}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
