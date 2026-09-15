import React, { useState, useMemo } from 'react';
import type { UserNote, Question } from '../../types';
import { saveUserNote, deleteUserNote, updateUserNote } from '../../db';
import { SAMPLE_QUESTIONS } from '../../data/questions';
import { 
  Search, 
  Plus, 
  FileText, 
  Trash2, 
  Edit3, 
  Calendar, 
  ExternalLink, 
  BookOpen, 
  Sparkles, 
  X,
  Tag as TagIcon
} from 'lucide-react';

interface NotesViewProps {
  userId: string;
  userName: string;
  notes: UserNote[];
  onStartDrill?: (questionIds: string[], title: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  userId,
  notes,
  onStartDrill
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<UserNote | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [modalPart, setModalPart] = useState<number | undefined>(undefined);
  const [modalTagInput, setModalTagInput] = useState('');
  const [modalTags, setModalTags] = useState<string[]>([]);

  // Map of question id to Question object for quick reference
  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    for (const q of SAMPLE_QUESTIONS) {
      map.set(q.id, q);
    }
    return map;
  }, []);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const n of notes) {
      if (n.tags) {
        for (const t of n.tags) tagSet.add(t);
      }
    }
    return Array.from(tagSet);
  }, [notes]);

  // Filtered notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(q);
        const matchContent = n.content.toLowerCase().includes(q);
        const matchTag = n.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchTitle && !matchContent && !matchTag) return false;
      }
      // Part filter
      if (selectedPart !== null && n.part !== selectedPart) return false;
      // Tag filter
      if (selectedTag !== null && (!n.tags || !n.tags.includes(selectedTag))) return false;

      return true;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, searchQuery, selectedPart, selectedTag]);

  const openCreateModal = () => {
    setEditingNote(null);
    setModalTitle('');
    setModalContent('');
    setModalPart(undefined);
    setModalTags(['Kiến thức']);
    setIsModalOpen(true);
  };

  const openEditModal = (note: UserNote) => {
    setEditingNote(note);
    setModalTitle(note.title);
    setModalContent(note.content);
    setModalPart(note.part);
    setModalTags(note.tags || []);
    setIsModalOpen(true);
  };

  const handleModalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalContent.trim()) return;

    if (editingNote) {
      await updateUserNote(editingNote.id, {
        title: modalTitle.trim() || 'Ghi chú học tập',
        content: modalContent.trim(),
        part: modalPart,
        tags: modalTags
      });
    } else {
      await saveUserNote(userId, modalContent.trim(), {
        title: modalTitle.trim() || 'Ghi chú học tập',
        part: modalPart,
        tags: modalTags
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (noteId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
      await deleteUserNote(noteId);
    }
  };

  const handleAddModalTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && modalTagInput.trim()) {
      e.preventDefault();
      const val = modalTagInput.trim();
      if (!modalTags.includes(val)) {
        setModalTags([...modalTags, val]);
      }
      setModalTagInput('');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Personal Knowledge Notebook
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {notes.length} ghi chú đã lưu
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sổ Ghi Chú & Mẹo Làm Bài
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Lưu trữ mẹo ngữ pháp, bẫy distractor thực chiến và ghi chú riêng cho từng câu hỏi để tra cứu nhanh.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo ghi chú mới</span>
        </button>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-xs space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm theo tiêu đề, nội dung ghi chú hoặc thẻ tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ×
            </button>
          )}
        </div>

        {/* Part Tabs Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedPart(null)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
              selectedPart === null
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Tất cả ({notes.length})
          </button>

          {([1, 2, 3, 4, 5, 6, 7] as const).map(p => {
            const count = notes.filter(n => n.part === p).length;
            const isSelected = selectedPart === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPart(isSelected ? null : p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
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

        {/* Tags Row */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <TagIcon className="w-3 h-3" />
              <span>Thẻ:</span>
            </span>
            {allTags.map(tag => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag)}
                  className={`px-2.5 py-0.5 rounded-lg text-[11px] font-medium border transition-all ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-[11px] text-blue-600 hover:underline ml-1"
              >
                Bỏ lọc thẻ
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. Notes Grid / Empty State */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <FileText className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {notes.length === 0 ? 'Chưa có ghi chú nào' : 'Không tìm thấy ghi chú phù hợp'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {notes.length === 0
                ? 'Hãy bấm nút "Tạo ghi chú mới" hoặc bấm biểu tượng ghi chú khi làm bài trong phần Luyện tập.'
                : 'Thử đổi từ khóa tìm kiếm hoặc bỏ chọn bộ lọc Part / Thẻ.'}
            </p>
          </div>
          {notes.length === 0 && (
            <button
              type="button"
              onClick={openCreateModal}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
            >
              + Tạo ghi chú đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => {
            const linkedQ = note.questionId ? questionMap.get(note.questionId) : undefined;
            const formattedDate = new Date(note.updatedAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            return (
              <div
                key={note.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Note Top Bar */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {note.part && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-[11px]">
                          Part {note.part}
                        </span>
                      )}
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-700 transition-colors">
                        {note.title}
                      </h4>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => openEditModal(note)}
                        className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
                        title="Chỉnh sửa ghi chú"
                        aria-label="Chỉnh sửa ghi chú"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.id)}
                        className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition-colors"
                        title="Xóa ghi chú"
                        aria-label="Xóa ghi chú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body */}
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/70 p-3 rounded-2xl border border-slate-100 font-sans">
                    {note.content}
                  </p>
                </div>

                {/* Linked Question (if present) */}
                {linkedQ && (
                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-950 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-[11px] text-amber-800">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" />
                        <span>Câu hỏi liên kết ({linkedQ.id}):</span>
                      </span>
                      {onStartDrill && (
                        <button
                          type="button"
                          onClick={() => onStartDrill([linkedQ.id], `Ôn lại: ${note.title}`)}
                          className="flex items-center gap-1 text-blue-700 hover:underline font-bold"
                        >
                          <span>Luyện lại câu này</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="line-clamp-2 italic text-slate-700 font-medium">
                      "{linkedQ.question}"
                    </p>
                  </div>
                )}

                {/* Note Footer: Tags & Timestamp */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1 flex-wrap">
                    {(note.tags || []).map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-1 font-mono shrink-0">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{formattedDate}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Modal: Create / Edit Note */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingNote ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú kiến thức mới'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Ghi lại công thức, mẹo thi hoặc quy tắc ngữ pháp cần nhớ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleModalSave} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Tiêu đề ghi chú *
                </label>
                <input
                  type="text"
                  required
                  value={modalTitle}
                  onChange={e => setModalTitle(e.target.value)}
                  placeholder="VD: Phân biệt During vs While vs Within..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Phần thi liên quan (Part)
                  </label>
                  <select
                    value={modalPart ?? ''}
                    onChange={e => setModalPart(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  >
                    <option value="">Ghi chú chung (Toàn bài)</option>
                    {[1, 2, 3, 4, 5, 6, 7].map(p => (
                      <option key={p} value={p}>Part {p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Thẻ tag nhanh
                  </label>
                  <input
                    type="text"
                    value={modalTagInput}
                    onChange={e => setModalTagInput(e.target.value)}
                    onKeyDown={handleAddModalTag}
                    placeholder="Gõ tag + bấm Enter"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Tags Container */}
              <div className="flex flex-wrap items-center gap-1.5">
                {modalTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => setModalTags(modalTags.filter(t => t !== tag))}
                      className="text-blue-400 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Nội dung chi tiết *
                </label>
                <textarea
                  rows={5}
                  required
                  value={modalContent}
                  onChange={e => setModalContent(e.target.value)}
                  placeholder="• During + Noun (trong suốt khoảng thời gian)&#10;• While + Clause (trong khi đang làm gì)&#10;• Within + Thời lượng (trong vòng bao lâu)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs resize-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!modalContent.trim()}
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-blue-500/20"
                >
                  {editingNote ? 'Lưu thay đổi' : 'Tạo ghi chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
