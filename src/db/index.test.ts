import { describe, it, expect } from 'vitest';
import { determineCognitiveStatus, calculateNextSrsState, convertToeicScore } from './index';

describe('determineCognitiveStatus', () => {
  it('marks a confident correct answer as mastered', () => {
    expect(determineCognitiveStatus(true, 'sure')).toBe('mastered');
    expect(determineCognitiveStatus(true, 'likely')).toBe('mastered');
  });

  it('marks an unconfident correct answer as a lucky guess', () => {
    expect(determineCognitiveStatus(true, 'guess')).toBe('lucky_guess');
    expect(determineCognitiveStatus(true, 'no_idea')).toBe('lucky_guess');
  });

  it('marks a confident wrong answer as a misconception', () => {
    expect(determineCognitiveStatus(false, 'sure')).toBe('misconception');
    expect(determineCognitiveStatus(false, 'likely')).toBe('misconception');
  });

  it('marks an unconfident wrong answer as a knowledge gap', () => {
    expect(determineCognitiveStatus(false, 'guess')).toBe('knowledge_gap');
    expect(determineCognitiveStatus(false, 'no_idea')).toBe('knowledge_gap');
  });
});

describe('calculateNextSrsState', () => {
  it('creates a fresh item in "learning" state on a first correct answer', () => {
    const item = calculateNextSrsState(undefined, 'u1', 'q1', true, 'sure');
    expect(item.state).toBe('learning');
    expect(item.reps).toBe(1);
    expect(item.lapses).toBe(0);
    expect(item.nextReview).toBeGreaterThan(Date.now());
  });

  it('creates a fresh item in "relearning" state on a first wrong answer', () => {
    const item = calculateNextSrsState(undefined, 'u1', 'q1', false, 'guess');
    expect(item.state).toBe('relearning');
    expect(item.lapses).toBe(1);
  });

  it('grows stability and lowers difficulty on a correct review', () => {
    const first = calculateNextSrsState(undefined, 'u1', 'q1', true, 'sure');
    const second = calculateNextSrsState(first, 'u1', 'q1', true, 'sure');
    expect(second.stability).toBeGreaterThan(first.stability);
    expect(second.difficulty).toBeLessThanOrEqual(first.difficulty);
    expect(second.reps).toBe(2);
    expect(second.state).toBe('review');
  });

  it('shrinks stability and raises difficulty (and lapses) on a failed review', () => {
    const first = calculateNextSrsState(undefined, 'u1', 'q1', true, 'sure');
    const second = calculateNextSrsState(first, 'u1', 'q1', false, 'no_idea');
    expect(second.stability).toBeLessThan(first.stability);
    expect(second.difficulty).toBeGreaterThan(first.difficulty);
    expect(second.lapses).toBe(1);
    expect(second.state).toBe('relearning');
  });
});

describe('convertToeicScore', () => {
  it('gives the minimum score for zero correct answers', () => {
    expect(convertToeicScore(0, 100).readingScore).toBe(5);
  });

  it('gives the maximum score for a perfect run', () => {
    expect(convertToeicScore(100, 100).readingScore).toBe(495);
  });

  it('stays within the valid 5-495 scaled range for any input', () => {
    for (let raw = 0; raw <= 100; raw += 5) {
      const { readingScore } = convertToeicScore(raw, 100);
      expect(readingScore).toBeGreaterThanOrEqual(5);
      expect(readingScore).toBeLessThanOrEqual(495);
      expect(readingScore % 5).toBe(0);
    }
  });

  it('handles a partial test (e.g. a 30-question mini test) via normalization', () => {
    const { readingScore } = convertToeicScore(30, 30);
    expect(readingScore).toBe(495);
  });
});
