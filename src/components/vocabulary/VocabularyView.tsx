import { useState } from 'react';
import type { VocabularyItem } from '../../types';
import { addVocabularyWord, reviewVocabularyWord, deleteVocabularyWord } from '../../db';
import { 
  Bookmark, 
  Plus, 
  Trash2, 
  Search, 
  Clock, 
  Check, 
  BookA
} from 'lucide-react';

interface VocabularyViewProps {
  userId: string;
  userName: string;
  vocabulary: VocabularyItem[];
}

export const VocabularyView: React.FC<VocabularyViewProps> = ({
  userId,
  userName,
  vocabulary
}) => {
  const [search, setSearch] = useState('');
  const [filterState, setFilterState] = useState<'all' | 'due' | 'learning'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // New word form state
  const [term, setTerm] = useState('');
  const [meaning, setMeaning] = useState('');
  const [context, setContext] = useState('');

  const now = Date.now();

  const handleAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !meaning.trim()) return;

    await addVocabularyWord(userId, term, meaning, context);
    setTerm('');
    setMeaning('');
    setContext('');
    setShowAddModal(false);
  };

  const filteredVocab = vocabulary.filter(item => {
    const matchSearch = item.term.toLowerCase().includes(search.toLowerCase()) ||
      item.meaning.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;

    if (filterState === 'due') return item.nextReview <= now;
    if (filterState === 'learning') return item.state === 'learning';
    return true;
  });

  const dueCount = vocabulary.filter(v => v.nextReview <= now).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50/80 via-white to-slate-50 border border-emerald-100 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Sổ tay từ vựng cá nhân
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {userName} • {vocabulary.length} từ đã lưu
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Personal Vocabulary Bank
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Lưu từ vựng trực tiếp từ đề thi & giải thích. Ôn tập đúng nhịp để ghi nhớ vĩnh viễn.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm từ mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm từ hoặc nghĩa..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterState('all')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all ${
              filterState === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Tất cả ({vocabulary.length})
          </button>
          <button
            onClick={() => setFilterState('due')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              filterState === 'due'
                ? 'bg-amber-500 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>Cần ôn hôm nay</span>
            {dueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono text-[10px]">
                {dueCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Vocabulary Cards List */}
      {filteredVocab.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BookA className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có từ vựng nào trong danh sách!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hãy bấm "Thêm từ mới" ở góc trên hoặc lưu nhanh từ vựng khi đang làm bài luyện tập.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredVocab.map(item => {
            const isDue = item.nextReview <= now;

            return (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 transition-all space-y-3 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-emerald-800">
                        {item.term}
                      </h3>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {item.meaning}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isDue ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          Cần ôn lại
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          Đã nhớ
                        </span>
                      )}
                      <button
                        onClick={() => deleteVocabularyWord(item.id)}
                        title="Xóa từ"
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.context && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                      "{item.context}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    Ổn định: {item.stability.toFixed(1)} ngày • Đã ôn {item.reps} lần
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => reviewVocabularyWord(item.id, false)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-[11px] font-semibold transition-all"
                    >
                      Chưa nhớ
                    </button>
                    <button
                      onClick={() => reviewVocabularyWord(item.id, true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>Nhớ rồi</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-emerald-600" />
                <span>Thêm từ vựng vào Sổ tay của {userName}</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddWord} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Từ / Cụm từ (Term):</label>
                <input
                  type="text"
                  required
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  placeholder="e.g. comply with, prior to..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nghĩa tiếng Việt:</label>
                <input
                  type="text"
                  required
                  value={meaning}
                  onChange={e => setMeaning(e.target.value)}
                  placeholder="e.g. tuân thủ quy định..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Ví dụ / Ngữ cảnh câu (tùy chọn):</label>
                <textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  rows={2}
                  placeholder="e.g. All staff must comply with safety protocols."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-emerald-500 shadow-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-800 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Lưu vào sổ tay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
