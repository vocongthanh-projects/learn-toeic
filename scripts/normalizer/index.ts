import type { Question, Option, QuestionExplanation } from '../../src/types';
import type { ParsedItem } from '../parser';

const KEY_MAP: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

export function normalizeQuestion(item: ParsedItem): Question {
  const part = item.part;
  const section: 'listening' | 'reading' = part <= 4 ? 'listening' : 'reading';

  // Normalize Options
  const expectedChoicesCount = part === 2 ? 3 : 4;
  const normalizedOptions: Option[] = [];
  for (let i = 0; i < expectedChoicesCount; i++) {
    const rawChoice = item.choices[i];
    const text = rawChoice !== undefined ? String(rawChoice).trim() : '';
    normalizedOptions.push({
      key: KEY_MAP[i],
      text: cleanText(text),
    });
  }

  // Normalize Answer
  let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A';
  if (typeof item.rawAnswer === 'number') {
    if (item.rawAnswer >= 0 && item.rawAnswer < KEY_MAP.length) {
      correctAnswer = KEY_MAP[item.rawAnswer];
    }
  } else if (typeof item.rawAnswer === 'string') {
    const upper = item.rawAnswer.trim().toUpperCase();
    if (upper === 'A' || upper === 'B' || upper === 'C' || upper === 'D') {
      correctAnswer = upper;
    } else {
      // Find matching text in choices
      const idx = item.choices.findIndex(c => String(c).trim().toLowerCase() === item.rawAnswer.toString().trim().toLowerCase());
      if (idx >= 0 && idx < KEY_MAP.length) {
        correctAnswer = KEY_MAP[idx];
      }
    }
  }

  // Normalize Difficulty
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  if (item.rawDifficulty) {
    const d = item.rawDifficulty.toLowerCase();
    if (d.includes('400') || d.includes('easy')) difficulty = 'easy';
    else if (d.includes('800') || d.includes('hard')) difficulty = 'hard';
    else difficulty = 'medium';
  }

  // Normalize Explanation
  const explanation: QuestionExplanation = {
    translation: item.rawTranslation?.trim() || null,
    grammarBreakdown: item.rawExplanation?.trim() || null,
    distractors: null,
    whyYouGotItWrong: null,
    quickTrick: null,
  };

  return {
    id: item.id,
    part,
    section,
    questionNumber: item.questionNumber,
    passageId: item.passageId,
    audioUrl: item.audioUrl,
    transcript: item.transcript ? cleanText(item.transcript) : undefined,
    image: item.image,
    question: cleanText(item.question),
    options: normalizedOptions,
    correctAnswer,
    questionType: item.rawCategory || getDefaultQuestionType(part),
    difficulty,
    knowledgeNodeIds: [],
    tags: item.tags || [],
    evidence: item.evidence,
    evidenceLocation: item.evidenceLocation,
    choiceNotes: item.choiceNotes,
    explanation,
    source: item.source,
  };
}

export function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function getDefaultQuestionType(part: number): string {
  switch (part) {
    case 1: return 'photo_description';
    case 2: return 'question_response';
    case 3: return 'conversation';
    case 4: return 'short_talk';
    case 5: return 'incomplete_sentence';
    case 6: return 'text_completion';
    case 7: return 'reading_comprehension';
    default: return 'general';
  }
}
