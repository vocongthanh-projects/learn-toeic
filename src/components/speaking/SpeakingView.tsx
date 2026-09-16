import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { SpeakingAttempt, SpeakingPrompt, SpeakingTaskType } from '../../types';
import { SPEAKING_PROMPTS } from '../../data/speakingPrompts';
import {
  checkSpeakingServices,
  transcribeAudio,
  scorePronunciation,
  scoreSpeakingContent,
  type LocalServiceStatus
} from '../../utils/speakingClient';
import { saveSpeakingAttempt } from '../../db';
import {
  Mic,
  Square,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  BookOpenText,
  MessageCircleQuestion,
  History,
  Play
} from 'lucide-react';

interface SpeakingViewProps {
  userId: string;
  speakingAttempts: SpeakingAttempt[];
}

const TASK_LABELS: Record<SpeakingTaskType, string> = {
  1: 'Task 1 · Đọc to đoạn văn',
  2: 'Task 2 · Mô tả tranh',
  3: 'Task 3 · Ý kiến / Giải pháp'
};

type RecordState = 'idle' | 'recording' | 'recorded' | 'processing';

export const SpeakingView: React.FC<SpeakingViewProps> = ({ userId, speakingAttempts }) => {
  const [taskType, setTaskType] = useState<SpeakingTaskType>(1);
  const [selectedPromptId, setSelectedPromptId] = useState<string>(SPEAKING_PROMPTS.find(p => p.taskType === 1)!.id);
  const [services, setServices] = useState<LocalServiceStatus | null>(null);
  const [recordState, setRecordState] = useState<RecordState>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [pronunciationScore, setPronunciationScore] = useState<number | null>(null);
  const [mispronounced, setMispronounced] = useState<string[]>([]);
  const [contentResult, setContentResult] = useState<{ score: number; maxScore: number; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkSpeakingServices().then(s => { if (!cancelled) setServices(s); });
    return () => { cancelled = true; };
  }, []);

  const promptsForTask = useMemo(() => SPEAKING_PROMPTS.filter(p => p.taskType === taskType), [taskType]);
  const currentPrompt: SpeakingPrompt = promptsForTask.find(p => p.id === selectedPromptId) || promptsForTask[0];

  const resetResult = () => {
    setAudioUrl(null);
    setTranscript(null);
    setPronunciationScore(null);
    setMispronounced([]);
    setContentResult(null);
    setError(null);
    setRecordState('idle');
    audioBlobRef.current = null;
  };

  const handleSelectTask = (t: SpeakingTaskType) => {
    setTaskType(t);
    const first = SPEAKING_PROMPTS.find(p => p.taskType === t);
    if (first) setSelectedPromptId(first.id);
    resetResult();
  };

  const handleSelectPrompt = (id: string) => {
    setSelectedPromptId(id);
    resetResult();
  };

  const allServicesReady = services?.whisper && services?.ollama && (currentPrompt?.taskType !== 1 || services?.pronunciation);

  const startRecording = async () => {
    resetResult();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        audioBlobRef.current = blob;
        setAudioUrl(URL.createObjectURL(blob));
        setRecordState('recorded');
        stream.getTracks().forEach(t => t.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordState('recording');
    } catch {
      setError('Không truy cập được microphone. Hãy cấp quyền micro cho trình duyệt.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleProcess = async () => {
    if (!audioBlobRef.current || !currentPrompt) return;
    setRecordState('processing');
    setError(null);
    try {
      const text = await transcribeAudio(audioBlobRef.current);
      setTranscript(text);

      let pronScore: number | null = null;
      let mispron: string[] = [];
      if (currentPrompt.taskType === 1 && currentPrompt.readAloudText) {
        const pron = await scorePronunciation(audioBlobRef.current, currentPrompt.readAloudText);
        pronScore = pron.score;
        mispron = pron.mispronouncedWords;
        setPronunciationScore(pron.score);
        setMispronounced(pron.mispronouncedWords);
      }

      const content = await scoreSpeakingContent(currentPrompt, text);
      setContentResult(content);

      await saveSpeakingAttempt({
        id: `speaking_${userId}_${Date.now()}`,
        userId,
        promptId: currentPrompt.id,
        taskType: currentPrompt.taskType,
        transcript: text,
        pronunciationScore: pronScore ?? undefined,
        mispronouncedWords: mispron,
        contentFeedback: content.feedback,
        contentScore: content.score,
        maxContentScore: content.maxScore,
        model: 'qwen2.5:14b-instruct',
        createdAt: Date.now()
      });
      setRecordState('recorded');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi không xác định khi xử lý.');
      setRecordState('recorded');
    }
  };

  const recentAttempts = [...speakingAttempts].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Speaking Practice
          </span>
          <span className="text-xs text-slate-500 font-medium">Ghi âm → Whisper (nghe) → OpenPronounce (phát âm, Task 1) → Ollama (nội dung)</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Luyện nói TOEIC Speaking</h1>
        <p className="text-xs text-slate-500">
          Chỉ hoạt động khi chạy local với whisper-server, pronunciation-server và Ollama đang bật trên máy.
        </p>
      </div>

      {services && (!services.whisper || !services.ollama || (currentPrompt?.taskType === 1 && !services.pronunciation)) && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            <p className="font-bold">Thiếu dịch vụ local cần thiết:</p>
            <ul className="list-disc list-inside">
              {!services.whisper && <li>whisper-server (cổng 8090) — chạy: <code className="bg-amber-100 px-1 rounded">whisper-server -m ~/.whisper-models/ggml-base.en.bin --port 8090 --convert</code></li>}
              {currentPrompt?.taskType === 1 && !services.pronunciation && <li>pronunciation-server (cổng 8091) — chạy script <code className="bg-amber-100 px-1 rounded">scripts/speaking-pronunciation-server.py</code></li>}
              {!services.ollama && <li>Ollama (cổng 11434) — chạy: <code className="bg-amber-100 px-1 rounded">ollama serve</code></li>}
            </ul>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {([1, 2, 3] as SpeakingTaskType[]).map(t => (
          <button
            key={t}
            type="button"
            onClick={() => handleSelectTask(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              taskType === t ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {TASK_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {promptsForTask.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handleSelectPrompt(p.id)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap shrink-0 border transition-all ${
              selectedPromptId === p.id ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Đề {idx + 1}
          </button>
        ))}
      </div>

      {currentPrompt && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          {currentPrompt.taskType === 1 && (
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <BookOpenText className="w-3.5 h-3.5" /> Đọc to đoạn văn sau
              </span>
              <p className="text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-2xl p-4 leading-relaxed">
                {currentPrompt.readAloudText}
              </p>
            </div>
          )}

          {currentPrompt.taskType === 2 && (
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" /> Mô tả bức tranh sau
              </span>
              {currentPrompt.image && (
                <img
                  src={`/${currentPrompt.image}`}
                  alt="Ảnh đề bài Speaking Task 2"
                  className="w-full max-h-80 object-cover rounded-2xl border border-slate-200"
                />
              )}
            </div>
          )}

          {currentPrompt.taskType === 3 && (
            <div className="space-y-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <MessageCircleQuestion className="w-3.5 h-3.5" /> Đề bài
              </span>
              <p className="text-sm text-slate-800 leading-relaxed">{currentPrompt.topic}</p>
            </div>
          )}

          {/* Recording controls */}
          <div className="flex flex-col items-center gap-3 py-4 border-y border-slate-100">
            {recordState !== 'recording' ? (
              <button
                type="button"
                disabled={!allServicesReady || recordState === 'processing'}
                onClick={startRecording}
                title="Bắt đầu ghi âm"
                aria-label="Bắt đầu ghi âm"
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 text-white flex items-center justify-center shadow-lg transition-all"
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                title="Dừng ghi âm"
                aria-label="Dừng ghi âm"
                className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-900 text-white flex items-center justify-center shadow-lg animate-pulse"
              >
                <Square className="w-6 h-6" />
              </button>
            )}
            <span className="text-xs text-slate-500">
              {recordState === 'idle' && 'Bấm để bắt đầu ghi âm'}
              {recordState === 'recording' && 'Đang ghi âm... bấm để dừng'}
              {recordState === 'recorded' && 'Đã ghi âm xong'}
              {recordState === 'processing' && 'Đang xử lý...'}
            </span>

            {audioUrl && recordState !== 'recording' && (
              <audio controls src={audioUrl} className="w-full max-w-sm h-9" />
            )}

            {audioUrl && recordState === 'recorded' && !contentResult && (
              <button
                type="button"
                onClick={handleProcess}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Chấm bài</span>
              </button>
            )}

            {recordState === 'processing' && (
              <div className="flex items-center gap-2 text-rose-600 text-xs font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang nhận diện giọng nói & chấm điểm...</span>
              </div>
            )}
          </div>

          {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl">{error}</div>}

          {transcript && (
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bản chuyển văn bản (transcript)</span>
              <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl p-4 italic">"{transcript}"</p>
            </div>
          )}

          {pronunciationScore !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-1.5">
              <p className="font-extrabold text-blue-900">Điểm phát âm: {pronunciationScore} / 100</p>
              {mispronounced.length > 0 ? (
                <p className="text-xs text-blue-800">Từ phát âm chưa chuẩn: {mispronounced.join(', ')}</p>
              ) : (
                <p className="text-xs text-blue-800">Không phát hiện từ phát âm sai đáng kể.</p>
              )}
            </div>
          )}

          {contentResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-extrabold text-emerald-900">Điểm nội dung: {contentResult.score} / {contentResult.maxScore}</span>
              </div>
              <p className="text-sm text-emerald-950 whitespace-pre-wrap leading-relaxed">{contentResult.feedback}</p>
            </div>
          )}
        </div>
      )}

      {recentAttempts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <History className="w-4 h-4 text-slate-400" />
            <span>Lịch sử luyện nói gần đây</span>
          </h3>
          <div className="space-y-2">
            {recentAttempts.map(a => (
              <div key={a.id} className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-600">{TASK_LABELS[a.taskType]} · {new Date(a.createdAt).toLocaleString('vi-VN')}</span>
                <span className="font-bold text-rose-700">
                  {a.pronunciationScore !== undefined ? `Phát âm ${a.pronunciationScore}/100 · ` : ''}
                  Nội dung {a.contentScore ?? '—'}/{a.maxContentScore}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {speakingAttempts.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 justify-center py-4">
          <Play className="w-4 h-4" />
          <span>Chưa có bài nói nào — thử ghi âm 1 đề ở trên nhé.</span>
        </div>
      )}
    </div>
  );
};
