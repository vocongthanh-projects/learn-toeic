import { useState } from 'react';
import type { ViewMode, UserProfile } from '../../types';
import { 
  LayoutDashboard, 
  Sparkles, 
  BookX, 
  BookOpen, 
  Bookmark, 
  RotateCcw,
  Target,
  Check,
  ChevronDown,
  Timer,
  FileText
} from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  mistakeCount: number;
  vocabCount: number;
  notesCount?: number;
  activeProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (profileId: string) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  mistakeCount,
  vocabCount,
  notesCount = 0,
  activeProfile,
  profiles,
  onSelectProfile,
  onResetData
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems: { id: ViewMode; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'practice',
      label: 'Practice',
      icon: <Sparkles className="w-4 h-4 text-indigo-600" />
    },
    {
      id: 'mock_test',
      label: 'Thi thử',
      icon: <Timer className="w-4 h-4 text-amber-600" />
    },
    {
      id: 'knowledge',
      label: 'Knowledge',
      icon: <BookOpen className="w-4 h-4 text-blue-600" />
    },
    {
      id: 'mistake_bank',
      label: 'Mistakes',
      icon: <BookX className="w-4 h-4 text-rose-500" />,
      badge: mistakeCount,
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      id: 'vocabulary',
      label: 'Vocabulary',
      icon: <Bookmark className="w-4 h-4 text-emerald-600" />,
      badge: vocabCount,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      id: 'notes',
      label: 'Ghi chú',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
      badge: notesCount,
      badgeColor: 'bg-teal-50 text-teal-600 border-teal-200'
    }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div 
            onClick={() => onViewChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform text-white">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base text-slate-900 whitespace-nowrap">
                  TOEIC Adaptive
                </span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full whitespace-nowrap">
                  Study4 Style
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden xl:block whitespace-nowrap">Học thông minh • Trị bẫy tư duy</p>
            </div>
          </div>

          {/* Clean 7-Tab Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto scrollbar-none shrink-0">
            {navItems.map(item => {
              const active = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 ${
                    active
                      ? 'bg-white text-blue-600 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-bold leading-none shrink-0 ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Profile Switcher & Action Tools */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Multi-user Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all text-left shadow-xs"
              >
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${activeProfile.avatarBg} flex items-center justify-center font-bold text-white text-xs shadow-xs`}>
                  {activeProfile.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[110px]">
                    {activeProfile.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {activeProfile.role}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs space-y-1 animate-in zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Chuyển hồ sơ học viên:
                    </div>
                    {profiles.map(p => {
                      const isCurrent = p.id === activeProfile.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            onSelectProfile(p.id);
                            setShowProfileMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${p.avatarBg} flex items-center justify-center text-white text-[10px] font-bold`}>
                              {p.name.charAt(0)}
                            </div>
                            <div>
                              <div>{p.name}</div>
                              <div className="text-[10px] text-slate-400">{p.role}</div>
                            </div>
                          </div>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-blue-600" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Reset Button */}
            <button
              onClick={onResetData}
              title="Đặt lại dữ liệu mẫu"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-200 text-xs overflow-x-auto gap-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg ${
                currentView === item.id ? 'text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              {item.icon}
              <span className="text-[11px] whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
