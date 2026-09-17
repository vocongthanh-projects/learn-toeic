import type { ViewMode } from '../../types';
import {
  LayoutDashboard,
  Sparkles,
  BookX,
  BookOpen,
  Bookmark,
  Timer,
  FileText,
  PenSquare,
  Mic
} from 'lucide-react';

export interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  badgeColor?: string;
}

export function getNavItems(counts: { mistakeCount: number; vocabCount: number; notesCount: number }): NavItem[] {
  return [
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
      badge: counts.mistakeCount,
      badgeColor: 'bg-rose-50 text-rose-600 border-rose-200'
    },
    {
      id: 'vocabulary',
      label: 'Vocabulary',
      icon: <Bookmark className="w-4 h-4 text-emerald-600" />,
      badge: counts.vocabCount,
      badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      id: 'notes',
      label: 'Ghi chú',
      icon: <FileText className="w-4 h-4 text-teal-600" />,
      badge: counts.notesCount,
      badgeColor: 'bg-teal-50 text-teal-600 border-teal-200'
    },
    {
      id: 'writing',
      label: 'Writing',
      icon: <PenSquare className="w-4 h-4 text-purple-600" />
    },
    {
      id: 'speaking',
      label: 'Speaking',
      icon: <Mic className="w-4 h-4 text-rose-600" />
    }
  ];
}
