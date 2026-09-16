import Dexie, { type Table } from 'dexie';
import type { Attempt, SrsItem, VocabularyItem, UserProfile, CognitiveStatus, ConfidenceLevel, UserNote, MockExamAttempt, WritingAttempt, SpeakingAttempt } from '../types';

export const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: 'user_1',
    name: 'Học viên 1',
    avatarBg: 'from-indigo-500 to-purple-600',
    role: 'Đang luyện thi TOEIC'
  },
  {
    id: 'user_2',
    name: 'Học viên 2',
    avatarBg: 'from-emerald-500 to-teal-600',
    role: 'Đang luyện thi TOEIC'
  }
];


export class ToeicDatabase extends Dexie {
  attempts!: Table<Attempt, number>;
  srsItems!: Table<SrsItem, string>;
  vocabulary!: Table<VocabularyItem, string>;
  userProfiles!: Table<UserProfile, string>;
  notes!: Table<UserNote, string>;
  mockExamAttempts!: Table<MockExamAttempt, string>;
  writingAttempts!: Table<WritingAttempt, string>;
  speakingAttempts!: Table<SpeakingAttempt, string>;

  constructor() {
    super('ToeicMasteryDB_v1');
    this.version(1).stores({
      attempts: '++id, userId, questionId, isCorrect, confidence, cognitiveStatus, timestamp',
      srsItems: 'id, userId, targetId, nextReview, state',
      vocabulary: 'id, userId, term, nextReview, state, createdAt',
      userProfiles: 'id, name'
    });
    this.version(2).stores({
      attempts: '++id, userId, questionId, isCorrect, confidence, cognitiveStatus, timestamp',
      srsItems: 'id, userId, targetId, nextReview, state',
      vocabulary: 'id, userId, term, nextReview, state, createdAt',
      userProfiles: 'id, name',
      notes: 'id, userId, questionId, part, createdAt, updatedAt',
      mockExamAttempts: 'id, userId, testId, completedAt'
    });
    this.version(3).stores({
      writingAttempts: 'id, userId, promptId, taskType, createdAt'
    });
    this.version(4).stores({
      speakingAttempts: 'id, userId, promptId, taskType, createdAt'
    });
  }
}


export const db = new ToeicDatabase();

// Determine cognitive status based on correctness & confidence
export function determineCognitiveStatus(isCorrect: boolean, confidence: ConfidenceLevel): CognitiveStatus {
  if (isCorrect) {
    if (confidence === 'sure' || confidence === 'likely') {
      return 'mastered';
    }
    return 'lucky_guess'; // Đoán mò hoặc không chắc mà lại đúng
  } else {
    if (confidence === 'sure' || confidence === 'likely') {
      return 'misconception'; // Tự tin mà lại sai -> Hiểu lầm kiến thức!
    }
    return 'knowledge_gap'; // Không biết hoặc đoán sai -> Hổng kiến thức nền
  }
}

// Calculate next SRS interval (FSRS-ready)
export function calculateNextSrsState(
  currentItem: SrsItem | undefined,
  userId: string,
  targetId: string,
  isCorrect: boolean,
  confidence: ConfidenceLevel
): SrsItem {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  if (!currentItem) {
    const initialStability = isCorrect ? (confidence === 'sure' ? 2 : 1) : 0.5;
    const initialDifficulty = isCorrect ? 4.5 : 6.5;
    const intervalDays = Math.max(1, Math.round(initialStability));
    return {
      id: `srs_${userId}_${targetId}`,
      userId,
      type: 'question',
      targetId,
      stability: initialStability,
      difficulty: initialDifficulty,
      reps: 1,
      lapses: isCorrect ? 0 : 1,
      lastReview: now,
      nextReview: now + intervalDays * ONE_DAY_MS,
      state: isCorrect ? 'learning' : 'relearning'
    };
  }

  let { stability, difficulty, reps, lapses } = currentItem;
  reps += 1;

  if (isCorrect) {
    const qualityBoost = confidence === 'sure' ? 1.5 : (confidence === 'likely' ? 1.2 : 0.9);
    difficulty = Math.max(1, difficulty - (confidence === 'sure' ? 0.3 : 0.1));
    stability = stability * (1 + qualityBoost / Math.max(1, difficulty));
  } else {
    lapses += 1;
    difficulty = Math.min(10, difficulty + 1.2);
    stability = Math.max(0.5, stability * 0.4);
  }

  const intervalDays = Math.max(1, Math.round(stability));
  return {
    ...currentItem,
    stability,
    difficulty,
    reps,
    lapses,
    lastReview: now,
    nextReview: now + intervalDays * ONE_DAY_MS,
    state: isCorrect ? 'review' : 'relearning'
  };
}

// Record attempt for specific user
export async function recordQuestionAttempt(
  userId: string,
  questionId: string,
  selectedOption: 'A' | 'B' | 'C' | 'D',
  isCorrect: boolean,
  confidence: ConfidenceLevel,
  timeSpentSeconds: number,
  errorReason?: Attempt['errorReason'],
  userNotes?: string
): Promise<Attempt> {
  const cognitiveStatus = determineCognitiveStatus(isCorrect, confidence);
  const now = Date.now();

  const attempt: Attempt = {
    userId,
    questionId,
    selectedOption,
    isCorrect,
    confidence,
    cognitiveStatus,
    timeSpentSeconds,
    timestamp: now,
    errorReason,
    userNotes
  };

  const attemptId = await db.attempts.add(attempt);
  attempt.id = attemptId;

  // Update SRS for this user and question
  const srsId = `srs_${userId}_${questionId}`;
  const existingSrs = await db.srsItems.get(srsId);
  const updatedSrs = calculateNextSrsState(existingSrs, userId, questionId, isCorrect, confidence);
  await db.srsItems.put(updatedSrs);

  return attempt;
}

// Record batch attempts for mock exams, saving individual answers and updating SRS
export async function recordBatchQuestionAttempts(
  userId: string,
  records: Array<{
    questionId: string;
    selectedOption: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
    confidence: ConfidenceLevel;
    timeSpentSeconds: number;
    errorReason?: Attempt['errorReason'];
    userNotes?: string;
  }>
): Promise<Attempt[]> {
  const now = Date.now();
  const attemptsToInsert: Attempt[] = [];
  const srsUpdates: SrsItem[] = [];

  // Bulk fetch existing SRS items for all attempted questions
  const srsIds = records.map(r => `srs_${userId}_${r.questionId}`);
  const existingSrsList = await db.srsItems.bulkGet(srsIds);
  const existingSrsMap = new Map<string, SrsItem>();
  existingSrsList.forEach(srs => {
    if (srs) existingSrsMap.set(srs.id, srs);
  });

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const cognitiveStatus = determineCognitiveStatus(r.isCorrect, r.confidence);
    const attempt: Attempt = {
      userId,
      questionId: r.questionId,
      selectedOption: r.selectedOption,
      isCorrect: r.isCorrect,
      confidence: r.confidence,
      cognitiveStatus,
      timeSpentSeconds: r.timeSpentSeconds,
      timestamp: now + i, // sequential offset
      errorReason: r.errorReason,
      userNotes: r.userNotes
    };
    attemptsToInsert.push(attempt);

    const srsId = `srs_${userId}_${r.questionId}`;
    const existingSrs = existingSrsMap.get(srsId);
    const updatedSrs = calculateNextSrsState(existingSrs, userId, r.questionId, r.isCorrect, r.confidence);
    srsUpdates.push(updatedSrs);
  }

  await db.transaction('rw', [db.attempts, db.srsItems], async () => {
    await db.attempts.bulkAdd(attemptsToInsert);
    await db.srsItems.bulkPut(srsUpdates);
  });

  return attemptsToInsert;
}

// Update error attribution and notes on the latest attempt for a question
export async function updateAttemptAttribution(
  userId: string,
  questionId: string,
  errorReason?: Attempt['errorReason'],
  userNotes?: string
): Promise<void> {
  const userAttempts = await db.attempts
    .where('userId')
    .equals(userId)
    .filter(a => a.questionId === questionId)
    .reverse()
    .sortBy('timestamp');

  const latest = userAttempts[0];
  if (latest && latest.id) {
    await db.attempts.update(latest.id, {
      errorReason,
      ...(userNotes !== undefined ? { userNotes } : {})
    });
  }
}

// Add vocabulary item for a specific user
export async function addVocabularyWord(
  userId: string,
  term: string,
  meaning: string,
  context?: string,
  sourceQuestionId?: string
): Promise<VocabularyItem> {
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  const id = `vocab_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const item: VocabularyItem = {
    id,
    userId,
    term: term.trim(),
    meaning: meaning.trim(),
    context: context?.trim(),
    sourceQuestionId,
    stability: 1.0,
    difficulty: 5.0,
    reps: 0,
    lapses: 0,
    lastReview: now,
    nextReview: now + ONE_DAY_MS,
    state: 'learning',
    createdAt: now
  };

  await db.vocabulary.put(item);
  return item;
}

// Review vocabulary item
export async function reviewVocabularyWord(
  id: string,
  remembered: boolean
): Promise<void> {
  const item = await db.vocabulary.get(id);
  if (!item) return;

  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;
  let { stability, difficulty, reps, lapses } = item;
  reps += 1;

  if (remembered) {
    stability = Math.max(1, stability * 1.8);
    difficulty = Math.max(1, difficulty - 0.2);
  } else {
    lapses += 1;
    stability = Math.max(0.5, stability * 0.5);
    difficulty = Math.min(10, difficulty + 0.8);
  }

  const intervalDays = Math.max(1, Math.round(stability));
  await db.vocabulary.update(id, {
    stability,
    difficulty,
    reps,
    lapses,
    lastReview: now,
    nextReview: now + intervalDays * ONE_DAY_MS,
    state: remembered ? 'review' : 'learning'
  });
}

// Delete vocabulary item
export async function deleteVocabularyWord(id: string): Promise<void> {
  await db.vocabulary.delete(id);
}

// ==========================================
// ETS TOEIC READING SCORE CONVERSION FORMULA (5 - 495)
// ==========================================
export function convertToeicScore(
  readingRaw: number,
  totalReadingQ = 100
): {
  readingScore: number;
  totalScore: number;
} {
  const normR = totalReadingQ > 0 ? Math.min(100, Math.max(0, Math.round((readingRaw / totalReadingQ) * 100))) : 0;

  // Reading Conversion Table (ETS standard 5 - 495)
  let rScore = 5;
  if (normR >= 97) rScore = 495;
  else if (normR >= 91) rScore = 450 + (normR - 91) * 7;
  else if (normR >= 86) rScore = 415 + (normR - 86) * 7;
  else if (normR >= 81) rScore = 380 + (normR - 81) * 7;
  else if (normR >= 76) rScore = 345 + (normR - 76) * 7;
  else if (normR >= 71) rScore = 315 + (normR - 71) * 6;
  else if (normR >= 66) rScore = 285 + (normR - 66) * 6;
  else if (normR >= 61) rScore = 255 + (normR - 61) * 6;
  else if (normR >= 56) rScore = 225 + (normR - 56) * 6;
  else if (normR >= 51) rScore = 195 + (normR - 51) * 6;
  else if (normR >= 46) rScore = 165 + (normR - 46) * 6;
  else if (normR >= 41) rScore = 140 + (normR - 41) * 5;
  else if (normR >= 36) rScore = 115 + (normR - 36) * 5;
  else if (normR >= 31) rScore = 90 + (normR - 31) * 5;
  else if (normR >= 26) rScore = 65 + (normR - 26) * 5;
  else if (normR >= 21) rScore = 45 + (normR - 21) * 4;
  else if (normR >= 16) rScore = 30 + (normR - 16) * 3;
  else if (normR >= 11) rScore = 15 + (normR - 11) * 3;
  else rScore = 5;

  rScore = Math.min(495, Math.max(5, Math.round(rScore / 5) * 5));

  return {
    readingScore: rScore,
    totalScore: rScore
  };
}

// ==========================================
// USER NOTES OPERATIONS
// ==========================================
export async function saveUserNote(
  userId: string,
  content: string,
  options?: {
    title?: string;
    questionId?: string;
    part?: number;
    tags?: string[];
    id?: string;
  }
): Promise<UserNote> {
  const now = Date.now();
  const id = options?.id || `note_${userId}_${now}_${Math.random().toString(36).substring(2, 7)}`;
  const title = options?.title?.trim() || (options?.questionId ? `Ghi chú câu ${options.questionId}` : 'Ghi chú kiến thức');

  const note: UserNote = {
    id,
    userId,
    title,
    content: content.trim(),
    questionId: options?.questionId,
    part: options?.part,
    tags: options?.tags && options.tags.length > 0 ? options.tags : (options?.part ? [`Part ${options.part}`] : ['Kiến thức']),
    createdAt: now,
    updatedAt: now
  };

  await db.notes.put(note);
  return note;
}

export async function deleteUserNote(id: string): Promise<void> {
  await db.notes.delete(id);
}

export async function updateUserNote(
  id: string,
  updates: Partial<Pick<UserNote, 'title' | 'content' | 'tags' | 'part'>>
): Promise<void> {
  await db.notes.update(id, {
    ...updates,
    updatedAt: Date.now()
  });
}

// ==========================================
// MOCK EXAM OPERATIONS
// ==========================================
export async function saveMockExamAttempt(attempt: MockExamAttempt): Promise<void> {
  await db.mockExamAttempts.put(attempt);
}

export async function deleteMockExamAttempt(id: string): Promise<void> {
  await db.mockExamAttempts.delete(id);
}

// ==========================================
// WRITING OPERATIONS
// ==========================================
export async function saveWritingAttempt(attempt: WritingAttempt): Promise<void> {
  await db.writingAttempts.put(attempt);
}

export async function deleteWritingAttempt(id: string): Promise<void> {
  await db.writingAttempts.delete(id);
}

// ==========================================
// SPEAKING OPERATIONS
// ==========================================
export async function saveSpeakingAttempt(attempt: SpeakingAttempt): Promise<void> {
  await db.speakingAttempts.put(attempt);
}

export async function deleteSpeakingAttempt(id: string): Promise<void> {
  await db.speakingAttempts.delete(id);
}

// Ensure the default profiles exist without ever overwriting a name the user has customized.
export async function seedSampleDataIfEmpty() {
  try {
    for (const p of DEFAULT_PROFILES) {
      const existing = await db.userProfiles.get(p.id);
      if (!existing) {
        await db.userProfiles.put(p);
      }
    }
  } catch (err) {
    console.error('Lỗi khởi tạo hồ sơ mặc định:', err);
  }
}

// Rename a user profile (kept generic on purpose — this app is public, so no real names ship in source)
export async function renameUserProfile(profileId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  await db.userProfiles.update(profileId, { name: trimmed });
}

// ==========================================
// BACKUP / RESTORE (export & import all local data as JSON)
// ==========================================
export interface DatabaseBackup {
  version: 1;
  exportedAt: number;
  attempts: Attempt[];
  srsItems: SrsItem[];
  vocabulary: VocabularyItem[];
  userProfiles: UserProfile[];
  notes: UserNote[];
  mockExamAttempts: MockExamAttempt[];
  writingAttempts: WritingAttempt[];
  speakingAttempts: SpeakingAttempt[];
}

export async function exportDatabase(): Promise<DatabaseBackup> {
  const [attempts, srsItems, vocabulary, userProfiles, notes, mockExamAttempts, writingAttempts, speakingAttempts] = await Promise.all([
    db.attempts.toArray(),
    db.srsItems.toArray(),
    db.vocabulary.toArray(),
    db.userProfiles.toArray(),
    db.notes.toArray(),
    db.mockExamAttempts.toArray(),
    db.writingAttempts.toArray(),
    db.speakingAttempts.toArray()
  ]);

  return {
    version: 1,
    exportedAt: Date.now(),
    attempts,
    srsItems,
    vocabulary,
    userProfiles,
    notes,
    mockExamAttempts,
    writingAttempts,
    speakingAttempts
  };
}

export async function importDatabase(backup: DatabaseBackup): Promise<void> {
  if (!backup || typeof backup !== 'object' || !Array.isArray(backup.attempts) || !Array.isArray(backup.srsItems)) {
    throw new Error('File sao lưu không hợp lệ.');
  }

  await db.transaction(
    'rw',
    [db.attempts, db.srsItems, db.vocabulary, db.userProfiles, db.notes, db.mockExamAttempts, db.writingAttempts, db.speakingAttempts],
    async () => {
      await Promise.all([
        db.attempts.clear(),
        db.srsItems.clear(),
        db.vocabulary.clear(),
        db.userProfiles.clear(),
        db.notes.clear(),
        db.mockExamAttempts.clear(),
        db.writingAttempts.clear(),
        db.speakingAttempts.clear()
      ]);

      await Promise.all([
        backup.attempts.length > 0 ? db.attempts.bulkAdd(backup.attempts) : Promise.resolve(),
        backup.srsItems.length > 0 ? db.srsItems.bulkPut(backup.srsItems) : Promise.resolve(),
        backup.vocabulary?.length > 0 ? db.vocabulary.bulkPut(backup.vocabulary) : Promise.resolve(),
        db.userProfiles.bulkPut(backup.userProfiles?.length > 0 ? backup.userProfiles : DEFAULT_PROFILES),
        backup.notes?.length > 0 ? db.notes.bulkPut(backup.notes) : Promise.resolve(),
        backup.mockExamAttempts?.length > 0 ? db.mockExamAttempts.bulkPut(backup.mockExamAttempts) : Promise.resolve(),
        backup.writingAttempts?.length > 0 ? db.writingAttempts.bulkPut(backup.writingAttempts) : Promise.resolve(),
        backup.speakingAttempts?.length > 0 ? db.speakingAttempts.bulkPut(backup.speakingAttempts) : Promise.resolve()
      ]);
    }
  );
}

