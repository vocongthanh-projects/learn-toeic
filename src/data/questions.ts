import type { Question, Passage, ToeicTest } from '../types';
import rawQuestions from './question_bank/questions.json';
import rawPassages from './question_bank/passages.json';
import rawTests from './question_bank/tests.json';

export const QUESTION_BANK: Question[] = rawQuestions as Question[];
export const PASSAGES: Passage[] = rawPassages as Passage[];
export const TESTS: ToeicTest[] = rawTests as ToeicTest[];

// Backward compatibility for components importing SAMPLE_QUESTIONS
export const SAMPLE_QUESTIONS: Question[] = QUESTION_BANK;

export function getQuestionById(id: string): Question | undefined {
  return QUESTION_BANK.find(q => q.id === id);
}

export function getQuestionsByPart(part: number): Question[] {
  return QUESTION_BANK.filter(q => q.part === part);
}

export function getQuestionsByTest(testId: string): Question[] {
  return QUESTION_BANK.filter(q => q.testId === testId);
}

export function getPassageById(passageId: string): Passage | undefined {
  return PASSAGES.find(p => p.id === passageId);
}
