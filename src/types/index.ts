// Types for TOEIC Personal Learning System

export type ConfidenceLevel = 'sure' | 'likely' | 'guess' | 'no_idea';

export type CognitiveStatus = 'mastered' | 'lucky_guess' | 'misconception' | 'knowledge_gap';

export type ErrorReason = 
  | 'careless'          // Làm ẩu / chọn vội
  | 'misread'           // Đọc sót từ / nhìn nhầm
  | 'trap'              // Dính bẫy distractor
  | 'unknown_vocab'     // Không biết từ mới
  | 'grammar_gap';      // Chưa hiểu lý thuyết ngữ pháp này


export interface Option {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface QuestionVocabItem {
  word: string;
  pos?: 'n' | 'v' | 'adj' | 'adv' | 'phrase' | 'prep' | 'conj' | string;
  phonetic?: string;
  meaning: string;
  context?: string;
}

export interface QuestionExplanation {
  translation?: string | null;
  grammarBreakdown?: string | null;
  distractors?: Partial<Record<'A' | 'B' | 'C' | 'D', string>> | null;
  whyYouGotItWrong?: string | null;
  quickTrick?: string | null;
  keyVocabulary?: QuestionVocabItem[] | null;
  wordFamily?: QuestionVocabItem[] | null;
}

export interface SourceMetadata {
  source: string;
  sourceUrl: string;
  license: string;
  retrievedAt: string;
}

export interface Question {
  id: string;
  testId?: string;
  section?: 'listening' | 'reading';
  part: number; // 1 to 7
  questionNumber?: number; // 1 to 200
  passageId?: string;
  audioUrl?: string;
  transcript?: string;
  image?: string;
  question: string;
  options: Option[];
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  questionType?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  knowledgeNodeIds: string[];
  tags?: string[];
  evidence?: string;
  evidenceLocation?: string;
  choiceNotes?: string[];
  explanation: QuestionExplanation;
  source?: SourceMetadata;
}

export interface Passage {
  id: string; // e.g. "test01_p3_c01", "test01_p7_p01"
  testId: string;
  part: number; // 3, 4, 6, 7
  type: 'conversation' | 'talk' | 'single_passage' | 'double_passage' | 'triple_passage' | 'incomplete_text';
  title?: string;
  content?: string; // Text for Part 6, 7
  audioUrl?: string; // Audio for Part 3, 4
  transcript?: string; // Script for Part 3, 4
  images?: string[]; // Visuals / Photographs
  questionIds: string[];
}

export interface ToeicTest {
  id: string;
  title: string;
  description: string;
  totalQuestions: number;
  parts: Record<number, number>;
  source?: SourceMetadata;
}

export interface KnowledgeNode {
  id: string;
  parent: string | null;
  name: string;
  category: 'grammar' | 'vocabulary' | 'trap_pattern';
  description: string;
  ruleSummary: string;
  examples?: string[];
  commonMistakes?: string[];
  quickTips?: string[];
  keySignals?: string[];
}

export interface Attempt {
  id?: number;
  userId: string;
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  cognitiveStatus: CognitiveStatus;
  timeSpentSeconds: number;
  timestamp: number;
  errorReason?: ErrorReason;
  userNotes?: string;
}

export interface SrsItem {
  id: string; // e.g. "srs_${userId}_${questionId}"
  userId: string;
  type: 'question' | 'knowledge_node' | 'vocab';
  targetId: string;
  stability: number;       // S in days
  difficulty: number;      // D (1-10)
  reps: number;            // Review repetitions
  lapses: number;          // Mistakes after mastery
  lastReview: number;      // timestamp
  nextReview: number;      // timestamp
  state: 'learning' | 'review' | 'relearning';
}

export interface VocabularyItem {
  id: string;              // e.g. "vocab_${userId}_${timestamp}"
  userId: string;
  term: string;
  meaning: string;
  context?: string;
  sourceQuestionId?: string;
  stability: number;
  difficulty: number;
  reps: number;
  lapses: number;
  lastReview: number;
  nextReview: number;
  state: 'learning' | 'review';
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarBg: string;
  role: string;
}

export interface Recommendation {
  id: string;
  type: 'misconception' | 'lucky_guess' | 'weak_topic' | 'srs_due' | 'vocab_due';
  priority: 1 | 2 | 3;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  badgeColor: 'red' | 'amber' | 'blue' | 'purple' | 'emerald';
  knowledgeNodeId?: string;
  questionIds: string[];
  actionLabel: string;
  targetView?: ViewMode;
}

export interface UserNote {
  id: string;              // e.g. "note_${userId}_${timestamp}"
  userId: string;
  title: string;
  content: string;
  questionId?: string;
  part?: number;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface MockExamConfig {
  testId: string;
  title: string;
  mode: 'reading' | 'mini' | 'free';
  durationMinutes: number; // 75, 25, or 0 (no limit)
}

export interface MockExamAttempt {
  id: string;              // e.g. "exam_${userId}_${timestamp}"
  userId: string;
  testId: string;
  testTitle: string;
  mode: 'reading' | 'mini' | 'free';
  totalQuestions: number;
  correctCount: number;
  readingRaw: number;
  readingScore: number;    // 5 - 495
  totalScore: number;      // 5 - 495
  timeSpentSeconds: number;
  answers: Record<string, 'A' | 'B' | 'C' | 'D'>;
  flaggedQuestionIds: string[];
  partStats: Record<number, { total: number; correct: number }>;
  completedAt: number;
}

export type ViewMode = 'dashboard' | 'knowledge' | 'practice' | 'mock_test' | 'mistake_bank' | 'vocabulary' | 'notes';

