import { useState } from 'react';
import type { Attempt, ErrorReason, ConfidenceLevel } from '../../types';
import { SAMPLE_QUESTIONS } from '../../data/questions';
import { TAXONOMY } from '../../data/taxonomy';
import { 
  RotateCcw, 
  Filter, 
  AlertOctagon, 
  Dice5, 
  Sparkles, 
  Tag, 
  PenLine, 
  CheckCircle2, 
  XCircle
} from 'lucide-react';

interface MistakeBankViewProps {
  userId: string;
  userName: string;
  attempts: Attempt[];
  onStartDrill: (questionIds: string[], title: string) => void;
}

export const MistakeBankView: React.FC<MistakeBankViewProps> = ({
  userName,
  attempts,
  onStartDrill
}) => {
  const [partFilter, setPartFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [reasonFilter, setReasonFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [masteredFilter, setMasteredFilter] = useState<'all' | 'unmastered' | 'mastered'>('all');

  const questionMap = new Map(SAMPLE_QUESTIONS.map(q => [q.id, q]));

  // Find all questions the user has ever attempted
  const attemptsByQuestion: Record<string, Attempt[]> = {};
  for (const a of attempts) {
    if (!attemptsByQuestion[a.questionId]) {
      attemptsByQuestion[a.questionId] = [];
    }
    attemptsByQuestion[a.questionId].push(a);
  }

  // Determine latest status for each question
  const questionStatusMap: Record<string, { latestAttempt: Attempt; isMastered: boolean; hasEverFailed: boolean }> = {};
  for (const [qId, qAttempts] of Object.entries(attemptsByQuestion)) {
    const sorted = [...qAttempts].sort((a, b) => b.timestamp - a.timestamp);
    const latest = sorted[0];
    const hasEverFailed = sorted.some(a => !a.isCorrect || a.cognitiveStatus === 'lucky_guess');
    const isMastered = latest.isCorrect && (latest.confidence === 'sure' || latest.confidence === 'likely');
    questionStatusMap[qId] = { latestAttempt: latest, isMastered, hasEverFailed };
  }

  // Filter only questions that have ever been a mistake or lucky guess
  const mistakeQuestionIds = Object.keys(questionStatusMap).filter(
    qId => questionStatusMap[qId].hasEverFailed
  );

  // Apply detailed multi-criteria filters
  const filteredQuestionIds = mistakeQuestionIds.filter(qId => {
    const q = questionMap.get(qId);
    if (!q) return false;
    const { latestAttempt, isMastered } = questionStatusMap[qId];

    if (partFilter !== 'all' && q.part.toString() !== partFilter) return false;
    if (topicFilter !== 'all' && !q.knowledgeNodeIds.includes(topicFilter)) return false;

    if (reasonFilter !== 'all') {
      const hadReason = attemptsByQuestion[qId].some(a => a.errorReason === reasonFilter);
      if (!hadReason) return false;
    }

    if (confidenceFilter !== 'all' && latestAttempt.confidence !== confidenceFilter) return false;

    if (masteredFilter === 'unmastered' && isMastered) return false;
    if (masteredFilter === 'mastered' && !isMastered) return false;

    return true;
  });

  const errorReasonLabels: Record<ErrorReason, { label: string; icon: string }> = {
    careless: { label: 'Làm ẩu / Chọn vội', icon: '⚡' },
    misread: { label: 'Nhìn nhầm / Đọc sót', icon: '👁️' },
    trap: { label: 'Dính bẫy Distractor', icon: '🪤' },
    unknown_vocab: { label: 'Không biết từ mới', icon: '📖' },
    grammar_gap: { label: 'Hổng lý thuyết ngữ pháp', icon: '🧩' }
  };

  const confidenceLabels: Record<ConfidenceLevel, string> = {
    sure: 'Rất tự tin',
    likely: 'Khá chắc',
    guess: 'Đoán mò',
    no_idea: 'Chưa biết'
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-50/80 via-white to-slate-50 border border-rose-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-100/70 px-2.5 py-0.5 rounded-full border border-rose-200">
              Sổ tay câu sai của {userName}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {mistakeQuestionIds.length} câu từng làm sai / đoán mò
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Mistake Bank & Error Classification
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Làm lại câu sai sẽ lưu một lượt làm mới (Attempt), giữ nguyên lịch sử cũ để đo lường tiến bộ thực tế.
          </p>
        </div>

        {filteredQuestionIds.length > 0 && (
          <button
            onClick={() => onStartDrill(filteredQuestionIds, `Làm lại ${filteredQuestionIds.length} câu sai`)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-600/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry {filteredQuestionIds.length} câu này</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-2.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" />
          <span>Bộ lọc nâng cao:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Part Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Phần thi (Part):</label>
            <select
              value={partFilter}
              onChange={e => setPartFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tất cả Part Reading (5-7)</option>
              <option value="5">Part 5 - Hoàn thành câu (Incomplete)</option>
              <option value="6">Part 6 - Điền đoạn văn (Text Completion)</option>
              <option value="7">Part 7 - Đọc hiểu (Reading)</option>
            </select>
          </div>

          {/* Topic Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Chuyên đề kiến thức:</label>
            <select
              value={topicFilter}
              onChange={e => setTopicFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tất cả chuyên đề</option>
              {Object.values(TAXONOMY).map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Error Reason Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Nguyên nhân sai:</label>
            <select
              value={reasonFilter}
              onChange={e => setReasonFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tất cả nguyên nhân</option>
              <option value="trap">🪤 Dính bẫy Distractor</option>
              <option value="careless">⚡ Làm ẩu / Chọn vội</option>
              <option value="misread">👁️ Nhìn nhầm / Đọc sót</option>
              <option value="unknown_vocab">📖 Không biết từ mới</option>
              <option value="grammar_gap">🧩 Hổng ngữ pháp</option>
            </select>
          </div>

          {/* Confidence Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Mức tự tin:</label>
            <select
              value={confidenceFilter}
              onChange={e => setConfidenceFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tất cả mức tự tin</option>
              {Object.entries(confidenceLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Mastered Status Filter */}
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Trạng thái:</label>
            <select
              value={masteredFilter}
              onChange={e => setMasteredFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-2 focus:outline-none focus:border-blue-500 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unmastered">⚠️ Chưa mastered (cần làm lại)</option>
              <option value="mastered">✅ Đã mastered (đã làm đúng lại)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Question Cards */}
      {filteredQuestionIds.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không có câu sai nào khớp với bộ lọc!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy thử điều chỉnh bộ lọc hoặc tiếp tục làm bài ở mục Practice.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestionIds.map(qId => {
            const q = questionMap.get(qId);
            if (!q) return null;

            const { latestAttempt, isMastered } = questionStatusMap[qId];
            const qAttempts = attemptsByQuestion[qId] || [];
            const primaryNode = q.knowledgeNodeIds[0] ? TAXONOMY[q.knowledgeNodeIds[0]] : null;
            const reasonMeta = latestAttempt.errorReason ? errorReasonLabels[latestAttempt.errorReason] : null;

            return (
              <div
                key={qId}
                className={`p-6 rounded-3xl border transition-all space-y-4 shadow-xs bg-white ${
                  isMastered
                    ? 'border-emerald-200'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                      Part {q.part}
                    </span>
                    {primaryNode && (
                      <span className="text-xs text-slate-700 font-semibold flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        {primaryNode.name}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      (Đã làm {qAttempts.length} lần)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Mastery Status Badge */}
                    {isMastered ? (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Đã Mastered
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Chưa Mastered
                      </span>
                    )}

                    {/* Cognitive Badge */}
                    {latestAttempt.cognitiveStatus === 'misconception' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertOctagon className="w-3 h-3 text-rose-600" />
                        Hiểu lầm
                      </span>
                    )}
                    {latestAttempt.cognitiveStatus === 'lucky_guess' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Dice5 className="w-3 h-3 text-amber-600" />
                        Đoán mò
                      </span>
                    )}

                    {/* Reason badge */}
                    {reasonMeta && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {reasonMeta.icon} {reasonMeta.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Question */}
                <p className="text-base font-semibold text-slate-900 leading-relaxed">
                  {q.question}
                </p>

                {/* Options */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {q.options.map(opt => {
                    const isLatestSelected = latestAttempt.selectedOption === opt.key;
                    const isCorrect = q.correctAnswer === opt.key;
                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                            : isLatestSelected
                            ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="font-bold">[{opt.key}]</span>
                        <span className="truncate">{opt.text}</span>
                        {isCorrect && <span className="ml-auto text-[11px] font-bold text-emerald-600">✓</span>}
                        {isLatestSelected && !isCorrect && <span className="ml-auto text-[11px] font-bold text-rose-600">✗</span>}
                      </div>
                    );
                  })}
                </div>

                {/* User Notes & Explanations */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {latestAttempt.userNotes && (
                    <div className="flex items-start gap-2 p-3 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950">
                      <PenLine className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-800">Ghi chú của bạn:</strong> {latestAttempt.userNotes}
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 rounded-2xl bg-blue-50/40 border border-blue-100 text-xs text-slate-700 space-y-1">
                    <span className="text-blue-700 font-bold uppercase tracking-wider text-[10px] block">
                      Vì sao bạn đã chọn sai:
                    </span>
                    <p className="italic text-slate-800 leading-relaxed">
                      {q.explanation.whyYouGotItWrong}
                    </p>
                  </div>
                </div>

                {/* Retry Single Question */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => onStartDrill([q.id], `Làm lại câu ${q.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-700 hover:text-white text-xs font-bold transition-all group shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-45 transition-transform" />
                    <span>Làm lại câu này</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
