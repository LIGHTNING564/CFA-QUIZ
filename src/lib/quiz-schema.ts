import * as z from 'zod';
import type { QuizQuestion } from './types';

const optionSchema = z.object({
  label: z.string().trim().min(1, 'Option label is required'),
  value: z.string().trim().min(1, 'Option text is required'),
});

export const questionSchema = z.object({
  question_number: z.number().int().positive(),
  total_questions: z.number().int().positive(),
  question_id: z.number().int().positive(),
  text: z.string().trim().min(1, 'Question text is required'),
  options: z.array(optionSchema).min(2, 'At least two options are required'),
  correct_answer: z.string().trim().min(1, 'Correct answer is required'),
  explanation: z.string(),
  reference: z.string(),
});

export const quizContentSchema = z.array(questionSchema).min(1, 'A quiz needs at least one question');

export type ValidationIssue = {
  path: string;
  message: string;
};

export function validateQuizContent(input: unknown): {
  success: boolean;
  data?: QuizQuestion[];
  issues: ValidationIssue[];
} {
  const parsed = quizContentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.length ? issue.path.join('.') : 'quiz',
        message: issue.message,
      })),
    };
  }

  const questions = parsed.data;
  const issues: ValidationIssue[] = [];
  const expectedTotal = questions.length;
  const ids = new Set<number>();
  const labels = new Map<number, Set<string>>();

  questions.forEach((question, index) => {
    const human = `Question ${index + 1}`;

    if (question.total_questions !== expectedTotal) {
      issues.push({
        path: `${human}.total_questions`,
        message: `Expected ${expectedTotal}, received ${question.total_questions}.`,
      });
    }

    if (question.question_number !== index + 1) {
      issues.push({
        path: `${human}.question_number`,
        message: `Expected question number ${index + 1}.`,
      });
    }

    if (ids.has(question.question_id)) {
      issues.push({
        path: `${human}.question_id`,
        message: `Duplicate question_id ${question.question_id}.`,
      });
    }
    ids.add(question.question_id);

    const optionLabels = new Set<string>();
    question.options.forEach((option) => {
      if (optionLabels.has(option.label)) {
        issues.push({
          path: `${human}.options`,
          message: `Duplicate option label ${option.label}.`,
        });
      }
      optionLabels.add(option.label);
    });
    labels.set(index, optionLabels);

    if (!optionLabels.has(question.correct_answer)) {
      issues.push({
        path: `${human}.correct_answer`,
        message: `Correct answer ${question.correct_answer} does not match an option label.`,
      });
    }
  });

  return issues.length
    ? { success: false, issues }
    : { success: true, data: questions, issues: [] };
}



