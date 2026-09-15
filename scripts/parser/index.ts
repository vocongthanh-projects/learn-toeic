import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import type { SourceMetadata, Passage } from '../../src/types';

export interface ParsedItem {
  id: string;
  part: number;
  questionNumber?: number;
  question: string;
  choices: string[];
  rawAnswer: number | string;
  passageId?: string;
  audioUrl?: string;
  transcript?: string;
  image?: string;
  rawDifficulty?: string;
  rawExplanation?: string;
  rawTranslation?: string;
  rawCategory?: string;
  evidence?: string;
  evidenceLocation?: string;
  choiceNotes?: string[];
  tags?: string[];
  source: SourceMetadata;
}

export interface ParseResult {
  questions: ParsedItem[];
  passages: Passage[];
}

// Some sources mark Part 6 blanks as numbered template tokens (e.g. "{{131}}") instead of
// a plain blank — replace them so the passage never shows a raw, unrendered placeholder to the user.
function resolvePassageBlanks(text?: string): string | undefined {
  if (!text) return text;
  return text.replace(/\{\{\s*\d+\s*\}\}/g, '_____');
}

export function parseAllSources(rootDir: string): ParseResult {
  const sourcesDir = path.join(rootDir, 'scripts/sources');
  const allQuestions: ParsedItem[] = [];
  const allPassages: Passage[] = [];

  const sourceFolders = fs.readdirSync(sourcesDir).filter(f => {
    return fs.statSync(path.join(sourcesDir, f)).isDirectory();
  });

  for (const folder of sourceFolders) {
    const folderPath = path.join(sourcesDir, folder);
    const metaPath = path.join(folderPath, 'metadata.json');
    const rawPath = path.join(folderPath, 'raw.json');

    if (!fs.existsSync(metaPath) || !fs.existsSync(rawPath)) {
      continue;
    }

    const metadata: SourceMetadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const rawContent = fs.readFileSync(rawPath, 'utf-8');
    const rawData = JSON.parse(rawContent);

    if (folder.includes('source1_ets_public')) {
      parseSource1(rawData, metadata, allQuestions, allPassages);
    } else if (folder.includes('source2_open_toeic_prep')) {
      parseSource2(rawData, metadata, allQuestions, allPassages);
    } else if (folder.includes('source3_community_corpus')) {
      parseSource3(rawData, metadata, allQuestions, allPassages, folderPath);
    }
  }

  return { questions: allQuestions, passages: allPassages };
}

function parseSource1(
  rawData: any[],
  source: SourceMetadata,
  questions: ParsedItem[],
  passages: Passage[]
) {
  const passageMap = new Map<string, Passage>();

  for (const item of rawData) {
    const part = Number(item.part);
    const qId = item.id;

    let passageId = item.groupId;
    if (passageId) {
      if (!passageMap.has(passageId)) {
        passageMap.set(passageId, {
          id: passageId,
          testId: 'sample',
          part,
          type: part === 3 ? 'conversation' : part === 4 ? 'talk' : 'single_passage',
          transcript: item.transcript || item.audioText,
          content: resolvePassageBlanks(item.passage),
          questionIds: [],
        });
      }
      passageMap.get(passageId)!.questionIds.push(qId);
    }

    questions.push({
      id: qId,
      part,
      question: item.prompt || item.question || '',
      choices: item.choices || [],
      rawAnswer: item.answer,
      passageId,
      transcript: item.transcript || item.audioText,
      image: item.image,
      rawDifficulty: item.difficulty,
      rawExplanation: item.explanation,
      rawTranslation: item.translation,
      rawCategory: item.category,
      tags: ['ets-official-sample'],
      source,
    });
  }

  for (const p of passageMap.values()) {
    passages.push(p);
  }
}

function parseSource2(
  rawData: any[],
  source: SourceMetadata,
  questions: ParsedItem[],
  passages: Passage[]
) {
  for (const testItem of rawData) {
    const testFile = testItem.filename; // e.g. reading-test-1.json
    const testNumMatch = testFile.match(/reading-test-(\d+)/);
    const testPrefix = testNumMatch ? `t${testNumMatch[1].padStart(2, '0')}` : 't01';
    const parts = testItem.data?.parts || [];

    for (const p of parts) {
      const partNum = p.part;
      if (partNum === 5) {
        for (const q of p.questions || []) {
          const qId = `${testPrefix}_p5_${q.number}`;
          questions.push({
            id: qId,
            part: 5,
            questionNumber: q.number,
            question: q.text,
            choices: q.choices,
            rawAnswer: q.answer,
            rawDifficulty: 'medium',
            rawExplanation: q.explanation,
            source,
            tags: q.tags || ['reading', 'incomplete-sentences'],
          });
        }
      } else if (partNum === 6 || partNum === 7) {
        for (const block of p.blocks || []) {
          const passageId = `${testPrefix}_${block.id}`;
          const passageTexts = resolvePassageBlanks((block.passages || []).map((pass: any) => pass.content || '').join('\n\n'));
          const passageLabel = (block.passages || [])[0]?.label || '';
          const passageType = (block.passages || [])[0]?.type || (partNum === 6 ? 'incomplete_text' : 'single_passage');

          const passageQIds: string[] = [];
          for (const q of block.questions || []) {
            const qId = `${testPrefix}_p${partNum}_${q.number}`;
            passageQIds.push(qId);

            questions.push({
              id: qId,
              part: partNum,
              questionNumber: q.number,
              question: q.text || (partNum === 6 ? 'Select the best option to complete the passage:' : ''),
              choices: q.choices,
              rawAnswer: q.answer,
              passageId,
              rawDifficulty: 'medium',
              rawExplanation: q.explanation,
              source,
              tags: q.tags || [partNum === 6 ? 'text-completion' : 'reading-comprehension'],
            });
          }

          passages.push({
            id: passageId,
            testId: testPrefix,
            part: partNum,
            type: partNum === 6 ? 'incomplete_text' : (block.passages?.length > 1 ? 'double_passage' : 'single_passage'),
            title: passageLabel,
            content: passageTexts,
            questionIds: passageQIds,
          });
        }
      }
    }
  }
}

function parseSource3(
  rawData: any[],
  source: SourceMetadata,
  questions: ParsedItem[],
  passages: Passage[],
  folderPath: string
) {
  // Apply question-annotations-v31.js if present
  const annotationsFile = path.join(folderPath, 'question-annotations-v31.js');
  if (fs.existsSync(annotationsFile)) {
    try {
      const code = fs.readFileSync(annotationsFile, 'utf-8');
      const sandbox = { window: { BUILTIN_BANK: rawData } };
      vm.createContext(sandbox);
      vm.runInContext(code, sandbox);
    } catch (err: any) {
      console.warn('Could not run annotations script:', err.message);
    }
  }

  const passageMap = new Map<string, Passage>();

  for (const item of rawData) {
    const part = Number(item.part);
    const qId = `s3_${item.id}`;

    let passageId = item.groupId ? `s3_${item.groupId}` : undefined;
    if (passageId) {
      if (!passageMap.has(passageId)) {
        passageMap.set(passageId, {
          id: passageId,
          testId: 'community_bank',
          part,
          type: part === 3 ? 'conversation' : part === 4 ? 'talk' : part === 6 ? 'incomplete_text' : 'single_passage',
          title: item.category || '',
          content: resolvePassageBlanks(item.passage) || undefined,
          transcript: item.audioText || undefined,
          questionIds: [],
        });
      }
      passageMap.get(passageId)!.questionIds.push(qId);
    }

    questions.push({
      id: qId,
      part,
      question: item.prompt || '',
      choices: item.choices || [],
      rawAnswer: item.answer,
      passageId,
      image: item.image,
      transcript: item.audioText,
      rawDifficulty: item.difficulty,
      rawExplanation: item.explanation,
      rawTranslation: item.translation || item.answerTranslation,
      rawCategory: item.category,
      evidence: item.evidence,
      evidenceLocation: item.evidenceLocation,
      choiceNotes: item.choiceNotes,
      tags: item.tags || [],
      source,
    });
  }

  for (const p of passageMap.values()) {
    passages.push(p);
  }
}
