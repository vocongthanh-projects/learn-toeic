import { useState } from 'react';
import type { Question, CognitiveStatus, ConfidenceLevel, ErrorReason, QuestionVocabItem } from '../../types';
import { addVocabularyWord } from '../../db';
import { getEnrichedExplanation } from '../../utils/explanationEnricher';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  BookOpen, 
  BrainCircuit, 
  Layers, 
  PenTool,
  Check,
  BookmarkPlus,
  FileText,
  BookmarkCheck,
  ArrowRight
} from 'lucide-react';

interface LayeredExplanationProps {
  userId: string;
  question: Question;
  selectedOption?: 'A' | 'B' | 'C' | 'D' | null;
  isCorrect: boolean;
  confidence: ConfidenceLevel;
  cognitiveStatus: CognitiveStatus;
  onSaveAttribution: (reason: ErrorReason, notes: string) => void;
  initialReason?: ErrorReason;
  initialNotes?: string;
}

export const LayeredExplanation: React.FC<LayeredExplanationProps> = ({
  userId,
  question,
  selectedOption,
  isCorrect,
  confidence,
  cognitiveStatus,
  onSaveAttribution,
  initialReason,
  initialNotes = ''
}) => {
  const [activeTab, setActiveTab] = useState<'core' | 'vocab' | 'trap' | 'distractors' | 'trick'>('core');
  const [selectedReason, setSelectedReason] = useState<ErrorReason | undefined>(initialReason);
  const [notes, setNotes] = useState(initialNotes);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // 1-click word save tracking
  const [savedWordKeys, setSavedWordKeys] = useState<Set<string>>(new Set());

  // Manual word save form
  const [vocabTerm, setVocabTerm] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabSuccess, setVocabSuccess] = useState(false);

  // Enriched question data (clean translation, deep grammar, word family, key vocab)
  const enriched = getEnrichedExplanation(question);
  const wordFamily = enriched.wordFamily || [];
  const keyVocab = enriched.keyVocabulary || [];
  const totalVocabCount = wordFamily.length + keyVocab.length;

  const handleQuickSaveWord = async (item: QuestionVocabItem) => {
    const wordKey = item.word.toLowerCase();
    if (savedWordKeys.has(wordKey)) return;
    
    await addVocabularyWord(
      userId, 
      item.word, 
      item.meaning + (item.pos ? ` (${item.pos})` : ''), 
      question.question, 
      question.id
    );

    setSavedWordKeys(prev => new Set(prev).add(wordKey));
  };

  const handleSaveVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabTerm.trim() || !vocabMeaning.trim()) return;
    await addVocabularyWord(userId, vocabTerm, vocabMeaning, question.question, question.id);
    setSavedWordKeys(prev => new Set(prev).add(vocabTerm.trim().toLowerCase()));
    setVocabTerm('');
    setVocabMeaning('');
    setVocabSuccess(true);
    setTimeout(() => setVocabSuccess(false), 2000);
  };

  const confidenceLabels: Record<ConfidenceLevel, string> = {
    sure: 'Rất tự tin (100%)',
    likely: 'Khá chắc (75%)',
    guess: 'Đoán mò (50%)',
    no_idea: 'Chưa biết (0%)'
  };

  const errorReasons: { id: ErrorReason; label: string; icon: string }[] = [
    { id: 'careless', label: 'Làm ẩu / Chọn vội', icon: '⚡' },
    { id: 'misread', label: 'Nhìn nhầm / Đọc sót từ', icon: '👁️' },
    { id: 'trap', label: 'Dính bẫy Distractor', icon: '🪤' },
    { id: 'unknown_vocab', label: 'Không biết từ vựng này', icon: '📖' },
    { id: 'grammar_gap', label: 'Hổng lý thuyết ngữ pháp', icon: '🧩' },
  ];

  const handleSave = () => {
    if (selectedReason) {
      onSaveAttribution(selectedReason, notes);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // Status visual mapping (Study4 Light Theme)
  const isSkipped = !selectedOption;
  const statusMeta = isSkipped ? {
    title: 'Chưa trả lời (Bỏ trống)',
    desc: 'Câu hỏi này bạn chưa chọn đáp án trong bài thi. Hãy xem kỹ phần dịch nghĩa, ngữ pháp và bẫy bên dưới để nắm vững kiến thức.',
    bg: 'bg-amber-50 border-amber-200 text-amber-900',
    icon: <HelpCircle className="w-5 h-5 text-amber-600" />
  } : {
    mastered: {
      title: 'Đã nắm vững (Mastered)',
      desc: 'Bạn rất tự tin và đã trả lời chính xác. Thuật toán sẽ giãn cách thời gian ôn tập câu này.',
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    },
    lucky_guess: {
      title: 'Đoán đúng (Lucky Guess)',
      desc: 'Bạn đã chọn đúng nhưng mức tự tin là đoán mò. Câu này đã được đưa vào hàng đợi kiểm chứng.',
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />
    },
    misconception: {
      title: 'Hiểu lầm nghiêm trọng (Misconception)!',
      desc: 'Bạn rất tự tin nhưng lại chọn sai! Đây là bẫy nhận thức nguy hiểm cần đọc kỹ lý do bên dưới.',
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <XCircle className="w-5 h-5 text-rose-600" />
    },
    knowledge_gap: {
      title: 'Lỗ hổng kiến thức (Knowledge Gap)',
      desc: 'Bạn chưa chắc chắn và đã chọn sai. Hãy đọc kỹ phần phân tích ngữ pháp để củng cố nền tảng.',
      bg: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <HelpCircle className="w-5 h-5 text-blue-600" />
    }
  }[cognitiveStatus];

  // Helper render POS badge
  const renderPosBadge = (pos?: string) => {
    if (!pos) return null;
    const p = pos.toLowerCase();
    if (p === 'n') return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Danh từ (n)</span>;
    if (p === 'v') return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Động từ (v)</span>;
    if (p === 'adj') return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Tính từ (adj)</span>;
    if (p === 'adv') return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Trạng từ (adv)</span>;
    if (p === 'phrase' || p === 'colloc') return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Cụm từ</span>;
    return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{pos}</span>;
  };

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-in fade-in duration-300">
      {/* Banner chẩn đoán nhận thức */}
      <div className={`p-4 sm:p-5 border-b flex items-start gap-3.5 ${statusMeta.bg}`}>
        <div className="mt-0.5">{statusMeta.icon}</div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-extrabold text-sm">{statusMeta.title}</h4>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white font-semibold border border-slate-200 text-slate-700 shadow-xs">
              {selectedOption 
                ? `Bạn chọn ${selectedOption} (${confidenceLabels[confidence]}) • Đáp án đúng: ` 
                : 'Chưa chọn đáp án (Bỏ trống) • Đáp án đúng: '}
              <strong>{question.correctAnswer}</strong>
            </span>
          </div>
          <p className="text-xs mt-1.5 opacity-90 leading-relaxed">{statusMeta.desc}</p>
        </div>
      </div>

      {/* Navigation tabs for explanation */}
      <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('core')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'core'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
          <span>Dịch & Ngữ pháp</span>
        </button>

        <button
          onClick={() => setActiveTab('vocab')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'vocab'
              ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600" />
          <span>Từ vựng & Họ từ</span>
          {totalVocabCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-bold ml-0.5">
              {totalVocabCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('trap')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'trap'
              ? 'bg-white text-rose-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5 text-rose-600" />
          <span>Vì sao dễ chọn sai?</span>
        </button>

        <button
          onClick={() => setActiveTab('distractors')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'distractors'
              ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span>Bẫy từng phương án</span>
        </button>

        <button
          onClick={() => setActiveTab('trick')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${
            activeTab === 'trick'
              ? 'bg-white text-amber-800 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-600" />
          <span>Mẹo 5 giây</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 text-slate-800 text-sm leading-relaxed min-h-[180px]">
        {/* TAB 1: DỊCH & NGỮ PHÁP */}
        {activeTab === 'core' && (
          <div className="space-y-5">
            {/* Dịch câu tiếng Việt chuẩn */}
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span>Dịch nghĩa câu:</span>
              </span>
              <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-4 rounded-2xl border border-blue-100/80 text-slate-800 font-medium text-sm sm:text-base leading-relaxed">
                "{enriched.translation}"
              </div>
            </div>

            {/* Phân tích cấu trúc câu & Ngữ pháp */}
            <div>
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Phân tích cấu trúc câu & Lý do chọn:</span>
              </span>
              <div className="text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 text-xs sm:text-sm font-sans">
                {enriched.grammarBreakdown}
              </div>
            </div>

            {/* Quick banner to Vocabulary Tab */}
            {totalVocabCount > 0 && (
              <div 
                onClick={() => setActiveTab('vocab')}
                className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between cursor-pointer hover:border-emerald-300 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <BookmarkPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">
                      Khám phá {totalVocabCount} từ vựng & họ từ trong câu này
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Xem nghĩa chi tiết, loại từ và lưu 1-click vào Sổ tay cá nhân
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  <span>Xem từ vựng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}

            {question.evidence && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Dẫn chứng trong bài đọc / hội thoại (Evidence):</span>
                </div>
                <p className="text-xs sm:text-sm font-medium italic">
                  "{question.evidence}"
                </p>
                {question.evidenceLocation && (
                  <span className="inline-block text-[11px] px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono">
                    📍 Vị trí: {question.evidenceLocation}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TỪ VỰNG & HỌ TỪ (WORD FAMILY & KEY VOCAB) */}
        {activeTab === 'vocab' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkPlus className="w-4 h-4 text-emerald-600" />
                <span>Từ vựng trọng tâm & Họ từ trong câu ({totalVocabCount} từ):</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Bấm "+ Lưu từ" để đưa vào Sổ tay ôn tập (Spaced Repetition)
              </span>
            </div>

            {/* 1. HỌ TỪ VỰNG (WORD FAMILY) */}
            {wordFamily.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    <span>Họ từ vựng biến thể (Word Family):</span>
                  </span>
                  <span className="text-[11px] text-blue-700 italic">
                    Rất quan trọng cho các câu hỏi Word Form Part 5
                  </span>
                </div>

                <div className="grid gap-2.5 grid-cols-1">
                  {wordFamily.map(item => {
                    const isSaved = savedWordKeys.has(item.word.toLowerCase());
                    const isCorrect = item.word.toLowerCase() === (question.options.find(o => o.key === question.correctAnswer)?.text || '').toLowerCase();
                    return (
                      <div 
                        key={item.word}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isCorrect 
                            ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-500/20' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900">
                              {item.word}
                            </span>
                            {item.phonetic && (
                              <span className="text-xs text-slate-400 font-mono">
                                {item.phonetic}
                              </span>
                            )}
                            {renderPosBadge(item.pos)}
                            {isCorrect && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
                                Đáp án đúng
                              </span>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700">
                            {item.meaning}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickSaveWord(item)}
                          className={`self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                            isSaved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>✓ Đã lưu</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>+ Lưu từ</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. TỪ VỰNG CỐT LÕI (KEY BUSINESS VOCABULARY) */}
            {keyVocab.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Từ vựng & Cụm từ thương mại trong câu (Key Vocabulary):</span>
                  </span>
                </div>

                <div className="grid gap-2.5 grid-cols-1">
                  {keyVocab.map(item => {
                    const isSaved = savedWordKeys.has(item.word.toLowerCase());
                    return (
                      <div 
                        key={item.word}
                        className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-sm sm:text-base text-slate-900">
                              {item.word}
                            </span>
                            {item.phonetic && (
                              <span className="text-xs text-slate-400 font-mono">
                                {item.phonetic}
                              </span>
                            )}
                            {renderPosBadge(item.pos)}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700">
                            {item.meaning}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleQuickSaveWord(item)}
                          className={`self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-xs ${
                            isSaved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02]'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-700" />
                              <span>✓ Đã lưu</span>
                            </>
                          ) : (
                            <>
                              <BookmarkPlus className="w-3.5 h-3.5" />
                              <span>+ Lưu từ</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {totalVocabCount === 0 && (
              <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                <BookmarkPlus className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <p className="text-xs font-medium">Chưa có từ vựng tự động được trích xuất cho câu này.</p>
                <p className="text-[11px] text-slate-400 mt-1">Bạn có thể tự thêm từ mới vào Sổ tay ở khung bên dưới.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VÌ SAO DỄ CHỌN SAI */}
        {activeTab === 'trap' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4 text-rose-600" />
              <span>Phân tích bẫy tâm lý (Why you got this wrong):</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-2">
              <p className="leading-relaxed">{enriched.whyYouGotItWrong}</p>
            </div>
            <p className="text-xs text-slate-500 italic">
              💡 Bẫy tâm lý là lý do chính khiến học sinh ở mức 500-750 bị chững điểm. Nắm được logic của người ra đề sẽ giúp bạn phản xạ tự nhiên khi gặp lại.
            </p>
          </div>
        )}

        {/* TAB 4: BẪY TỪNG PHƯƠNG ÁN */}
        {activeTab === 'distractors' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
              Vì sao các lựa chọn còn lại sai? (Distractor Analysis)
            </span>
            <div className="space-y-2">
              {question.options.map(opt => {
                const isCorrectOpt = opt.key === question.correctAnswer;
                const reason = enriched.distractors?.[opt.key];
                return (
                  <div 
                    key={opt.key}
                    className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
                      isCorrectOpt
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <span className="font-bold mr-2 text-slate-900">
                      [{opt.key}] {opt.text}:
                    </span>
                    {isCorrectOpt ? (
                      <span className="text-emerald-700 font-bold">✓ ĐÁP ÁN ĐÚNG</span>
                    ) : (
                      <span>{reason || 'Không phù hợp ngữ cảnh hoặc sai ngữ pháp.'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: MẸO 5 GIÂY */}
        {activeTab === 'trick' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Mẹo nhận diện nhanh (Quick Trick):</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs sm:text-sm whitespace-pre-line leading-relaxed font-mono">
              {enriched.quickTrick}
            </div>
          </div>
        )}
      </div>

      {/* Phần bóc tách nguyên nhân sai (Error Attribution) */}
      {(!isCorrect || cognitiveStatus === 'lucky_guess') && (
        <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <PenTool className="w-3.5 h-3.5 text-blue-600" />
              <span>Bóc tách nguyên nhân & Lưu vào Sổ tay:</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Giúp hệ thống xếp lịch ôn đúng chỗ
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {errorReasons.map(r => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedReason(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  selectedReason === r.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 items-center pt-1">
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ghi chú nhanh cho chính mình (ví dụ: 'phải nhớ responsible for V-ing')..."
              className="w-full sm:flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-400 shadow-xs"
            />
            <button
              onClick={handleSave}
              disabled={!selectedReason}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                selectedReason
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Đã lưu!</span>
                </>
              ) : (
                <span>Lưu sổ tay</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lưu từ vựng nhanh vào sổ tay cá nhân */}
      <div className="p-5 bg-emerald-50/40 border-t border-emerald-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <BookmarkPlus className="w-4 h-4 text-emerald-600" />
            <span>Lưu từ vựng từ câu này vào Sổ tay cá nhân:</span>
          </span>
          {vocabSuccess && (
            <span className="text-[11px] text-emerald-700 font-bold animate-pulse flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Đã lưu vào từ vựng!
            </span>
          )}
        </div>
        <form onSubmit={handleSaveVocab} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={vocabTerm}
            onChange={e => setVocabTerm(e.target.value)}
            placeholder="Từ / cụm từ (e.g. responsible for)..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
          <input
            type="text"
            value={vocabMeaning}
            onChange={e => setVocabMeaning(e.target.value)}
            placeholder="Nghĩa tiếng Việt..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
          />
          <button
            type="submit"
            disabled={!vocabTerm.trim() || !vocabMeaning.trim()}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs shadow-xs transition-all whitespace-nowrap"
          >
            + Lưu từ
          </button>
        </form>
      </div>
    </div>
  );
};
