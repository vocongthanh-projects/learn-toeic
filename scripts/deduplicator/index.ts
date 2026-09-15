import type { Question, Passage } from '../../src/types';

export interface DeduplicateResult {
  uniqueQuestions: Question[];
  uniquePassages: Passage[];
  duplicatesRemoved: number;
  duplicateLog: Array<{ id: string; reason: string; matchedWithId: string }>;
}

export function deduplicate(
  questions: Question[],
  passages: Passage[]
): DeduplicateResult {
  const seenIds = new Set<string>();
  const seenContentSignatures = new Map<string, string>(); // signature -> firstId
  const duplicateLog: Array<{ id: string; reason: string; matchedWithId: string }> = [];
  const uniqueQuestions: Question[] = [];

  const passageMap = new Map<string, Passage>();
  for (const p of passages) {
    passageMap.set(p.id, { ...p, questionIds: [...p.questionIds] });
  }

  for (const q of questions) {
    // 1. Duplicate ID check
    if (seenIds.has(q.id)) {
      duplicateLog.push({ id: q.id, reason: 'duplicate_question_id', matchedWithId: q.id });
      continue;
    }

    // 2. Generate Content Signature based on Part
    const signature = generateSignature(q, passageMap.get(q.passageId || ''));

    if (seenContentSignatures.has(signature)) {
      const existingId = seenContentSignatures.get(signature)!;
      duplicateLog.push({
        id: q.id,
        reason: 'duplicate_content_match',
        matchedWithId: existingId,
      });
      continue;
    }

    seenIds.add(q.id);
    seenContentSignatures.set(signature, q.id);
    uniqueQuestions.push(q);
  }

  // 3. Clean up passage questionIds to only include kept questions
  const keptQuestionIds = new Set(uniqueQuestions.map(q => q.id));
  const uniquePassages: Passage[] = [];

  for (const p of passageMap.values()) {
    p.questionIds = p.questionIds.filter(id => keptQuestionIds.has(id));
    if (p.questionIds.length > 0) {
      uniquePassages.push(p);
    }
  }

  return {
    uniqueQuestions,
    uniquePassages,
    duplicatesRemoved: duplicateLog.length,
    duplicateLog,
  };
}

function normalizeStr(s?: string): string {
  if (!s) return '';
  return s
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function generateSignature(q: Question, passage?: Passage): string {
  const normQ = normalizeStr(q.question);
  const normChoices = q.options.map(o => normalizeStr(o.text)).sort().join('|');

  // Part 1: photograph comparison
  if (q.part === 1) {
    return `p1_${normalizeStr(q.transcript)}_${normChoices}`;
  }

  // Part 2: listening question response comparison
  if (q.part === 2) {
    return `p2_${normalizeStr(q.transcript || q.question)}_${normChoices}`;
  }

  // Part 3 & 4: conversation/talk comparison
  if (q.part === 3 || q.part === 4) {
    const transcript = normalizeStr(passage?.transcript || q.transcript);
    return `p${q.part}_${transcript.slice(0, 100)}_${normQ}_${normChoices}`;
  }

  // Part 5: sentence fill-in-the-blank comparison
  if (q.part === 5) {
    return `p5_${normQ}_${normChoices}`;
  }

  // Part 6 & 7: passage reading comparison
  if (q.part === 6 || q.part === 7) {
    const pContent = normalizeStr(passage?.content).slice(0, 100);
    return `p${q.part}_${pContent}_${normQ}_${normChoices}`;
  }

  return `${q.part}_${normQ}_${normChoices}`;
}
