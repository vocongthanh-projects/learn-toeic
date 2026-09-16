import React, { useEffect, useMemo, useState } from 'react';
import type { WritingAttempt, WritingPrompt, WritingTaskType } from '../../types';
import { WRITING_PROMPTS } from '../../data/writingPrompts';
import { checkOllamaAvailable, scoreWritingWithOllama, DEFAULT_WRITING_MODEL, type WritingScoreResult } from '../../utils/ollamaClient';
import { saveWritingAttempt } from '../../db';
import { PenSquare, Sparkles, AlertTriangle, CheckCircle2, Loader2, Image as ImageIcon, Mail, MessageSquareText, History } from 'lucide-react';

interface WritingViewProps {
  userId: string;
  writingAttempts: WritingAttempt[];
}

const TASK_LABELS: Record<WritingTaskType, string> = {
  1: 'Task 1 · Mô tả tranh',
  2: 'Task 2 · Trả lời email',
  3: 'Task 3 · Bài luận ý kiến'
};

function countWords(text: string): number {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length;
}

export const WritingView: React.FC<WritingViewProps> = ({ userId, writingAttempts }) => {
  const [taskType, setTaskType] = useState<WritingTaskType>(1);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'ok' | 'unavailable'>('checking');
  const [selectedPromptId, setSelectedPromptId] = useState<string>(WRITING_PROMPTS.find(p => p.taskType === 1)!.id);
  const [answer, setAnswer] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [scoreError, setScoreError] = useState<string | null>(null);
  const [result, setResult] = useState<WritingScoreResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkOllamaAvailable().then(ok => {
      if (!cancelled) setOllamaStatus(ok ? 'ok' : 'unavailable');
    });
    return () => { cancelled = true; };
  }, []);

  const promptsForTask = useMemo(() => WRITING_PROMPTS.filter(p => p.taskType === taskType), [taskType]);
  const currentPrompt: WritingPrompt = promptsForTask.find(p => p.id === selectedPromptId) || promptsForTask[0];

  const handleSelectTask = (t: WritingTaskType) => {
    setTaskType(t);
    const first = WRITING_PROMPTS.find(p => p.taskType === t);
    if (first) setSelectedPromptId(first.id);
    setAnswer('');
    setResult(null);
    setScoreError(null);
  };

  const handleSelectPrompt = (id: string) => {
    setSelectedPromptId(id);
    setAnswer('');
    setResult(null);
    setScoreError(null);
  };

  const handleScore = async () => {
    if (!currentPrompt || !answer.trim()) return;
    setIsScoring(true);
    setScoreError(null);
    setResult(null);
    try {
      const scored = await scoreWritingWithOllama(currentPrompt, answer);
      setResult(scored);
      await saveWritingAttempt({
        id: `writing_${userId}_${Date.now()}`,
        userId,
        promptId: currentPrompt.id,
        taskType: currentPrompt.taskType,
        userAnswer: answer,
        feedback: scored.feedback,
        score: scored.score,
        maxScore: scored.maxScore,
        model: DEFAULT_WRITING_MODEL,
        createdAt: Date.now()
      });
    } catch (err) {
      setScoreError(err instanceof Error ? err.message : 'Có lỗi không xác định khi chấm bài.');
    } finally {
      setIsScoring(false);
    }
  };

  const wordCount = countWords(answer);
  const recentAttempts = [...writingAttempts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Writing Practice
          </span>
          <span className="text-xs text-slate-500 font-medium">Chấm bài bằng AI chạy local (Ollama)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Luyện viết TOEIC Writing</h1>
        <p className="text-xs text-slate-500">
          Tính năng này chỉ hoạt động khi bạn chạy app ở local với Ollama đang bật trên máy — không hoạt động trên bản deploy công khai.
        </p>
      </div>

      {/* Ollama status banner */}
      {ollamaStatus === 'unavailable' && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">Không kết nối được tới Ollama (localhost:11434)</p>
            <p>Hãy mở terminal và chạy <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">ollama serve</code>, đảm bảo đã tải model bằng <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">ollama pull {DEFAULT_WRITING_MODEL}</code>, rồi tải lại trang này.</p>
          </div>
        </div>
      )}

      {/* Task tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {([1, 2, 3] as WritingTaskType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleSelectTask(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              taskType === t ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {TASK_LABELS[t]}
          </button>
        ))}
      </div>

      {/* Prompt picker */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {promptsForTask.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPrompt(p.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all ${
              selectedPromptId === p.id
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Đề {idx + 1}
          </button>
        ))}
      </div>

      {currentPrompt && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          {/* Prompt content */}
          {currentPrompt.taskType === 1 && (
            <div className="space-y-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" /> Viết 1 câu mô tả liên quan đến bức ảnh
              </span>
              {currentPrompt.image && (
                <img
                  src={`/${currentPrompt.image}`}
                  alt="Ảnh đề bài Writing Task 1"
                  className="w-full max-h-80 object-cover rounded-2xl border border-slate-200"
                />
              )}
              <p className="text-sm text-slate-800">
                Bắt buộc dùng cả 2 từ:{' '}
                <strong className="text-purple-700">"{currentPrompt.requiredWords?.[0]}"</strong> và{' '}
                <strong className="text-purple-700">"{currentPrompt.requiredWords?.[1]}"</strong>
              </p>
            </div>
          )}

          {currentPrompt.taskType === 2 && (
            <div className="space-y-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <Mail className="w-3.5 h-3.5" /> Đọc email và viết thư trả lời
              </span>
              <pre className="whitespace-pre-wrap font-sans text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                {currentPrompt.emailContent}
              </pre>
              <div className="text-xs text-slate-600">
                <p className="font-bold mb-1">Bài trả lời cần đề cập đủ:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {currentPrompt.requiredPoints?.map((pt, i) => <li key={i}>{pt}</li>)}
                </ul>
              </div>
            </div>
          )}

          {currentPrompt.taskType === 3 && (
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <MessageSquareText className="w-3.5 h-3.5" /> Đề bài luận
              </span>
              <p className="text-sm text-slate-800 leading-relaxed">{currentPrompt.essayTopic}</p>
            </div>
          )}

          {/* Answer textarea */}
          <div className="space-y-1.5">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={currentPrompt.taskType === 3 ? 12 : currentPrompt.taskType === 2 ? 6 : 2}
              placeholder="Viết bài làm của bạn ở đây..."
              className="w-full p-4 rounded-2xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Tối thiểu gợi ý: {currentPrompt.minWords} từ</span>
              <span className={wordCount < currentPrompt.minWords ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {wordCount} từ
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!answer.trim() || isScoring || ollamaStatus !== 'ok'}
            onClick={handleScore}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            {isScoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isScoring ? 'AI đang chấm bài...' : 'Chấm bài bằng AI'}</span>
          </button>

          {scoreError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">{scoreError}</div>
          )}

          {result && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-emerald-900">
                  Điểm: {result.score} / {result.maxScore}
                </span>
              </div>
              <p className="text-sm text-emerald-950 whitespace-pre-wrap leading-relaxed">{result.feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* History */}
      {recentAttempts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <History className="w-4 h-4 text-slate-400" />
            <span>Lịch sử chấm bài gần đây</span>
          </h3>
          <div className="space-y-2">
            {recentAttempts.map(a => (
              <div key={a.id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">{TASK_LABELS[a.taskType]} · {new Date(a.createdAt).toLocaleString('vi-VN')}</span>
                <span className="font-bold text-purple-700">{a.score ?? '—'} / {a.maxScore}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {writingAttempts.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-4">
          <PenSquare className="w-4 h-4" />
          <span>Chưa có bài viết nào — thử làm 1 đề ở trên nhé.</span>
        </div>
      )}
    </div>
  );
};
