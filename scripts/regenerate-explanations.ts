import fs from 'node:fs';
import path from 'node:path';
import type { Question } from '../src/types';
import { enrichExplanation } from './enricher';

// Re-runs only the explanation enrichment (translation, grammarBreakdown, distractors,
// whyYouGotItWrong, quickTrick, wordFamily, keyVocabulary) over the already-assembled
// question bank, in place. Unlike build-question-bank.ts, this does NOT re-parse raw
// sources, re-dedupe, or reassign testId/questionNumber/passageId — it only touches
// the `explanation` field so test assembly stays stable.
function main() {
  const rootDir = process.cwd();
  const questionsPath = path.join(rootDir, 'src/data/question_bank/questions.json');

  const questions: Question[] = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
  console.log(`Loaded ${questions.length} questions.`);

  let changed = 0;
  for (const q of questions) {
    const before = JSON.stringify(q.explanation);
    q.explanation = enrichExplanation(q);
    if (JSON.stringify(q.explanation) !== before) {
      changed++;
    }
  }

  fs.writeFileSync(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`Regenerated explanations. ${changed} of ${questions.length} questions changed.`);
}

main();
