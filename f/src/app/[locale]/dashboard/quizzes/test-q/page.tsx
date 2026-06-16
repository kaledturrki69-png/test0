'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useQuizData } from '@/components/quizzes/hooks';
import { Loader2 } from 'lucide-react';

export default function TestQuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { templates, loading: loadingTemplates } = useQuizData();

  const initialTemplateId = searchParams.get('templateId') || '';
  const [templateId, setTemplateId] = useState<string>(initialTemplateId);
  const [questionCount, setQuestionCount] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const isViewMode = !!initialTemplateId;

  const locale = pathname.split('/')[1] || 'en';

  const selectedTemplate = useMemo(
    () => templates.find((tpl) => String(tpl.id) === String(templateId)),
    [templates, templateId]
  );

  useEffect(() => {
    if (initialTemplateId) {
      setTemplateId(initialTemplateId);
    }
  }, [initialTemplateId]);

  useEffect(() => {
    if (!selectedTemplate) {
      setQuestionCount('');
      return;
    }

    const defaultCount = selectedTemplate.default_question_count;
    if (defaultCount) {
      setQuestionCount(String(defaultCount));
    } else {
      setQuestionCount('');
    }
  }, [selectedTemplate]);

  const handleView = async () => {
    if (!templateId) {
      toast.error('Please select a template to test.');
      return;
    }

    const totalQuestions = selectedTemplate?.default_question_count || 0;
    const selectedCount = questionCount
      ? parseInt(questionCount, 10)
      : totalQuestions;

    if (selectedCount <= 0 || Number.isNaN(selectedCount)) {
      toast.error('Please enter a valid number of questions to test.');
      return;
    }

    if (totalQuestions && selectedCount > totalQuestions) {
      toast.error(`This template only has ${totalQuestions} questions.`);
      return;
    }

    try {
      setGenerating(true);

      const payload: Record<string, number> = {
        template_id: parseInt(templateId, 10)
      };

      if (selectedCount > 0) {
        payload.question_count = selectedCount;
      }

      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || 'Failed to generate quiz'
        );
      }

      const data = await response.json();

      const quizId =
        data.id ||
        data.quiz_id ||
        data.quizId ||
        data.assessment_quiz_id ||
        (data.quiz && data.quiz.id);

      if (!quizId) {
        toast.error('Quiz generated but quiz ID was not returned.');
        return;
      }

      toast.success('Quiz ready! Opening test view.');
      const countQuery = selectedCount > 0 ? `?count=${selectedCount}` : '';
      router.push(`/${locale}/dashboard/quizzes/test-q/${quizId}${countQuery}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate quiz';
      toast.error(message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className='container mx-auto max-w-3xl py-10'>
      <div className='space-y-6'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-semibold'>Test Quiz</h1>
            <p className='text-muted-foreground mt-2 text-sm'>
              Quickly generate a quiz instance for any template. Template
              selection is required; candidate ID is optional.
            </p>
          </div>
          <Button
            variant='ghost'
            size='sm'
            className='gap-2'
            onClick={() => router.push(`/${locale}/dashboard/quizzes`)}
          >
            <IconArrowLeft className='h-4 w-4' />
            Back to Quizzes
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Test Quiz</CardTitle>
            <CardDescription>
              {isViewMode
                ? 'Review the selected template and configure test settings.'
                : 'Select a template to generate a test quiz.'}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='template-select'>Template *</Label>
              {loadingTemplates ? (
                <div className='text-muted-foreground flex items-center gap-2 text-sm'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Loading templates...
                </div>
              ) : isViewMode && selectedTemplate ? (
                <div className='border-input bg-background flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm'>
                  <span className='text-foreground'>
                    {selectedTemplate.name} ({selectedTemplate.version})
                  </span>
                </div>
              ) : (
                <Select
                  value={templateId}
                  onValueChange={setTemplateId}
                  disabled={isViewMode}
                >
                  <SelectTrigger id='template-select'>
                    <SelectValue placeholder='Select a quiz template' />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id.toString()}>
                        {tpl.name} ({tpl.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {selectedTemplate && (
              <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
                <p>
                  <span className='text-foreground font-medium'>Skill:</span>{' '}
                  {selectedTemplate.skill_name || selectedTemplate.skill}
                </p>
                <p>
                  <span className='text-foreground font-medium'>
                    Questions:
                  </span>{' '}
                  {selectedTemplate.default_question_count}
                </p>
                <p>
                  <span className='text-foreground font-medium'>
                    Description:
                  </span>{' '}
                  {selectedTemplate.description || 'No description provided.'}
                </p>
              </div>
            )}

            <div className='space-y-2'>
              <Label htmlFor='question-count'>
                Number of questions to test
              </Label>
              <Input
                id='question-count'
                type='number'
                min={1}
                max={selectedTemplate?.default_question_count || undefined}
                placeholder='Enter number of questions'
                value={questionCount}
                onChange={(event) => setQuestionCount(event.target.value)}
              />
              {selectedTemplate && (
                <p className='text-muted-foreground text-xs'>
                  Template has {selectedTemplate.default_question_count}{' '}
                  question(s). You can test fewer if desired.
                </p>
              )}
            </div>

            <Button
              className='w-full'
              onClick={handleView}
              disabled={generating || !templateId || loadingTemplates}
            >
              {generating ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Preparing quiz...
                </>
              ) : (
                'View Quiz'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
