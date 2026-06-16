'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useQuizData } from '@/components/quizzes/hooks';
import { Loader2 } from 'lucide-react';

export default function GenerateQuizPage() {
  const router = useRouter();
  const { templates: quizzes, loading: loadingQuizzes } = useQuizData();
  const [templateId, setTemplateId] = useState<string>('');
  const [candidateId, setCandidateId] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!templateId || !candidateId) {
      toast.error('Please select a template and enter a candidate ID');
      return;
    }

    try {
      setGenerating(true);
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          template_id: parseInt(templateId, 10),
          candidate_id: parseInt(candidateId, 10)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || errorData.error || 'Failed to generate quiz'
        );
      }

      const data = await response.json();

      // Extract quiz ID from various possible field names
      const quizId =
        data.id ||
        data.quiz_id ||
        data.quizId ||
        data.assessment_quiz_id ||
        (data.quiz && data.quiz.id);

      if (!quizId) {
        toast.error('Quiz generated but no quiz ID returned');
        return;
      }

      toast.success('Quiz generated successfully!');
      router.push(`/quiz/${quizId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to generate quiz';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className='container mx-auto max-w-2xl py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Generate Quiz</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='template'>Quiz Template</Label>
            {loadingQuizzes ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='h-4 w-4 animate-spin' />
                <span className='text-muted-foreground text-sm'>
                  Loading templates...
                </span>
              </div>
            ) : (
              <Select value={templateId} onValueChange={setTemplateId}>
                <SelectTrigger id='template'>
                  <SelectValue placeholder='Select a quiz template' />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id.toString()}>
                      {quiz.name} ({quiz.version})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='candidate'>Candidate ID</Label>
            <Input
              id='candidate'
              type='number'
              placeholder='Enter candidate ID'
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={
              generating || !templateId || !candidateId || loadingQuizzes
            }
            className='w-full'
          >
            {generating ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Generating...
              </>
            ) : (
              'Generate Quiz'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
