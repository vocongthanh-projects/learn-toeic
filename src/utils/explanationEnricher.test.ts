import { describe, it, expect } from 'vitest';
import type { Question } from '../types';
import {
  hasVietnamese,
  describeVerbForm,
  detectPart5FormRequirement,
  classifyConnector,
  detectPart5ConnectorContrast,
} from './explanationEnricher';

function makeP5Question(question: string, options: string[], correctAnswer: 'A' | 'B' | 'C' | 'D'): Question {
  const keys: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];
  return {
    id: 'test_q',
    part: 5,
    question,
    options: options.map((text, i) => ({ key: keys[i], text })),
    correctAnswer,
    knowledgeNodeIds: [],
    explanation: {},
  };
}

describe('hasVietnamese', () => {
  it('detects Vietnamese diacritics', () => {
    expect(hasVietnamese('Đây là tiếng Việt')).toBe(true);
  });

  it('returns false for plain English text', () => {
    expect(hasVietnamese('This is English text')).toBe(false);
  });

  it('returns false for empty/undefined input', () => {
    expect(hasVietnamese('')).toBe(false);
    expect(hasVietnamese(undefined)).toBe(false);
  });
});

describe('describeVerbForm', () => {
  it('classifies a to-infinitive', () => {
    expect(describeVerbForm('to leave').form).toBe('to-infinitive');
  });

  it('classifies a gerund', () => {
    expect(describeVerbForm('leaving').form).toBe('gerund');
  });

  it('classifies a known irregular past form', () => {
    expect(describeVerbForm('left').form).toBe('past');
  });

  it('classifies a regular -ed past form', () => {
    expect(describeVerbForm('worked').form).toBe('past');
  });

  it('classifies a third-person singular form', () => {
    expect(describeVerbForm('leaves').form).toBe('third-person');
  });

  it('falls back to bare infinitive / base form', () => {
    expect(describeVerbForm('leave').form).toBe('base');
  });
});

describe('detectPart5FormRequirement', () => {
  it('detects a preposition + gerund requirement (the reported bug case)', () => {
    const q = makeP5Question(
      'Employees should log out of the system before ______ the building.',
      ['leave', 'left', 'leaving', 'to leave'],
      'C'
    );
    const req = detectPart5FormRequirement(q);
    expect(req).not.toBeNull();
    expect(req?.form).toBe('gerund');
    expect(req?.trigger).toBe('before');
  });

  it('detects a modal + bare-infinitive requirement', () => {
    const q = makeP5Question(
      'Employees should ______ their badges at all times.',
      ['wear', 'wearing', 'wore', 'to wear'],
      'A'
    );
    const req = detectPart5FormRequirement(q);
    expect(req).not.toBeNull();
    expect(req?.form).toBe('base');
    expect(req?.trigger).toBe('should');
  });

  it('does not fire on a 5-underscore blank marker variant', () => {
    const q = makeP5Question(
      'Since _____ the sales team in 2019, Ms. Delacroix has doubled her regional revenue.',
      ['joins', 'joining', 'joined', 'join'],
      'B'
    );
    const req = detectPart5FormRequirement(q);
    expect(req).not.toBeNull();
    expect(req?.form).toBe('gerund');
  });

  it('does not fire when the blank is preceded by an article, not the preposition itself', () => {
    // The word immediately before the blank is "the", not "before" — no trigger word adjacent to
    // the blank, so this must not be treated as a preposition-triggers-gerund question.
    const q = makeP5Question(
      'Please review the report before the ______.',
      ['meeting', 'meetings', 'met', 'meet'],
      'A'
    );
    expect(detectPart5FormRequirement(q)).toBeNull();
  });

  it('returns null for questions with no blank marker', () => {
    const q = makeP5Question('This sentence has no blank at all.', ['a', 'b', 'c', 'd'], 'A');
    expect(detectPart5FormRequirement(q)).toBeNull();
  });
});

describe('classifyConnector', () => {
  it('classifies a subordinating conjunction', () => {
    expect(classifyConnector('Although').category).toBe('subordinating-conjunction');
  });

  it('classifies a reason/contrast preposition', () => {
    expect(classifyConnector('Despite').category).toBe('reason-contrast-preposition');
    expect(classifyConnector('Because of').category).toBe('reason-contrast-preposition');
  });

  it('classifies a conjunctive adverb', () => {
    expect(classifyConnector('Therefore').category).toBe('conjunctive-adverb');
  });

  it('classifies a coordinating conjunction', () => {
    expect(classifyConnector('but').category).toBe('coordinating-conjunction');
  });

  it('returns unknown for words outside the curated lists', () => {
    expect(classifyConnector('banana').category).toBe('unknown');
  });
});

describe('detectPart5ConnectorContrast', () => {
  it('fires when options span multiple connector categories (the "Although" case)', () => {
    const q = makeP5Question(
      '______ the renovation took longer than planned, the restaurant reopened on schedule.',
      ['Although', 'Because', 'Therefore', 'Whether'],
      'A'
    );
    const req = detectPart5ConnectorContrast(q);
    expect(req).not.toBeNull();
    expect(req?.category).toBe('subordinating-conjunction');
  });

  it('does not fire when the correct answer is not a recognized connector', () => {
    const q = makeP5Question('The ______ was approved yesterday.', ['proposal', 'propose', 'proposed', 'proposing'], 'A');
    expect(detectPart5ConnectorContrast(q)).toBeNull();
  });

  it('does not fire when all options fall in the same connector category (no real contrast to explain)', () => {
    const q = makeP5Question(
      '______ sales rose, profits fell.',
      ['Although', 'Though', 'While', 'Whereas'],
      'A'
    );
    expect(detectPart5ConnectorContrast(q)).toBeNull();
  });
});
