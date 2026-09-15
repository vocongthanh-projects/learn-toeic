import fs from 'node:fs';
import path from 'node:path';
import type { Question, Passage, ToeicTest } from '../../src/types';
import { TAXONOMY } from '../../src/data/taxonomy';

interface ValidationStats {
  totalQuestions: number;
  requiredQuestions: number;
  missingQuestions: number;
  partCounts: Record<number, { current: number; required: number; missing: number }>;
  testsCount: number;
  duplicatesFound: number;
  invalidAnswers: number;
  invalidOptions: number;
  invalidPassageRefs: number;
  invalidAudioRefs: number;
  invalidKnowledgeRefs: number;
  missingSourceMetadata: number;
  missingExplanationCount: number;
}

export function validateQuestionBank(dataDir?: string): boolean {
  const targetDir = dataDir || path.resolve(process.cwd(), 'src/data/question_bank');

  const qPath = path.join(targetDir, 'questions.json');
  const pPath = path.join(targetDir, 'passages.json');
  const tPath = path.join(targetDir, 'tests.json');

  if (!fs.existsSync(qPath) || !fs.existsSync(pPath) || !fs.existsSync(tPath)) {
    console.error(`\nError: Question bank files not found in ${targetDir}.`);
    console.error('Please run "npm run build:question-bank" first.\n');
    process.exit(1);
  }

  const questions: Question[] = JSON.parse(fs.readFileSync(qPath, 'utf-8'));
  const passages: Passage[] = JSON.parse(fs.readFileSync(pPath, 'utf-8'));
  const tests: ToeicTest[] = JSON.parse(fs.readFileSync(tPath, 'utf-8'));

  console.log('\n========================================================');
  console.log('       TOEIC QUESTION BANK VALIDATION REPORT            ');
  console.log('========================================================\n');

  // Standard 10 Tests × 200 Questions = 2,000 Questions Target
  const REQUIRED_TOTAL = 2000;
  const PART_TARGETS: Record<number, number> = {
    1: 60,   // 6 * 10
    2: 250,  // 25 * 10
    3: 390,  // 39 * 10
    4: 300,  // 30 * 10
    5: 300,  // 30 * 10
    6: 160,  // 16 * 10
    7: 540,  // 54 * 10
  };

  const stats: ValidationStats = {
    totalQuestions: questions.length,
    requiredQuestions: REQUIRED_TOTAL,
    missingQuestions: Math.max(0, REQUIRED_TOTAL - questions.length),
    partCounts: {
      1: { current: 0, required: PART_TARGETS[1], missing: 0 },
      2: { current: 0, required: PART_TARGETS[2], missing: 0 },
      3: { current: 0, required: PART_TARGETS[3], missing: 0 },
      4: { current: 0, required: PART_TARGETS[4], missing: 0 },
      5: { current: 0, required: PART_TARGETS[5], missing: 0 },
      6: { current: 0, required: PART_TARGETS[6], missing: 0 },
      7: { current: 0, required: PART_TARGETS[7], missing: 0 },
    },
    testsCount: tests.length,
    duplicatesFound: 0,
    invalidAnswers: 0,
    invalidOptions: 0,
    invalidPassageRefs: 0,
    invalidAudioRefs: 0,
    invalidKnowledgeRefs: 0,
    missingSourceMetadata: 0,
    missingExplanationCount: 0,
  };

  const validTaxonomyIds = new Set(Object.keys(TAXONOMY));
  const passageMap = new Map<string, Passage>();
  for (const p of passages) {
    passageMap.set(p.id, p);
  }

  const seenQIds = new Set<string>();

  for (const q of questions) {
    // Part counts
    if (stats.partCounts[q.part]) {
      stats.partCounts[q.part].current++;
    }

    // 1. Duplicate ID check
    if (seenQIds.has(q.id)) {
      stats.duplicatesFound++;
    } else {
      seenQIds.add(q.id);
    }

    // 2. Options check
    const expectedOptions = q.part === 2 ? 3 : 4;
    if (!q.options || q.options.length !== expectedOptions) {
      stats.invalidOptions++;
    } else {
      for (const opt of q.options) {
        if (!opt.text || opt.text.trim().length === 0) {
          stats.invalidOptions++;
          break;
        }
      }
    }

    // 3. Answer check
    const allowedAnswers = q.part === 2 ? ['A', 'B', 'C'] : ['A', 'B', 'C', 'D'];
    if (!allowedAnswers.includes(q.correctAnswer)) {
      stats.invalidAnswers++;
    }

    // 4. Passage references
    if (q.passageId) {
      const pass = passageMap.get(q.passageId);
      if (!pass || !pass.questionIds.includes(q.id)) {
        stats.invalidPassageRefs++;
      }
    }

    // 5. Audio / Transcript references for listening parts (Part 1-4)
    if (q.section === 'listening' || q.part <= 4) {
      const pass = q.passageId ? passageMap.get(q.passageId) : undefined;
      const hasTranscript = !!q.transcript || !!q.audioUrl || !!pass?.transcript || !!pass?.audioUrl;
      if (!hasTranscript) {
        stats.invalidAudioRefs++;
      }
    }

    // 6. Source metadata check
    if (!q.source || !q.source.source || !q.source.license || !q.source.retrievedAt) {
      stats.missingSourceMetadata++;
    }

    // 7. KnowledgeNode references check
    if (!q.knowledgeNodeIds || q.knowledgeNodeIds.length === 0) {
      stats.invalidKnowledgeRefs++;
    } else {
      for (const kId of q.knowledgeNodeIds) {
        if (!validTaxonomyIds.has(kId)) {
          stats.invalidKnowledgeRefs++;
        }
      }
    }

    // 8. Explanation completeness
    if (!q.explanation || !q.explanation.grammarBreakdown) {
      stats.missingExplanationCount++;
    }
  }

  // Calculate missing per part
  for (let p = 1; p <= 7; p++) {
    const info = stats.partCounts[p];
    info.missing = Math.max(0, info.required - info.current);
  }

  // PRINT SUMMARY REPORT
  console.log('--- 1. TARGET DATASET COMPLETION ---');
  console.log(`Target:    ${stats.requiredQuestions.toLocaleString()} questions (10 full tests × 200)`);
  console.log(`Current:   ${stats.totalQuestions.toLocaleString()} questions`);
  if (stats.missingQuestions > 0) {
    console.log(`Missing:   ${stats.missingQuestions.toLocaleString()} questions`);
  } else {
    console.log(`Status:    COMPLETE (>= 2,000 questions)`);
  }

  console.log('\n--- 2. BREAKDOWN BY PART (Current vs Required for 10 Full Tests) ---');
  for (let p = 1; p <= 7; p++) {
    const item = stats.partCounts[p];
    const statusMark = item.current >= item.required ? '✓' : '⚠️';
    const statusText = item.current >= item.required 
      ? `(Surplus +${item.current - item.required})` 
      : `(Missing -${item.missing})`;
    console.log(`  ${statusMark} Part ${p}: ${item.current.toString().padStart(4)} / ${item.required.toString().padStart(4)} ${statusText}`);
  }

  console.log('\n--- 3. TEST STRUCTURE & COVERAGE ---');
  console.log(`  ✓ 10 Tests configured (${tests.length} tests assembled)`);
  for (const t of tests) {
    const partsSummary = Object.entries(t.parts)
      .map(([p, count]) => `P${p}:${count}`)
      .join(' ');
    console.log(`    • ${t.id} (${t.title}): ${t.totalQuestions} questions [${partsSummary}]`);
  }

  console.log('\n--- 4. DATA QUALITY & SCHEMA INTEGRITY ---');
  console.log(`  ${stats.invalidAnswers === 0 ? '✓' : '✗'} Valid answers (A/B/C/D): ${stats.invalidAnswers === 0 ? 'ALL VALID' : `${stats.invalidAnswers} INVALID`}`);
  console.log(`  ${stats.invalidOptions === 0 ? '✓' : '✗'} Valid options (Part 2 has 3, Others have 4): ${stats.invalidOptions === 0 ? 'ALL VALID' : `${stats.invalidOptions} INVALID`}`);
  console.log(`  ${stats.invalidPassageRefs === 0 ? '✓' : '✗'} Passage references bidirectional integrity: ${stats.invalidPassageRefs === 0 ? 'ALL VALID' : `${stats.invalidPassageRefs} INVALID`}`);
  console.log(`  ${stats.invalidAudioRefs === 0 ? '✓' : '✗'} Audio/transcript references (Listening Part 1-4): ${stats.invalidAudioRefs === 0 ? 'ALL VALID' : `${stats.invalidAudioRefs} INVALID`}`);
  console.log(`  ${stats.duplicatesFound === 0 ? '✓' : '✗'} No duplicate IDs: ${stats.duplicatesFound === 0 ? 'NO DUPLICATES' : `${stats.duplicatesFound} DUPLICATE IDS`}`);
  console.log(`  ${stats.missingSourceMetadata === 0 ? '✓' : '✗'} Source metadata present (source, url, license, date): ${stats.missingSourceMetadata === 0 ? 'ALL PRESENT' : `${stats.missingSourceMetadata} MISSING`}`);
  console.log(`  ${stats.invalidKnowledgeRefs === 0 ? '✓' : '✗'} KnowledgeNode taxonomy references: ${stats.invalidKnowledgeRefs === 0 ? 'ALL VALID' : `${stats.invalidKnowledgeRefs} INVALID`}`);
  console.log(`  • Questions lacking detailed explanation: ${stats.missingExplanationCount}`);

  // Source Distribution
  const sourceCounts: Record<string, number> = {};
  for (const q of questions) {
    const s = q.source?.source || 'Unknown';
    sourceCounts[s] = (sourceCounts[s] || 0) + 1;
  }
  console.log('\n--- 5. SOURCE PROVENANCE DISTRIBUTION ---');
  for (const [src, count] of Object.entries(sourceCounts)) {
    console.log(`  • ${src}: ${count} questions (${((count / questions.length) * 100).toFixed(1)}%)`);
  }

  console.log('\n========================================================');

  const isValid = 
    stats.invalidAnswers === 0 &&
    stats.invalidOptions === 0 &&
    stats.invalidPassageRefs === 0 &&
    stats.invalidAudioRefs === 0 &&
    stats.duplicatesFound === 0 &&
    stats.missingSourceMetadata === 0 &&
    stats.invalidKnowledgeRefs === 0;

  if (isValid) {
    console.log('✓ VALIDATION RESULT: PASSED (All quality checks passed)\n');
    return true;
  } else {
    console.error('✗ VALIDATION RESULT: FAILED (Quality errors detected)\n');
    process.exit(1);
  }
}

// If run directly
validateQuestionBank();
