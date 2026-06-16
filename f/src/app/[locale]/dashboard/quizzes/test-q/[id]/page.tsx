'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams
} from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface QuizQuestion {
  id: number;
  text?: string;
  question?: string;
  question_text?: string;
  expected_duration?: number;
  choices?: Array<{
    id?: number | string;
    choice_id?: number | string;
    value?: string;
    text?: string;
    choice_text?: string;
    label?: string;
  }>;
  type?: string;
  question_type?: string;
}

interface QuizDetails {
  id: number;
  template?: string;
  template_name?: string;
  skill?: string;
  skill_name?: string;
  questions: QuizQuestion[];
}

export default function ViewQuizPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [quiz, setQuiz] = useState<QuizDetails | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, (number | string)[]>>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const locale = pathname.split('/')[1] || 'en';

  const handleSubmit = useCallback(async () => {
    if (!id) return;

    const normalize = (val: number | string) => {
      if (typeof val === 'number') return val;
      const num = Number(val);
      return Number.isFinite(num) && String(num) === String(val) ? num : val;
    };

    const payload = {
      answers: Object.entries(answers).map(([qid, selected]) => ({
        question_id: Number(qid),
        selected_choices: selected.map(normalize)
      }))
    };

    try {
      const res = await fetch(`/api/quiz/${id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Failed to submit quiz: ${res.status}`);
      }

      const data = await res.json();

      // Skills quizzes have scores, interview/satisfaction/other don't
      if (data.total_score !== null && data.total_score !== undefined) {
        setScore(data.total_score);
      } else {
        // For non-scored quizzes (interview, satisfaction, other)
        setScore(null);
      }
      setSubmitted(true);
    } catch (error) {
      setScore(null);
      setSubmitted(true);
    }
  }, [id, answers]);

  const nextQuestion = useCallback(() => {
    if (!quiz) return;
    const nextIndex = current + 1;
    if (nextIndex < quiz.questions.length) {
      setCurrent(nextIndex);
      setTimeLeft(quiz.questions[nextIndex]?.expected_duration || 30);
    } else {
      handleSubmit();
    }
  }, [quiz, current, handleSubmit]);

  useEffect(() => {
    if (!id) return;

    const requestedCount = searchParams.get('count');
    const requestedCountNumber = requestedCount
      ? parseInt(requestedCount, 10)
      : undefined;

    fetch(`/api/quiz/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch quiz: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const totalQuestions = data.questions || [];
        const limitedQuestions =
          requestedCountNumber && requestedCountNumber > 0
            ? totalQuestions.slice(0, requestedCountNumber)
            : totalQuestions;

        setQuiz({ ...data, questions: limitedQuestions });
        setTimeLeft(limitedQuestions?.[0]?.expected_duration || 30);
      })
      .catch(() => {
        setQuiz(null);
      });
  }, [id, searchParams]);

  useEffect(() => {
    if (!quiz || submitted) return;
    if (timeLeft <= 0) {
      nextQuestion();
      return;
    }

    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quiz, submitted, nextQuestion]);

  const templateName = quiz?.template_name || quiz?.template || 'Template';
  const skillName = quiz?.skill_name || quiz?.skill || 'Skill';
  const quizTitle = `${templateName} — ${skillName}`;

  if (!quiz) {
    return (
      <section className='container mx-auto max-w-3xl py-10'>
        <Card>
          <CardHeader>
            <CardTitle>Quiz Not Found</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground text-sm'>
              We could not load this quiz instance. Please generate a new quiz
              from the test page.
            </p>
            <Button
              variant='outline'
              onClick={() => router.push(`/${locale}/dashboard/quizzes/test-q`)}
            >
              Back to Test Quiz
            </Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className='container mx-auto max-w-3xl py-10'>
        <Card>
          <CardHeader>
            <CardTitle>{quizTitle}</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-muted-foreground text-sm'>Quiz completed.</p>
            <div className='rounded-md border p-6 text-center'>
              {score !== null && score !== undefined ? (
                <p className='text-2xl font-bold text-green-600'>
                  Score: {score} / {quiz.questions.length}
                </p>
              ) : (
                <div className='space-y-2'>
                  <p className='text-xl font-semibold text-blue-600'>
                    Responses Submitted Successfully
                  </p>
                  <p className='text-muted-foreground text-sm'>
                    This quiz does not have a score. Your responses have been
                    recorded.
                  </p>
                </div>
              )}
            </div>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() =>
                  router.push(`/${locale}/dashboard/quizzes/test-q`)
                }
              >
                Back to Test Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const currentQuestion = quiz.questions[current];
  const questionText =
    currentQuestion.text ||
    currentQuestion.question ||
    currentQuestion.question_text ||
    'Untitled question';

  const rawChoices = currentQuestion.choices || [];
  const questionType = (
    currentQuestion.type ||
    currentQuestion.question_type ||
    ''
  ).toLowerCase();
  const isYesNo = questionType === 'yesno' || questionType === 'yes_no';

  const choices = rawChoices.length
    ? rawChoices.map((choice) => {
        const choiceId = choice.id || choice.choice_id || choice.value || '';
        const choiceData = {
          id: choiceId,
          text:
            choice.text ||
            choice.choice_text ||
            choice.label ||
            String(choice.value)
        };
        if (current === 0) {
        }
        return choiceData;
      })
    : isYesNo
      ? [
          { id: 'yes', text: 'Yes' },
          { id: 'no', text: 'No' }
        ]
      : [];

  const handleChoiceToggle = (
    questionId: number,
    choiceId: number | string
  ) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || [];
      if (isYesNo) {
        return { ...prev, [questionId]: [choiceId] };
      }

      const updated = existing.includes(choiceId)
        ? existing.filter((value) => value !== choiceId)
        : [...existing, choiceId];
      return { ...prev, [questionId]: updated };
    });
  };

  const progress = ((current + 1) / quiz.questions.length) * 100;

  return (
    <section className='container mx-auto max-w-4xl py-10'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold'>{quizTitle}</h1>
          <p className='text-muted-foreground text-sm'>
            Question {current + 1} of {quiz.questions.length} — {timeLeft}s
            remaining
          </p>
        </div>
        <Button
          variant='outline'
          onClick={() => router.push(`/${locale}/dashboard/quizzes/test-q`)}
        >
          Back to Test Page
        </Button>
      </div>

      <Card className='mt-6'>
        <CardHeader>
          <div className='flex flex-wrap items-center gap-3'>
            <CardTitle className='text-lg font-semibold'>
              {questionText}
            </CardTitle>
            <Badge variant='outline'>#{current + 1}</Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-5'>
          <Progress value={progress} />
          <Separator />
          <div className='space-y-3'>
            {choices.length === 0 ? (
              <p className='text-muted-foreground text-sm'>
                No answer choices provided for this question.
              </p>
            ) : (
              choices.map((choice) => (
                <label
                  key={choice.id}
                  className='hover:bg-muted flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm'
                >
                  <input
                    type={isYesNo ? 'radio' : 'checkbox'}
                    name={`question-${currentQuestion.id}`}
                    className='h-4 w-4'
                    checked={
                      answers[currentQuestion.id]?.includes(choice.id) || false
                    }
                    onChange={() =>
                      handleChoiceToggle(currentQuestion.id, choice.id)
                    }
                  />
                  <span>{choice.text}</span>
                </label>
              ))
            )}
          </div>

          <div className='flex justify-end gap-2'>
            <Button
              variant='outline'
              onClick={() => router.push(`/${locale}/dashboard/quizzes/test-q`)}
            >
              Cancel
            </Button>
            <Button onClick={nextQuestion} disabled={choices.length === 0}>
              {current + 1 === quiz.questions.length ? 'Submit' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
