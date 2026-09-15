import React, { useState, useEffect, useMemo, useRef } from 'react';
import type { Question, Passage, ToeicTest, MockExamAttempt, UserNote, ConfidenceLevel, CognitiveStatus, ErrorReason } from '../../types';
import { TESTS, QUESTION_BANK, getPassageById } from '../../data/questions';
import { convertToeicScore, saveMockExamAttempt, recordBatchQuestionAttempts, updateAttemptAttribution } from '../../db';
import { PassageViewer } from '../practice/PassageViewer';
import { LayeredExplanation } from '../practice/LayeredExplanation';
import { QuestionNoteDrawer } from '../notes/QuestionNoteDrawer';
import { 
  Timer, 
  Play, 
  Pause, 
  CheckCircle2, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Flag, 
  BookmarkCheck, 
  PenTool, 
  Trophy, 
  BarChart2, 
  BookOpen, 
  Check, 
  BookOpenCheck,
  Sparkles
} from 'lucide-react';

interface MockTestViewProps {
  userId: string;
  userName: string;
  historyAttempts?: MockExamAttempt[];
  notes?: UserNote[];
  onNavigateHome?: () => void;
}

type ExamState = 'select' | 'testing' | 'result' | 'review';

export const MockTestView: React.FC<MockTestViewProps> = ({
  userId,
  notes = [],
  onNavigateHome
}) => {
  // Navigation & session state
  const [examState, setExamState] = useState<ExamState>('select');
  const [selectedTest, setSelectedTest] = useState<ToeicTest>(TESTS[0] || {
    id: 'test_01',
    title: 'TOEIC Reading Test 01',
    description: 'Đề thi chuẩn cấu trúc ETS Reading',
    totalQuestions: 100,
    parts: { 5: 30, 6: 16, 7: 54 }
  });
  const [examMode, setExamMode] = useState<'reading' | 'mini' | 'free'>('reading');

  // Exam session runtime data
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({});
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(120 * 60);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'flagged'>('all');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [lastExamResult, setLastExamResult] = useState<MockExamAttempt | null>(null);

  // Note Drawer state
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);

  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Available tests from questions
  const availableTests = useMemo(() => TESTS, []);

  // Filter questions for current test and selected mode
  const setupQuestionsForExam = (test: ToeicTest, mode: 'reading' | 'mini' | 'free') => {
    let testQs = QUESTION_BANK.filter(q => q.testId === test.id);
    if (testQs.length === 0) {
      testQs = QUESTION_BANK.filter(q => q.part >= 5).slice(0, 100);
    }

    let filtered: Question[] = [];
    let durationMins = 75;

    if (mode === 'mini') {
      // 30 questions sample across Reading parts (10 P5, 6 P6, 14 P7)
      const p5 = testQs.filter(q => q.part === 5).slice(0, 10);
      const p6 = testQs.filter(q => q.part === 6).slice(0, 6);
      const p7 = testQs.filter(q => q.part === 7).slice(0, 14);
      filtered = [...p5, ...p6, ...p7];
      durationMins = 25;
    } else if (mode === 'free') {
      filtered = testQs;
      durationMins = 0; // unlimited
    } else {
      // Full Reading test (100 questions)
      filtered = testQs;
      durationMins = 75;
    }

    return { filtered, durationMins };
  };

  // Start exam handler
  const handleStartExam = () => {
    const { filtered, durationMins } = setupQuestionsForExam(selectedTest, examMode);
    setExamQuestions(filtered);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedIds(new Set());
    setTimeRemainingSeconds(durationMins * 60);
    setIsTimerPaused(false);
    startTimeRef.current = Date.now();
    setExamState('testing');
  };

  // Timer effect during exam
  useEffect(() => {
    if (examState !== 'testing' || isTimerPaused || timeRemainingSeconds <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState, isTimerPaused, timeRemainingSeconds]);

  // Current active question
  const currentQ: Question | undefined = examQuestions[currentIndex];
  const currentPassage: Passage | undefined = currentQ?.passageId 
    ? getPassageById(currentQ.passageId) 
    : undefined;

  // Answer selection
  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (!currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: key }));
  };

  // Toggle flag for review
  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlaggedIds(prev => {
      const next = new Set(prev);
      if (next.has(currentQ.id)) {
        next.delete(currentQ.id);
      } else {
        next.add(currentQ.id);
      }
      return next;
    });
  };

  // Auto submit when timer runs out
  const handleAutoSubmit = () => {
    alert('Hết thời gian làm bài! Hệ thống đang tự động nộp bài và tính điểm cho bạn.');
    finishExam();
  };

  // Finalize exam calculation
  const finishExam = async () => {
    setShowSubmitModal(false);
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

    let correctCount = 0;
    let readingRaw = 0;
    let totalReadingQ = 0;

    const partStats: Record<number, { total: number; correct: number }> = {
      5: { total: 0, correct: 0 },
      6: { total: 0, correct: 0 },
      7: { total: 0, correct: 0 },
    };

    for (const q of examQuestions) {
      totalReadingQ++;

      if (partStats[q.part]) {
        partStats[q.part].total++;
      }

      const userChoice = answers[q.id];
      if (userChoice && userChoice === q.correctAnswer) {
        correctCount++;
        readingRaw++;

        if (partStats[q.part]) {
          partStats[q.part].correct++;
        }
      }
    }

    // Convert to standard ETS TOEIC Scaled Reading Score (5 - 495)
    const { readingScore, totalScore } = convertToeicScore(
      readingRaw,
      totalReadingQ
    );

    const attemptResult: MockExamAttempt = {
      id: `exam_${userId}_${Date.now()}`,
      userId,
      testId: selectedTest.id,
      testTitle: selectedTest.title,
      mode: examMode,
      totalQuestions: examQuestions.length,
      correctCount,
      readingRaw,
      readingScore,
      totalScore,
      timeSpentSeconds,
      answers,
      flaggedQuestionIds: Array.from(flaggedIds),
      partStats,
      completedAt: Date.now()
    };

    // Record individual attempts & update SRS only for questions actually answered by student
    const answeredQuestions = examQuestions.filter(q => Boolean(answers[q.id]));
    const avgTimePerQ = Math.max(1, Math.round(timeSpentSeconds / Math.max(1, answeredQuestions.length)));
    const batchRecords = answeredQuestions.map(q => {
      const userAns = answers[q.id]!;
      const isCorrect = userAns === q.correctAnswer;
      // Flagged questions mean hesitation/uncertainty; unflagged means confident
      const confidence: ConfidenceLevel = flaggedIds.has(q.id) ? 'guess' : 'likely';
      return {
        questionId: q.id,
        selectedOption: userAns,
        isCorrect,
        confidence,
        timeSpentSeconds: avgTimePerQ
      };
    });

    // Save batch attempts to feed Mistake Bank, SRS, and Dashboard recommendations
    if (batchRecords.length > 0) {
      await recordBatchQuestionAttempts(userId, batchRecords);
    }
    await saveMockExamAttempt(attemptResult);
    setLastExamResult(attemptResult);
    setExamState('result');
  };

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;
    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  // Existing note for current question
  const currentNote = useMemo(() => {
    if (!currentQ) return undefined;
    return notes.find(n => n.questionId === currentQ.id);
  }, [currentQ, notes]);

  // ==========================================
  // RENDER 1: SELECT & SETUP TEST SCREEN
  // ==========================================
  if (examState === 'select') {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
        {/* Banner Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Official Exam Simulator
              </span>
              <span className="text-xs text-slate-500 font-medium">ETS 10–990 Scaled Score</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Phòng Thi Thử TOEIC Trực Tuyến
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Mô phỏng áp lực phòng thi thật với đồng hồ đếm ngược, bảng câu hỏi 200 câu, gắn cờ xem lại và thang điểm quy đổi chuẩn ETS.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              type="button"
              onClick={handleStartExam}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md shadow-blue-500/25 hover:scale-[1.02] transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>BẮT ĐẦU VÀO THI</span>
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-600" />
            <span>1. Chọn Chế Độ Thi Thử</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'reading' as const,
                title: 'Full Reading Test (100 Câu)',
                time: '75 Phút (Chuẩn ETS)',
                desc: 'Đầy đủ Part 5, 6, 7. Rèn căn thời gian và tốc độ làm bài chuẩn thi thật.',
                badge: 'Khuyên Dùng (495 Điểm)'
              },
              {
                id: 'mini' as const,
                title: 'Mini Reading Test (30 Câu)',
                time: '25 Phút (10 P5, 6 P6, 14 P7)',
                desc: 'Khảo sát nhanh năng lực đọc hiểu khi bạn có ít thời gian rảnh.',
                badge: 'Khảo Sát Nhanh'
              },
              {
                id: 'free' as const,
                title: 'Luyện Đọc Tự Do',
                time: 'Không Áp Lực Thời Gian',
                desc: 'Làm bài thong thả, tập trung đào sâu cấu trúc ngữ pháp và từ vựng.',
                badge: 'Luyện Kỹ Năng'
              }
            ].map(m => {
              const isSelected = examMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setExamMode(m.id)}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white border border-slate-200 text-blue-700">
                      {m.badge}
                    </span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{m.title}</h4>
                  <p className="text-xs font-semibold text-blue-600 mt-0.5 font-mono">{m.time}</p>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{m.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Test List Selection */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-blue-600" />
            <span>2. Chọn Đề Thi Trong Kho ({availableTests.length} Đề Có Sẵn)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availableTests.map((t, idx) => {
              const isSelected = selectedTest.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTest(t)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/40 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                        ĐỀ #{idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 truncate">{t.title}</h4>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-1">{t.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                      <span>{t.totalQuestions} câu hỏi</span>
                      <span>•</span>
                      <span>Full 7 Parts</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                      isSelected 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 2: LIVE EXAM ROOM
  // ==========================================
  if (examState === 'testing') {
    if (!currentQ) return null;

    const isTimerUrgent = timeRemainingSeconds < 5 * 60;
    const isTimerWarning = timeRemainingSeconds < 15 * 60 && !isTimerUrgent;
    const answeredCount = Object.keys(answers).length;
    const totalQCount = examQuestions.length;
    const isCurrentFlagged = flaggedIds.has(currentQ.id);

    // Filter palette
    const filteredIndices = examQuestions.map((q, idx) => ({ q, idx })).filter(({ q }) => {
      if (paletteFilter === 'unanswered') return !answers[q.id];
      if (paletteFilter === 'flagged') return flaggedIds.has(q.id);
      return true;
    });

    return (
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 animate-in fade-in duration-200 select-none">
        {/* Sticky Exam Bar */}
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Left: Test Info & Question counter */}
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold">
              Part {currentQ.part} • Reading
            </span>
            <span className="font-extrabold text-slate-900 text-sm font-mono">
              Câu {currentIndex + 1} / {totalQCount}
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400">|</span>
            <span className="hidden sm:inline-block text-xs text-slate-600 font-medium">
              Đã làm: <strong className="text-slate-900 font-mono">{answeredCount}</strong>/{totalQCount}
            </span>
          </div>

          {/* Center: Countdown Timer */}
          {examMode !== 'free' && (
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl border font-mono font-bold text-sm transition-all ${
              isTimerUrgent 
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse' 
                : isTimerWarning 
                ? 'bg-amber-50 border-amber-300 text-amber-800' 
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <Timer className={`w-4 h-4 ${isTimerUrgent ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>{formatTime(timeRemainingSeconds)}</span>
              <button
                type="button"
                onClick={() => setIsTimerPaused(prev => !prev)}
                className="ml-1 text-slate-400 hover:text-slate-700 p-0.5 rounded"
                title={isTimerPaused ? 'Tiếp tục tính giờ' : 'Tạm dừng tính giờ'}
              >
                {isTimerPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* Right: Submit Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all"
            >
              Nộp Bài Thi
            </button>
          </div>
        </div>

        {/* Main Exam Grid: Left Center (Question + Media) / Right (Palette) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Content (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Passage Viewer for Part 6, 7 */}
            {currentPassage && (currentQ.part === 6 || currentQ.part === 7) && (
              <PassageViewer passage={currentPassage} part={currentQ.part} />
            )}

            {/* Question Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Question text */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Nội dung câu hỏi:
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.part === 6
                    ? 'Chọn từ/câu phù hợp nhất cho vị trí tương ứng trong đoạn văn:'
                    : currentQ.question}
                </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map(opt => {
                  const isSelected = answers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(opt.key)}
                      className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left font-medium transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/30 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/50 text-slate-800'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {opt.key}
                      </div>
                      <div className="flex-1 text-sm">{opt.text}</div>
                    </button>
                  );
                })}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentIndex === 0}
                    onClick={() => setCurrentIndex(prev => prev - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Câu trước</span>
                  </button>
                  <button
                    type="button"
                    disabled={currentIndex >= totalQCount - 1}
                    onClick={() => setCurrentIndex(prev => prev + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-semibold transition-colors"
                  >
                    <span>Câu tiếp</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Flag button */}
                  <button
                    type="button"
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isCurrentFlagged
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-600 text-amber-600' : 'text-slate-400'}`} />
                    <span>{isCurrentFlagged ? 'Đã gắn cờ' : 'Gắn cờ xem lại'}</span>
                  </button>

                  {/* Note button */}
                  <button
                    type="button"
                    onClick={() => setIsNoteDrawerOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-all"
                  >
                    <PenTool className="w-3.5 h-3.5 text-blue-600" />
                    <span>{currentNote ? 'Sửa ghi chú' : 'Ghi chú nháp'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Question Palette Grid (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 sticky top-36">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  <span>Bảng Câu Hỏi ({answeredCount}/{totalQCount})</span>
                </h3>

                {/* Filter buttons */}
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setPaletteFilter('all')}
                    className={`px-2 py-0.5 rounded-lg ${paletteFilter === 'all' ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Tất cả
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaletteFilter('unanswered')}
                    className={`px-2 py-0.5 rounded-lg ${paletteFilter === 'unanswered' ? 'bg-slate-200 text-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Chưa làm
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaletteFilter('flagged')}
                    className={`px-2 py-0.5 rounded-lg ${paletteFilter === 'flagged' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    Gắn cờ ({flaggedIds.size})
                  </button>
                </div>
              </div>

              {/* Status legend */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Đã chọn</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Gắn cờ</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />
                  <span>Chưa làm</span>
                </div>
              </div>

              {/* Grid palette */}
              <div className="max-h-[360px] overflow-y-auto pr-1 grid grid-cols-5 gap-2 scrollbar-thin">
                {filteredIndices.map(({ q, idx }) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isFlagged = flaggedIds.has(q.id);
                  const isCurrent = idx === currentIndex;

                  let badgeClass = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                  if (isCurrent) {
                    badgeClass = 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-400 shadow-xs';
                  } else if (isFlagged) {
                    badgeClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                  } else if (isAnswered) {
                    badgeClass = 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl border text-xs font-mono flex items-center justify-center transition-all ${badgeClass}`}
                    >
                      <span>{idx + 1}</span>
                      {isFlagged && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Note Drawer for In-place note taking */}
        {isNoteDrawerOpen && (
          <QuestionNoteDrawer
            isOpen={isNoteDrawerOpen}
            onClose={() => setIsNoteDrawerOpen(false)}
            userId={userId}
            question={currentQ}
            existingNote={currentNote}
          />
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-slate-900">Xác Nhận Nộp Bài Thi Thử</h3>
                <p className="text-xs text-slate-500">
                  Hệ thống sẽ tổng kết và quy đổi điểm chuẩn ETS TOEIC cho bạn.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Đã trả lời:</span>
                  <strong className="text-blue-600">{answeredCount} / {totalQCount} câu</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Chưa trả lời:</span>
                  <strong className="text-rose-600">{totalQCount - answeredCount} câu</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Đang gắn cờ xem lại:</span>
                  <strong className="text-amber-600">{flaggedIds.size} câu</strong>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold"
                >
                  Làm tiếp
                </button>
                <button
                  type="button"
                  onClick={finishExam}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                >
                  Xác nhận nộp bài
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER 3: EXAM RESULT & ETS SCORE REPORT
  // ==========================================
  if (examState === 'result' && lastExamResult) {
    const accuracy = Math.round((lastExamResult.correctCount / lastExamResult.totalQuestions) * 100);

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
        {/* Score Card Hero */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200">
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Báo Cáo Điểm Thi Thử Chuẩn ETS</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mt-1">{lastExamResult.testTitle}</h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-blue-200">Thời gian hoàn thành:</span>
              <p className="font-mono font-bold text-sm">{formatTime(lastExamResult.timeSpentSeconds)}</p>
            </div>
          </div>

          {/* Scaled Score Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Reading Scaled Score */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center space-y-1">
              <span className="text-xs text-blue-200 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Điểm Reading ETS</span>
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight">
                {lastExamResult.readingScore}
                <span className="text-lg text-white/70 font-normal">/495</span>
              </div>
              <span className="text-[11px] text-blue-200 font-medium block">
                Chuẩn thang điểm ETS TOEIC Reading
              </span>
            </div>

            {/* Accuracy */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center space-y-1">
              <span className="text-xs text-blue-200 uppercase tracking-wider font-bold">Độ chính xác</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {accuracy}%
              </div>
              <span className="text-[11px] text-blue-200 font-medium block">
                Đúng {lastExamResult.correctCount}/{lastExamResult.totalQuestions} câu
              </span>
            </div>

            {/* Time / Pace */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 text-center space-y-1">
              <span className="text-xs text-blue-200 uppercase tracking-wider font-bold">Tốc độ làm bài</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white font-mono">
                {Math.round(lastExamResult.timeSpentSeconds / Math.max(1, lastExamResult.totalQuestions))}s
              </div>
              <span className="text-[11px] text-blue-200 font-medium block">
                Thời gian trung bình mỗi câu
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCurrentIndex(0);
                setExamState('review');
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-blue-900 hover:bg-blue-50 font-bold text-xs shadow-lg transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>XEM GIẢI THÍCH CHI TIẾT & BẪY TỪNG CÂU</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartExam}
                className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại đề này</span>
              </button>
              {onNavigateHome && (
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all"
                >
                  Về trang chủ
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Part Breakdown Analytics */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600" />
            <span>Phân Tích Độ Chính Xác Chi Tiết Từng Part Reading</span>
          </h3>

          <div className="space-y-3">
            {([5, 6, 7] as const).map(p => {
              const stat = lastExamResult.partStats[p] || { total: 0, correct: 0 };
              if (stat.total === 0) return null;
              const pct = Math.round((stat.correct / stat.total) * 100);

              let barColor = 'bg-blue-600';
              if (pct >= 80) barColor = 'bg-emerald-500';
              else if (pct < 60) barColor = 'bg-rose-500';

              const partNames: Record<number, string> = {
                5: 'Part 5 • Incomplete Sentences (Hoàn thành câu)',
                6: 'Part 6 • Text Completion (Điền đoạn văn)',
                7: 'Part 7 • Reading Comprehension (Đọc hiểu văn bản)'
              };

              return (
                <div key={p} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-slate-900">
                      {partNames[p] || `Part ${p} • Reading`}
                    </span>
                    <span className="font-mono font-bold text-slate-700">
                      {stat.correct}/{stat.total} câu ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${barColor} rounded-full transition-all duration-500`} 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER 4: DETAILED EXAM REVIEW MODE
  // ==========================================
  if (examState === 'review') {
    if (!currentQ) return null;

    const userAns = answers[currentQ.id];
    const isCorrect = userAns === currentQ.correctAnswer;
    const totalQCount = examQuestions.length;
    const wasFlagged = flaggedIds.has(currentQ.id);

    // Compute realistic cognitive status
    const currentConfidence: ConfidenceLevel = !userAns ? 'no_idea' : wasFlagged ? 'guess' : 'likely';
    let currentCognitiveStatus: CognitiveStatus = 'knowledge_gap';
    if (isCorrect) {
      currentCognitiveStatus = wasFlagged ? 'lucky_guess' : 'mastered';
    } else {
      currentCognitiveStatus = (!wasFlagged && userAns) ? 'misconception' : 'knowledge_gap';
    }

    const handleSaveAttribution = async (reason: ErrorReason, noteText?: string) => {
      if (!currentQ) return;
      await updateAttemptAttribution(userId, currentQ.id, reason, noteText);
    };

    return (
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
        {/* Review Top Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setExamState('result')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về bảng điểm</span>
          </button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200">
              Part {currentQ.part}
            </span>
            <span className="font-bold text-slate-900">
              Câu {currentIndex + 1} / {totalQCount}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={currentIndex >= totalQCount - 1}
              onClick={() => setCurrentIndex(prev => prev + 1)}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Passage Viewer for Part 6, 7 */}
        {currentPassage && (currentQ.part === 6 || currentQ.part === 7) && (
          <PassageViewer passage={currentPassage} part={currentQ.part} />
        )}

        {/* Question + Answer Highlight Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Nội dung câu hỏi:
            </span>
            <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
              {currentQ.question}
            </h2>
          </div>

          {/* Options with correctness styles */}
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map(opt => {
              const isSelected = userAns === opt.key;
              const isRight = opt.key === currentQ.correctAnswer;

              let style = 'border-slate-200 bg-white text-slate-700';
              if (isRight) {
                style = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20';
              } else if (isSelected && !isRight) {
                style = 'border-rose-500 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-500/20';
              }

              return (
                <div
                  key={opt.key}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl border text-sm transition-all ${style}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border ${
                    isRight 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : isSelected 
                      ? 'bg-rose-600 text-white border-rose-600' 
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {opt.key}
                  </div>
                  <div className="flex-1">{opt.text}</div>
                  {isRight && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                      ✓ ĐÁP ÁN ĐÚNG
                    </span>
                  )}
                  {isSelected && !isRight && (
                    <span className="text-xs font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md">
                      ✗ BẠN ĐÃ CHỌN
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Full Layered Explanation */}
        <LayeredExplanation
          userId={userId}
          question={currentQ}
          selectedOption={userAns || null}
          isCorrect={isCorrect}
          confidence={currentConfidence}
          cognitiveStatus={currentCognitiveStatus}
          onSaveAttribution={handleSaveAttribution}
        />

        {/* Note Drawer */}
        {isNoteDrawerOpen && (
          <QuestionNoteDrawer
            isOpen={isNoteDrawerOpen}
            onClose={() => setIsNoteDrawerOpen(false)}
            userId={userId}
            question={currentQ}
            existingNote={currentNote}
          />
        )}
      </div>
    );
  }

  return null;
};
