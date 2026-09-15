import React, { useState } from 'react';
import { LayoutGrid, X } from 'lucide-react';
import type { Question, Attempt } from '../../types';

interface QuestionNavDrawerProps {
  questions: Question[];
  currentIndex: number;
  attemptsMap: Map<string, Attempt>;
  selectedPart: number | null;
  onSelectPart: (part: number | null) => void;
  onJumpToQuestion: (index: number) => void;
}

export const QuestionNavDrawer: React.FC<QuestionNavDrawerProps> = ({
  questions,
  currentIndex,
  attemptsMap,
  selectedPart,
  onSelectPart,
  onJumpToQuestion,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 font-semibold text-xs border border-slate-200 shadow-xs transition-all"
        title="Xem danh sách toàn bộ câu hỏi"
      >
        <LayoutGrid className="w-3.5 h-3.5 text-blue-600" />
        <span>Danh sách câu ({currentIndex + 1}/{questions.length})</span>
      </button>

      {/* Drawer / Modal */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Danh mục câu hỏi</h3>
                  <p className="text-xs text-slate-500">Bấm vào số câu để chuyển đến làm câu đó</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Part Filters inside Drawer */}
            <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Phần thi:</span>
              <button
                type="button"
                onClick={() => onSelectPart(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedPart === null
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả Part
              </button>
              {[5, 6, 7].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onSelectPart(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedPart === p
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  P{p}
                </button>
              ))}
            </div>

            {/* Question Badges Grid */}
            <div className="p-6 overflow-y-auto max-h-[55vh]">
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentIndex;
                  const attempt = attemptsMap.get(q.id);
                  const isAnswered = Boolean(attempt);
                  const isCorrect = attempt?.isCorrect;

                  let badgeStyle = 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400 hover:bg-blue-50';
                  if (isCurrent) {
                    badgeStyle = 'bg-blue-600 border-blue-600 text-white font-bold ring-2 ring-blue-500/30 scale-105';
                  } else if (isAnswered) {
                    if (isCorrect) {
                      badgeStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold';
                    } else {
                      badgeStyle = 'bg-rose-50 border-rose-300 text-rose-800 font-semibold';
                    }
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        onJumpToQuestion(idx);
                        setIsOpen(false);
                      }}
                      className={`h-11 rounded-xl border flex flex-col items-center justify-center text-xs font-mono transition-all relative ${badgeStyle}`}
                    >
                      <span className="text-[10px] font-sans text-slate-400 leading-none">P{q.part}</span>
                      <span className="font-bold leading-tight">{idx + 1}</span>
                      {isAnswered && !isCurrent && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px]">
                          {isCorrect ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                          ) : (
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer status summary */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-600" />
                  <span>Đang làm</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" />
                  <span>Đã làm đúng</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-300" />
                  <span>Đã làm sai</span>
                </span>
              </div>
              <span className="font-medium text-slate-700">Tổng: {questions.length} câu</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
