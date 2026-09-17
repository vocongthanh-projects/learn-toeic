import { useRef, useState } from 'react';
import type { ViewMode, UserProfile } from '../../types';
import { Target, Check, Pencil, Download, Upload, RotateCcw } from 'lucide-react';
import { getNavItems } from './navItems';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  mistakeCount: number;
  vocabCount: number;
  notesCount?: number;
  activeProfile: UserProfile;
  onRenameProfile: (profileId: string, name: string) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  mistakeCount,
  vocabCount,
  notesCount = 0,
  activeProfile,
  onRenameProfile,
  onResetData,
  onExportData,
  onImportData
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const navItems = getNavItems({ mistakeCount, vocabCount, notesCount });

  const startEditingName = () => {
    setEditingName(activeProfile.name);
    setIsEditingName(true);
  };

  const commitNameEdit = () => {
    if (editingName.trim()) {
      onRenameProfile(activeProfile.id, editingName.trim());
    }
    setIsEditingName(false);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportData(file);
    e.target.value = '';
  };

  return (
    <aside className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-slate-200">
      {/* Brand */}
      <button
        onClick={() => onViewChange('dashboard')}
        className="flex items-center gap-2.5 p-4 border-b border-slate-200 cursor-pointer group text-left"
      >
        <div className="w-9 h-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform text-white">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <span className="font-bold text-sm text-slate-900 whitespace-nowrap block">TOEIC Adaptive</span>
          <p className="text-[10px] text-slate-500 truncate">Học thông minh • Trị bẫy tư duy</p>
        </div>
      </button>

      {/* Tab Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(item => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? 'bg-blue-50 text-blue-600 border border-blue-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full border font-bold leading-none shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Profile + data actions */}
      <div className="p-3 border-t border-slate-200 space-y-2">
        <div className="flex items-center gap-2 px-1">
          <div className={`w-7 h-7 shrink-0 rounded-xl bg-gradient-to-tr ${activeProfile.avatarBg} flex items-center justify-center font-bold text-white text-xs shadow-xs`}>
            {activeProfile.name.charAt(0)}
          </div>
          {isEditingName ? (
            <>
              <input
                autoFocus
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitNameEdit();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                onBlur={commitNameEdit}
                maxLength={40}
                className="flex-1 min-w-0 px-2 py-1 rounded-lg border border-blue-300 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={commitNameEdit}
                className="shrink-0 p-1 rounded-lg text-emerald-600 hover:bg-emerald-100"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-800 truncate">{activeProfile.name}</div>
              </div>
              <button
                onClick={startEditingName}
                title="Đổi tên"
                aria-label="Đổi tên"
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <Pencil className="w-3 h-3" />
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            hidden
            onChange={handleImportFileChange}
          />
          <button
            onClick={onExportData}
            title="Xuất dữ liệu (sao lưu JSON)"
            aria-label="Xuất dữ liệu"
            className="flex items-center justify-center py-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            title="Nhập dữ liệu từ file sao lưu"
            aria-label="Nhập dữ liệu"
            className="flex items-center justify-center py-1.5 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetData}
            title="Xóa toàn bộ dữ liệu"
            aria-label="Xóa toàn bộ dữ liệu"
            className="flex items-center justify-center py-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
