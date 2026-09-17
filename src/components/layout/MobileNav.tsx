import type { ViewMode } from '../../types';
import { Target, Download, Upload, RotateCcw } from 'lucide-react';
import { useRef } from 'react';
import { getNavItems } from './navItems';

interface MobileNavProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  mistakeCount: number;
  vocabCount: number;
  notesCount?: number;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onViewChange,
  mistakeCount,
  vocabCount,
  notesCount = 0,
  onResetData,
  onExportData,
  onImportData
}) => {
  const importInputRef = useRef<HTMLInputElement>(null);
  const navItems = getNavItems({ mistakeCount, vocabCount, notesCount });

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImportData(file);
    e.target.value = '';
  };

  return (
    <header className="md:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="flex items-center justify-between px-4 h-14">
        <button
          onClick={() => onViewChange('dashboard')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-xs text-white">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-900 whitespace-nowrap">TOEIC Adaptive</span>
        </button>

        <div className="flex items-center gap-1.5">
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
            className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => importInputRef.current?.click()}
            title="Nhập dữ liệu từ file sao lưu"
            aria-label="Nhập dữ liệu"
            className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onResetData}
            title="Xóa toàn bộ dữ liệu"
            aria-label="Xóa toàn bộ dữ liệu"
            className="p-2 text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable tab strip */}
      <div className="relative border-t border-slate-200">
        <div className="flex items-center py-2 px-2 text-xs overflow-x-auto gap-1 scrollbar-none">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg shrink-0 ${
                currentView === item.id ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              {item.icon}
              <span className="text-[11px] whitespace-nowrap">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[9px] px-1 py-0.5 rounded-full border font-bold leading-none ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Fade hint that the tab strip scrolls further right */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />
      </div>
    </header>
  );
};
