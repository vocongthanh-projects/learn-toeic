import React, { useState, useEffect, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Question, ConfidenceLevel, ErrorReason, Attempt, Passage } from '../../types';
import { ConfidenceSelector } from './ConfidenceSelector';
import { LayeredExplanation } from './LayeredExplanation';
import { PassageViewer } from './PassageViewer';
import { QuestionNavDrawer } from './QuestionNavDrawer';
import { QuestionNoteDrawer } from '../notes/QuestionNoteDrawer';
import { recordQuestionAttempt, db } from '../../db';
import { TAXONOMY } from '../../data/taxonomy';
import { getPassageById, TESTS } from '../../data/questions';
import confetti from 'canvas-confetti';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Filter, 
  BookOpen,
  BookOpenCheck,
  PenTool,
  RotateCcw
} from 'lucide-react';

interface PracticeViewProps {
  userId: string;
  questions: Question[];
  attempts?: Attempt[];
  filterTitle?: string;
  onClearFilter?: () => void;
  onCompleteSession?: () => void;
}

export const PracticeView: React.FC<PracticeViewProps> = ({
  userId,
  questions,
  attempts = [],
  filterTitle,
  onClearFilter,
  onCompleteSession
}) => {
  const STORAGE_PART_KEY = `toeic_practice_part_${userId}`;
  const STORAGE_TEST_KEY = `toeic_practice_test_${userId}`;
  const STORAGE_INDEX_KEY = `toeic_practice_index_${userId}`;

  const [selectedPart, setSelectedPart] = useState<number | null>(() => {
    const v = localStorage.getItem(STORAGE_PART_KEY);
    return v !== null && v !== '' ? Number(v) : null;
  });
  const [selectedTestId, setSelectedTestId] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_TEST_KEY) || null;
  });
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const v = localStorage.getItem(STORAGE_INDEX_KEY);
    return v !== null && v !== '' ? Number(v) : 0;
  });

  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isNoteDrawerOpen, setIsNoteDrawerOpen] = useState(false);
  const [retryingQuestionId, setRetryingQuestionId] = useState<string | null>(null);

  // Sync practice filter & index states with localStorage
  useEffect(() => {
    if (selectedPart !== null) {
      localStorage.setItem(STORAGE_PART_KEY, selectedPart.toString());
    } else {
      localStorage.removeItem(STORAGE_PART_KEY);
    }
  }, [selectedPart, STORAGE_PART_KEY]);

  useEffect(() => {
    if (selectedTestId !== null) {
      localStorage.setItem(STORAGE_TEST_KEY, selectedTestId);
    } else {
      localStorage.removeItem(STORAGE_TEST_KEY);
    }
  }, [selectedTestId, STORAGE_TEST_KEY]);

  useEffect(() => {
    localStorage.setItem(STORAGE_INDEX_KEY, currentIndex.toString());
  }, [currentIndex, STORAGE_INDEX_KEY]);

  // Live query for notes of this user
  const userNotes = useLiveQuery(
    () => db.notes.where('userId').equals(userId).toArray(),
    [userId]
  ) || [];

  // Filter questions by Part and Test
  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      if (selectedPart !== null && q.part !== selectedPart) return false;
      if (selectedTestId !== null && q.testId !== selectedTestId) return false;
      return true;
    });
  }, [questions, selectedPart, selectedTestId]);

  // Current active question (safely bounded)
  const safeIndex = Math.min(currentIndex, Math.max(0, filteredQuestions.length - 1));
  const currentQuestion = filteredQuestions[safeIndex] || filteredQuestions[0];

  // Note for current question
  const currentNote = useMemo(() => {
    if (!currentQuestion) return undefined;
    return userNotes.find(n => n.questionId === currentQuestion.id);
  }, [currentQuestion, userNotes]);

  // Map of user attempts for instant lookup and indicators (sorted so latest attempt wins)
  const attemptsMap = useMemo(() => {
    const map = new Map<string, Attempt>();
    const sorted = [...attempts].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    for (const att of sorted) {
      map.set(att.questionId, att);
    }
    return map;
  }, [attempts]);

  // Auto-restore previous attempt for current question when it changes or when attempts load
  useEffect(() => {
    if (!currentQuestion) return;
    if (retryingQuestionId === currentQuestion.id) return;
    const existing = attemptsMap.get(currentQuestion.id);
    if (existing) {
      setSelectedOption(existing.selectedOption);
      setConfidence(existing.confidence);
      setSubmitted(true);
      setLastAttempt(existing);
      setTimeSpent(existing.timeSpentSeconds || 0);
    } else {
      setSelectedOption(null);
      setConfidence(null);
      setSubmitted(false);
      setLastAttempt(null);
      setTimeSpent(0);
    }
  }, [currentQuestion?.id, attemptsMap, retryingQuestionId]);

  const handleSelectPart = (part: number | null) => {
    setSelectedPart(part);
    setCurrentIndex(0);
  };

  const handleSelectTestId = (testId: string | null) => {
    setSelectedTestId(testId);
    setCurrentIndex(0);
  };

  const handleJumpToQuestion = (index: number) => {
    const bounded = Math.max(0, Math.min(index, filteredQuestions.length - 1));
    setCurrentIndex(bounded);
  };

  // Allow re-answering a submitted question
  const handleRetry = () => {
    if (currentQuestion) {
      setRetryingQuestionId(currentQuestion.id);
    }
    setSubmitted(false);
    setSelectedOption(null);
    setConfidence(null);
    setTimeSpent(0);
  };

  // Timer per question (only runs while active and unsubmitted)
  useEffect(() => {
    if (submitted) return;
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [submitted, currentIndex, currentQuestion?.id]);

  const handleSubmit = async () => {
    if (!selectedOption || !confidence || !currentQuestion) return;

    setRetryingQuestionId(null);
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    setSubmitted(true);

    if (isCorrect && confidence === 'sure') {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    }

    const recorded = await recordQuestionAttempt(
      userId,
      currentQuestion.id,
      selectedOption,
      isCorrect,
      confidence,
      timeSpent
    );

    setLastAttempt(recorded);
  };

  const handleSaveAttribution = async (reason: ErrorReason, notes: string) => {
    if (lastAttempt && lastAttempt.id) {
      await db.attempts.update(lastAttempt.id, {
        errorReason: reason,
        userNotes: notes
      });
      setLastAttempt(prev => prev ? { ...prev, errorReason: reason, userNotes: notes } : null);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      handleJumpToQuestion(currentIndex + 1);
    } else {
      if (onCompleteSession) onCompleteSession();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleJumpToQuestion(currentIndex - 1);
    }
  };

  // Find linked passage if applicable (Part 3, 4, 6, 7)
  const currentPassage: Passage | undefined = currentQuestion?.passageId 
    ? getPassageById(currentQuestion.passageId) 
    : undefined;

  // Question counts per part for badges
  const partCounts = useMemo(() => {
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (const q of questions) {
      if (counts[q.part] !== undefined) {
        counts[q.part]++;
      }
    }
    return counts;
  }, [questions]);

  if (!currentQuestion) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Không có câu hỏi nào trong bộ lọc</h3>
        <p className="text-sm text-slate-500">Hãy chọn Part khác hoặc đặt lại bộ lọc để tiếp tục làm bài.</p>
        <button
          type="button"
          onClick={() => {
            handleSelectPart(null);
            handleSelectTestId(null);
            if (onClearFilter) onClearFilter();
          }}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
        >
          Xem tất cả câu hỏi ({questions.length})
        </button>
      </div>
    );
  }

  // Linked taxonomy node
  const linkedTaxonomy = currentQuestion.knowledgeNodeIds
    .map(id => TAXONOMY[id])
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* 1. TOP NAVIGATION: PART SELECTOR & TEST FILTER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
        {/* Part Tabs Bar */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSelectPart(null)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedPart === null
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tất cả Parts ({questions.length})
            </button>

            {([5, 6, 7] as const).map(p => {
              const count = partCounts[p];
              const isSelected = selectedPart === p;

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelectPart(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <BookOpenCheck className={`w-3 h-3 ${isSelected ? 'text-blue-200' : 'text-slate-400'}`} />
                  <span>Part {p}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Question List Drawer trigger */}
          <div className="shrink-0">
            <QuestionNavDrawer
              questions={filteredQuestions}
              currentIndex={currentIndex}
              attemptsMap={attemptsMap}
              selectedPart={selectedPart}
              onSelectPart={handleSelectPart}
              onJumpToQuestion={handleJumpToQuestion}
            />
          </div>
        </div>

        {/* Secondary Filter: Test Selection & Drill Targets */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Đề thi:</span>
            <select
              value={selectedTestId || ''}
              onChange={(e) => handleSelectTestId(e.target.value || null)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toàn bộ đề thi & Kho luyện tập</option>
              {TESTS.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.totalQuestions} câu)
                </option>
              ))}
              <option value="practice_bank">Kho câu hỏi mở rộng</option>
            </select>
          </div>

          {filterTitle && (
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
              <Filter className="w-3.5 h-3.5" />
              <span>Mục tiêu: <strong>{filterTitle}</strong></span>
              {onClearFilter && (
                <button
                  type="button"
                  onClick={onClearFilter}
                  className="text-blue-600 hover:text-blue-800 font-bold ml-1 underline"
                >
                  Bỏ lọc
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 font-medium text-slate-500">
            <span>Hiển thị: </span>
            <strong className="text-slate-800 font-mono">{filteredQuestions.length}</strong>
            <span>câu hỏi</span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS & METADATA BAR */}
      <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-lg font-bold border bg-blue-50 text-blue-700 border-blue-200">
            Part {currentQuestion.part} • Reading
          </span>

          <span className="font-semibold text-slate-900 font-mono">
            Câu {currentIndex + 1} / {filteredQuestions.length}
          </span>

          {currentQuestion.testId && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-mono">
              {currentQuestion.testId.toUpperCase()}
            </span>
          )}

          <div className="hidden md:flex items-center gap-1.5 ml-1">
            {linkedTaxonomy.map(node => (
              <span key={node.id} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                #{node.name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsNoteDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold transition-all ${
              currentNote
                ? 'bg-amber-50 text-amber-800 border-amber-300 font-bold shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Ghi chú công thức hoặc bẫy cần nhớ cho câu này"
          >
            <PenTool className="w-3.5 h-3.5 text-blue-600" />
            <span>{currentNote ? 'Đã có ghi chú' : 'Ghi chú'}</span>
          </button>

          <div className="flex items-center gap-1 font-mono text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{timeSpent}s</span>
          </div>
          {currentQuestion.difficulty && (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
              currentQuestion.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              currentQuestion.difficulty === 'medium' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
              'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {currentQuestion.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* 3. PASSAGE VIEWER (Cho Part 6, 7) */}
      {currentPassage && (currentQuestion.part === 6 || currentQuestion.part === 7) && (
        <PassageViewer passage={currentPassage} part={currentQuestion.part} />
      )}

      {/* 4. MAIN QUESTION CARD */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Question Text */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {currentQuestion.part === 6 
              ? 'Part 6 • Chọn từ/câu phù hợp nhất cho chỗ trống trong đoạn văn:' 
              : currentQuestion.part === 7 
              ? 'Part 7 • Đọc hiểu đoạn văn và chọn câu trả lời đúng:' 
              : 'Part 5 • Hoàn thành câu:'}
          </span>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 leading-relaxed">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Options Grid */}
        <div className="grid gap-3 pt-2 grid-cols-1 sm:grid-cols-2">
              {currentQuestion.options.map(opt => {
                const isSelected = selectedOption === opt.key;
                const isCorrect = opt.key === currentQuestion.correctAnswer;
                
                let btnStyle = 'border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30 text-slate-800';
                
                if (submitted) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/30 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/30 font-semibold';
                  } else {
                    btnStyle = 'border-slate-100 bg-slate-50/50 text-slate-400 opacity-60';
                  }
                } else if (isSelected) {
                  btnStyle = 'border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-600/30 shadow-xs';
                }

                return (
                  <button
                    type="button"
                    key={opt.key}
                    disabled={submitted}
                    onClick={() => setSelectedOption(opt.key)}
                    className={`flex items-center gap-3.5 p-4 rounded-2xl border text-left font-medium transition-all group ${btnStyle}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs border transition-colors ${
                      submitted && isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : submitted && isSelected && !isCorrect
                        ? 'bg-rose-600 text-white border-rose-600'
                        : isSelected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 text-slate-700 border-slate-200 group-hover:border-blue-300'
                    }`}>
                      {opt.key}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm">{opt.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confidence Picker (shown before submitting) */}
            {!submitted && (
              <div className="pt-4 border-t border-slate-100">
                <ConfidenceSelector
                  value={confidence}
                  onChange={setConfidence}
                />
              </div>
            )}

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={handlePrev}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          {!submitted ? (
            <button
              type="button"
              disabled={!selectedOption || !confidence}
              onClick={handleSubmit}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                selectedOption && confidence
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 hover:scale-[1.02]'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Kiểm tra đáp án</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all"
                title="Làm lại câu này để thử lại đáp án"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm lại</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 hover:scale-[1.02] transition-all"
              >
                <span>{currentIndex < filteredQuestions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài luyện'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7. LAYERED DEEP EXPLANATION & COGNITIVE ATTRIBUTION */}
      {submitted && lastAttempt && selectedOption && confidence && (
        <LayeredExplanation
          userId={userId}
          question={currentQuestion}
          selectedOption={selectedOption}
          isCorrect={lastAttempt.isCorrect}
          confidence={confidence}
          cognitiveStatus={lastAttempt.cognitiveStatus}
          onSaveAttribution={handleSaveAttribution}
          initialReason={lastAttempt.errorReason}
          initialNotes={lastAttempt.userNotes}
        />
      )}

      {/* 8. QUESTION NOTE DRAWER */}
      {isNoteDrawerOpen && currentQuestion && (
        <QuestionNoteDrawer
          isOpen={isNoteDrawerOpen}
          onClose={() => setIsNoteDrawerOpen(false)}
          userId={userId}
          question={currentQuestion}
          existingNote={currentNote}
        />
      )}
    </div>
  );
};
