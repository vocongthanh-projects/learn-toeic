import React, { useState, useEffect } from 'react';
import type { Question, UserNote } from '../../types';
import { saveUserNote, deleteUserNote, updateUserNote } from '../../db';
import { 
  X, 
  Check, 
  Trash2, 
  PenTool, 
  Tag as TagIcon, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

interface QuestionNoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  question: Question;
  existingNote?: UserNote;
  onNoteSaved?: (note: UserNote) => void;
  onNoteDeleted?: (noteId: string) => void;
}

export const QuestionNoteDrawer: React.FC<QuestionNoteDrawerProps> = ({
  isOpen,
  onClose,
  userId,
  question,
  existingNote,
  onNoteSaved,
  onNoteDeleted
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title);
      setContent(existingNote.content);
      setTags(existingNote.tags || [`Part ${question.part}`]);
    } else {
      setTitle(`Ghi chú câu ${question.questionNumber || question.id} (Part ${question.part})`);
      setContent('');
      setTags([`Part ${question.part}`, 'Bẫy thi']);
    }
  }, [existingNote, question, isOpen]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim();
      if (!tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      if (existingNote) {
        await updateUserNote(existingNote.id, {
          title: title.trim() || `Ghi chú câu ${question.id}`,
          content: content.trim(),
          tags,
          part: question.part
        });
        if (onNoteSaved) {
          onNoteSaved({
            ...existingNote,
            title: title.trim() || `Ghi chú câu ${question.id}`,
            content: content.trim(),
            tags,
            part: question.part,
            updatedAt: Date.now()
          });
        }
      } else {
        const newNote = await saveUserNote(userId, content, {
          title: title.trim() || `Ghi chú câu ${question.id}`,
          questionId: question.id,
          part: question.part,
          tags
        });
        if (onNoteSaved) onNoteSaved(newNote);
      }

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Error saving note:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingNote) return;
    if (window.confirm('Bạn có chắc muốn xóa ghi chú này không?')) {
      await deleteUserNote(existingNote.id);
      if (onNoteDeleted) onNoteDeleted(existingNote.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <PenTool className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                {existingNote ? 'Chỉnh sửa ghi chú' : 'Ghi chú cho câu hỏi này'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Lưu lại bẫy tư duy, công thức hoặc lưu ý quan trọng
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Question Snippet */}
        <div className="p-4 bg-blue-50/50 border-b border-blue-100/60 text-xs text-slate-700 space-y-1">
          <div className="flex items-center gap-2 font-bold text-blue-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Câu hỏi tham chiếu (Part {question.part}):</span>
          </div>
          <p className="line-clamp-2 italic text-slate-800 font-medium">
            "{question.question}"
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Tiêu đề ghi chú
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Cấu trúc responsible for V-ing..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs"
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Nội dung chi tiết *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Ghi lại quy tắc ngữ pháp, từ vựng đồng nghĩa, hoặc bẫy lừa của người ra đề..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-800 leading-relaxed focus:outline-none focus:bg-white focus:border-blue-500 transition-all shadow-xs resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center justify-between">
              <span className="flex items-center gap-1">
                <TagIcon className="w-3 h-3" />
                <span>Thẻ gắn (Tags)</span>
              </span>
              <span className="text-slate-400 font-normal lowercase">nhấn Enter để thêm</span>
            </label>
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl min-h-[38px]">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[11px] shadow-2xs"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-400 hover:text-rose-600 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Thêm thẻ (e.g. Từ loại, Bẫy Part 5)..." : "+ tag"}
                className="bg-transparent border-none text-xs text-slate-800 focus:outline-none flex-1 min-w-[80px]"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            {existingNote ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ghi chú</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-semibold transition-colors"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSaving || !content.trim()}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-blue-500/20"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã lưu thành công!</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{existingNote ? 'Cập nhật' : 'Lưu ghi chú'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
