import { Question, ApiQuestion, QuestionType } from '@/types/question';

/**
 * Convert time limit from local format to API expected_duration (always in seconds)
 */
function convertTimeToSeconds(
  timeLimit: number,
  timeUnit: 'seconds' | 'minutes' | 'hours'
): number {
  switch (timeUnit) {
    case 'seconds':
      return timeLimit;
    case 'minutes':
      return timeLimit * 60;
    case 'hours':
      return timeLimit * 3600;
    default:
      return timeLimit;
  }
}

/**
 * Convert time from seconds to local format
 */
function convertSecondsToTime(seconds: number): {
  timeLimit: number;
  timeUnit: 'seconds' | 'minutes' | 'hours';
} {
  if (seconds < 60) {
    return { timeLimit: seconds, timeUnit: 'seconds' };
  } else if (seconds < 3600) {
    return { timeLimit: Math.round(seconds / 60), timeUnit: 'minutes' };
  } else {
    return { timeLimit: Math.round(seconds / 3600), timeUnit: 'hours' };
  }
}

/**
 * Convert QuestionType to API type format
 */
function convertQuestionType(type: QuestionType): ApiQuestion['type'] {
  if (type === 'yes_no') {
    return 'yesno';
  }
  return type as ApiQuestion['type'];
}

/**
 * Convert API type to QuestionType
 */
function convertApiTypeToQuestionType(type: ApiQuestion['type']): QuestionType {
  if (type === 'yesno') {
    return 'yes_no';
  }
  return type as QuestionType;
}

/**
 * Convert local Question to API ApiQuestion format
 * @param question - Local question object
 */
export function questionToApi(question: Question): Partial<ApiQuestion> {
  // Convert choices from answers
  // API expects choices without IDs for both create and update
  const choices = question.answers.map((answer) => ({
    text: answer.text,
    is_correct: answer.isCorrect,
    weight: answer.weight || 0
  }));

  const apiQuestion: Partial<ApiQuestion> = {
    text: question.questionText,
    type: convertQuestionType(question.type),
    difficulty:
      typeof question.difficulty === 'number' &&
      question.difficulty >= 1 &&
      question.difficulty <= 5
        ? question.difficulty
        : 3,
    expected_duration: convertTimeToSeconds(
      question.timeLimit,
      question.timeUnit
    ),
    max_score: Math.max(1, question.score ?? 1),
    is_active: true,
    order: 0,
    choices: choices.length > 0 ? choices : [],
    translations: [],
    template: question.quizId ?? null,
    category: question.categoryId ?? null
  };

  if (question.type === 'yes_no' && question.correctYesNoAnswer) {
    apiQuestion.expected_value =
      question.correctYesNoAnswer === 'yes' ? 'yes' : 'no';
  }
  return apiQuestion;
}

/**
 * Convert API ApiQuestion to local Question format
 */
export function apiToQuestion(apiQuestion: ApiQuestion): Question {
  const { timeLimit, timeUnit } = convertSecondsToTime(
    apiQuestion.expected_duration
  );

  const answers = apiQuestion.choices.map((choice, index) => ({
    id: choice.id || `choice-${index}`,
    text: choice.text,
    isCorrect: choice.is_correct,
    weight: choice.weight
  }));

  // Handle yesno expected_value
  let correctYesNoAnswer: 'yes' | 'no' | null = null;
  if (apiQuestion.type === 'yesno' && apiQuestion.expected_value) {
    correctYesNoAnswer = apiQuestion.expected_value === 'yes' ? 'yes' : 'no';
  }

  return {
    id: apiQuestion.id || `question-${Date.now()}`,
    quizId: apiQuestion.template,
    categoryId: apiQuestion.category,
    type: convertApiTypeToQuestionType(apiQuestion.type),
    difficulty: apiQuestion.difficulty ?? 3,
    languageMode: 'FLEXIBLE', // Default, can be enhanced later
    questionText: apiQuestion.text,
    answers,
    correctYesNoAnswer,
    timeLimit,
    timeUnit,
    score: apiQuestion.max_score > 0 ? apiQuestion.max_score : 1,
    isExpanded: false,
    createdAt: apiQuestion.created_at,
    updatedAt: apiQuestion.updated_at
  };
}
