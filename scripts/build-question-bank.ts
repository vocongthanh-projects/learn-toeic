import fs from 'node:fs';
import path from 'node:path';
import type { Question, Passage, ToeicTest } from '../src/types';
import { parseAllSources } from './parser';
import { normalizeQuestion } from './normalizer';
import { deduplicate } from './deduplicator';
import { enrichQuestion } from './enricher';

async function buildQuestionBank() {
  console.log('=== STARTING TOEIC QUESTION BANK BUILD PIPELINE ===\n');
  const rootDir = process.cwd();

  // 1. Data Acquisition & Parsing
  console.log('Step 1: Parsing raw sources...');
  const { questions: allRawQuestions, passages: allRawPassages } = parseAllSources(rootDir);
  // Keep only Reading (Part 5, Part 6, Part 7)
  const rawQuestions = allRawQuestions.filter(q => q.part >= 5);
  const rawPassages = allRawPassages.filter(p => p.part >= 5);
  console.log(`  ✓ Parsed ${rawQuestions.length} Reading questions and ${rawPassages.length} Reading passages (Listening removed).`);

  // 2. Normalization
  console.log('Step 2: Normalizing questions...');
  const normalizedQuestions = rawQuestions.map(normalizeQuestion);
  console.log(`  ✓ Normalized ${normalizedQuestions.length} questions.`);

  // 3. Deduplication
  console.log('Step 3: Deduplicating content...');
  const { uniqueQuestions, uniquePassages, duplicatesRemoved, duplicateLog } = deduplicate(
    normalizedQuestions,
    rawPassages
  );
  console.log(`  ✓ Deduplication complete. Removed ${duplicatesRemoved} duplicates.`);
  console.log(`  ✓ Retained ${uniqueQuestions.length} unique questions and ${uniquePassages.length} unique passages.`);

  // 4. Content Enrichment
  console.log('Step 4: Enriching questions (Classification, KnowledgeNode, Vietnamese Explanation)...');
  const enrichedQuestions = uniqueQuestions.map(enrichQuestion);
  console.log(`  ✓ Enriched ${enrichedQuestions.length} questions.`);

  // 5. Test Assembly & Part Distribution
  console.log('Step 5: Assembling tests (Target: 10 Full Reading Tests, 100 questions/test)...');
  const { tests, questions: finalQuestions, passages: finalPassages } = assembleTests(
    enrichedQuestions,
    uniquePassages
  );

  // 6. Write to src/data/question_bank
  const outDir = path.join(rootDir, 'src/data/question_bank');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(path.join(outDir, 'questions.json'), JSON.stringify(finalQuestions, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'passages.json'), JSON.stringify(finalPassages, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outDir, 'tests.json'), JSON.stringify(tests, null, 2), 'utf-8');

  // Stats
  const stats = generateStats(finalQuestions, finalPassages, tests, duplicatesRemoved, duplicateLog);
  fs.writeFileSync(path.join(outDir, 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');

  console.log(`\nQuestion Bank written to ${outDir}:`);
  console.log(`  • questions.json: ${finalQuestions.length} items`);
  console.log(`  • passages.json: ${finalPassages.length} items`);
  console.log(`  • tests.json: ${tests.length} tests`);
  console.log(`  • stats.json: summary metadata`);
  console.log('\n=== READING QUESTION BANK BUILD COMPLETE ===\n');
}

function assembleTests(
  questions: Question[],
  passages: Passage[]
): { tests: ToeicTest[]; questions: Question[]; passages: Passage[] } {
  // Standard TOEIC Reading Part Specifications:
  // Part 5: 30, Part 6: 16, Part 7: 54 -> Total: 100 questions (75 mins)
  const PART_SPECS: Record<number, number> = {
    5: 30,
    6: 16,
    7: 54,
  };

  const passageMap = new Map<string, Passage>();
  for (const p of passages) {
    passageMap.set(p.id, p);
  }

  // Bucket questions by part (cloned to mutate safely)
  const poolByPart: Record<number, Question[]> = { 5: [], 6: [], 7: [] };
  for (const q of questions) {
    if (poolByPart[q.part]) {
      poolByPart[q.part].push(q);
    }
  }

  const tests: ToeicTest[] = [];
  const assignedQuestions: Question[] = [];
  const assignedPassagesMap = new Map<string, Passage>();

  for (let testIdx = 1; testIdx <= 10; testIdx++) {
    const testId = `test_${String(testIdx).padStart(2, '0')}`;
    const testPartsCount: Record<number, number> = {};
    let questionNumber = 101; // TOEIC Reading starts at question 101 to 200

    for (let part = 5; part <= 7; part++) {
      const quota = PART_SPECS[part];
      const pool = poolByPart[part];
      let partCount = 0;

      if (part === 5) {
        // Single independent questions
        while (partCount < quota && pool.length > 0) {
          const q = pool.shift()!;
          q.testId = testId;
          q.questionNumber = questionNumber++;
          assignedQuestions.push(q);
          partCount++;
        }
      } else {
        // Multi-question passage sets (Part 6, 7)
        while (partCount < quota && pool.length > 0) {
          const firstQ = pool[0];
          const passId = firstQ.passageId;

          if (!passId || !passageMap.has(passId)) {
            const q = pool.shift()!;
            q.testId = testId;
            q.questionNumber = questionNumber++;
            assignedQuestions.push(q);
            partCount++;
            continue;
          }

          // Extract all questions belonging to this passage in this pool
          const groupIndices: number[] = [];
          for (let i = 0; i < pool.length; i++) {
            if (pool[i].passageId === passId) {
              groupIndices.push(i);
            }
          }

          const groupQs = groupIndices.map(idx => pool[idx]);
          // Remove them from pool
          for (let i = groupIndices.length - 1; i >= 0; i--) {
            pool.splice(groupIndices[i], 1);
          }

          const originalPassage = passageMap.get(passId)!;
          const assignedPassageId = `${testId}_${originalPassage.id}`;
          const newPassage: Passage = {
            ...originalPassage,
            id: assignedPassageId,
            testId,
            questionIds: [],
          };

          for (const q of groupQs) {
            q.testId = testId;
            q.passageId = assignedPassageId;
            q.questionNumber = questionNumber++;
            newPassage.questionIds.push(q.id);
            assignedQuestions.push(q);
            partCount++;
          }
          assignedPassagesMap.set(assignedPassageId, newPassage);
        }
      }

      testPartsCount[part] = partCount;
    }

    tests.push({
      id: testId,
      title: `TOEIC Reading Test ${String(testIdx).padStart(2, '0')}`,
      description: `Đề thi TOEIC Reading chuẩn ETS (Part 5, 6, 7 - 100 câu) với giải thích chi tiết, bẫy distractor và mẹo làm bài.`,
      totalQuestions: questionNumber - 101,
      parts: testPartsCount,
    });
  }

  // Any remaining questions in pools stay in the general practice bank
  for (let part = 5; part <= 7; part++) {
    const pool = poolByPart[part];
    while (pool.length > 0) {
      const q = pool.shift()!;
      q.testId = 'practice_bank';
      assignedQuestions.push(q);
      if (q.passageId && passageMap.has(q.passageId)) {
        const origP = passageMap.get(q.passageId)!;
        if (!assignedPassagesMap.has(origP.id)) {
          assignedPassagesMap.set(origP.id, origP);
        }
      }
    }
  }

  return { 
    tests, 
    questions: assignedQuestions, 
    passages: Array.from(assignedPassagesMap.values()) 
  };
}

function generateStats(
  questions: Question[],
  passages: Passage[],
  tests: ToeicTest[],
  duplicatesRemoved: number,
  duplicateLog: any[]
) {
  const byPart: Record<number, number> = {};
  const byTest: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  let missingExplanationCount = 0;

  for (const q of questions) {
    byPart[q.part] = (byPart[q.part] || 0) + 1;
    const tId = q.testId || 'unassigned';
    byTest[tId] = (byTest[tId] || 0) + 1;

    const srcName = q.source?.source || 'Unknown Source';
    bySource[srcName] = (bySource[srcName] || 0) + 1;

    if (!q.explanation || !q.explanation.grammarBreakdown) {
      missingExplanationCount++;
    }
  }

  return {
    totalQuestions: questions.length,
    totalPassages: passages.length,
    totalTests: tests.length,
    byPart,
    byTest,
    bySource,
    duplicatesRemoved,
    missingExplanationCount,
    generatedAt: new Date().toISOString(),
  };
}

buildQuestionBank().catch(err => {
  console.error('Fatal build error:', err);
  process.exit(1);
});
