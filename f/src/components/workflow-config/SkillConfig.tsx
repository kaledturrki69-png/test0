'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { QuizService } from '@/services/quiz-service';
import { QuizTemplate, QuizLevel } from '@/types/quiz';
import { Skill } from '@/types/skill';
import { Loader2 } from 'lucide-react';
import { logger } from '@/lib/logger';
import { useWorkflowConfig } from './use-workflow-config';
import { useTranslations } from 'next-intl';

interface SkillConfigProps {
  node: any;
  nodes?: any[];
  onConfigChange?: (config: any) => void;
  skillType: 'hard' | 'soft';
  positionId?: number;
}

export function SkillConfig({
  node,
  nodes = [],
  onConfigChange,
  skillType,
  positionId
}: SkillConfigProps) {
  const { data: session } = useSession();
  const { saveConfig, getConfig } = useWorkflowConfig(node, onConfigChange);
  const t = useTranslations('workflow_config');

  // Configuration based on skill type
  const config = {
    title: skillType === 'hard' ? t('skill.title_hard') : t('skill.title_soft'),
    placeholder:
      skillType === 'hard'
        ? t('skill.placeholder_hard')
        : t('skill.placeholder_soft'),
    defaultLevel: 'low' as QuizLevel,
    defaultMode: 'online' as const
  };

  // Initialize from saved config or defaults
  const [selectedSkill, setSelectedSkill] = useState<number | null>(
    getConfig('selectedSkill', null)
  );
  const [selectedLevel, setSelectedLevel] = useState<QuizLevel>(
    getConfig('selectedLevel', config.defaultLevel)
  );
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(
    getConfig('selectedQuiz', null)
  );
  const mode = getConfig('mode', config.defaultMode);

  // Initialize mode and selectedLevel, ensure they're saved to config
  useEffect(() => {
    const nodeConfig = node?.data?.config || {};
    const updates: any = {};

    if (!nodeConfig.mode) {
      updates.mode = config.defaultMode;
    }

    if (
      nodeConfig.selectedLevel === undefined ||
      nodeConfig.selectedLevel === null ||
      nodeConfig.selectedLevel === ''
    ) {
      updates.selectedLevel = config.defaultLevel;
    }

    if (Object.keys(updates).length > 0) {
      saveConfig(updates);
    }
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [quizzes, setQuizzes] = useState<QuizTemplate[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [positionSkillIds, setPositionSkillIds] = useState<number[]>([]);

  // Fetch position skills when positionId is provided
  useEffect(() => {
    const fetchPositionSkills = async () => {
      if (!positionId || !session?.accessToken) {
        setPositionSkillIds([]);
        return;
      }

      try {
        const response = await fetch(`/api/positions/${positionId}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` }
        });
        if (response.ok) {
          const position = await response.json();
          // Get skill IDs based on skill type
          const skillArray =
            skillType === 'hard'
              ? position.hard_skills || []
              : position.soft_skills || [];
          const skillIds = skillArray.map((sw: { id: number }) => sw.id);
          setPositionSkillIds(skillIds);
        }
      } catch (error) {
        logger.error('Failed to fetch position skills', error);
        setPositionSkillIds([]);
      }
    };

    fetchPositionSkills();
  }, [positionId, session?.accessToken, skillType]);

  // Sync state when node changes (e.g., when switching between nodes)
  useEffect(() => {
    const nodeConfig = node?.data?.config || {};
    setSelectedSkill(
      nodeConfig.selectedSkill !== undefined ? nodeConfig.selectedSkill : null
    );

    const level =
      nodeConfig.selectedLevel !== undefined &&
      nodeConfig.selectedLevel !== null &&
      nodeConfig.selectedLevel !== ''
        ? nodeConfig.selectedLevel
        : config.defaultLevel;
    setSelectedLevel(level as QuizLevel);

    setSelectedQuiz(
      nodeConfig.selectedQuiz !== undefined ? nodeConfig.selectedQuiz : null
    );
  }, [node?.id, config.defaultLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch skills based on type
  useEffect(() => {
    const fetchSkills = async () => {
      if (!session?.accessToken) return;

      try {
        const response = await fetch(`/api/skills?type=${skillType}`, {
          headers: { Authorization: `Bearer ${session.accessToken}` }
        });
        if (response.ok) {
          const data = await response.json();
          let filteredSkills = Array.isArray(data)
            ? data.filter((skill: Skill) => skill.type === skillType)
            : [];

          // If positionId is provided, filter skills to only show skills that belong to that position
          if (positionId && positionSkillIds.length > 0) {
            filteredSkills = filteredSkills.filter((skill) =>
              positionSkillIds.includes(skill.id)
            );
          }

          setSkills(filteredSkills);
        }
      } catch (error) {
        logger.error(`Failed to fetch ${skillType} skills`, error);
      }
    };

    fetchSkills();
  }, [session?.accessToken, skillType, positionId, positionSkillIds]);

  // Fetch quizzes when skill is selected
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!selectedSkill || !session?.accessToken) {
        setQuizzes([]);
        return;
      }

      try {
        setLoadingQuizzes(true);
        const templates = await QuizService.getTemplates(
          session.accessToken,
          selectedSkill,
          selectedLevel ? selectedLevel : undefined
        );
        setQuizzes(templates || []);
      } catch (error) {
        logger.error('Failed to fetch quizzes', error);
        setQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    fetchQuizzes();
  }, [selectedSkill, selectedLevel, session?.accessToken]);

  // 🧩 Auto-generate caption (not visible in UI, just stored)
  useEffect(() => {
    const skillName =
      skills.find((s) => s.id === selectedSkill)?.name || t('skill.no_skill');
    const quizName =
      quizzes.find((q) => q.id === selectedQuiz)?.name || t('skill.no_quiz');
    const modeLabel =
      mode === 'onsite' ? t('skill.mode_onsite') : t('skill.mode_online');
    const caption = t('skill.caption', {
      skill: skillName,
      quiz: quizName,
      mode: modeLabel
    });
    saveConfig({ caption });
  }, [selectedSkill, selectedQuiz, quizzes, skills, mode, t]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card className='bg-muted/30'>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        <div className='space-y-2'>
          <Label>{t('skill.skill_label')}</Label>
          <Select
            value={selectedSkill?.toString() || ''}
            onValueChange={(value) => {
              const skillId = value ? parseInt(value) : null;
              setSelectedSkill(skillId);
              setSelectedQuiz(null);
              saveConfig({ selectedSkill: skillId, selectedQuiz: null });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder={config.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {skills.map((skill) => (
                <SelectItem key={skill.id} value={skill.id.toString()}>
                  {skill.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label>{t('skill.mode_label')}</Label>
          <Select
            value={getConfig('mode', config.defaultMode)}
            onValueChange={(value) => {
              saveConfig({ mode: value });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='online'>{t('skill.mode_online')}</SelectItem>
              <SelectItem value='onsite'>{t('skill.mode_onsite')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedSkill && (
          <>
            <div className='space-y-2'>
              <Label>{t('skill.quiz_label')}</Label>
              {loadingQuizzes ? (
                <div className='flex items-center justify-center py-4'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                </div>
              ) : (
                <Select
                  value={selectedQuiz?.toString() || ''}
                  onValueChange={(value) => {
                    const quizId = value ? parseInt(value) : null;
                    setSelectedQuiz(quizId);
                    saveConfig({ selectedQuiz: quizId });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t('skill.select_quiz_placeholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.length === 0 ? (
                      <div className='text-muted-foreground px-2 py-1.5 text-sm'>
                        {t('skill.no_quizzes')}
                      </div>
                    ) : (
                      quizzes
                        .filter((quiz) => {
                          if (
                            !selectedSkill ||
                            quiz.skill !== selectedSkill ||
                            !skills.some((skill) => skill.id === quiz.skill)
                          ) {
                            return false;
                          }

                          const isSelectedInOtherNode = nodes.some((n) => {
                            if (n.id === node.id) return false;
                            const nodeType = n.data?.type;
                            if (nodeType !== 'hard' && nodeType !== 'soft')
                              return false;
                            const nodeSelectedQuiz =
                              n.data?.config?.selectedQuiz;
                            return nodeSelectedQuiz === quiz.id;
                          });

                          const isSelectedInCurrentNode =
                            getConfig('selectedQuiz') === quiz.id;
                          return (
                            !isSelectedInOtherNode || isSelectedInCurrentNode
                          );
                        })
                        .map((quiz) => (
                          <SelectItem key={quiz.id} value={quiz.id.toString()}>
                            {quiz.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
