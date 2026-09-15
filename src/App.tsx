import { useState, useEffect, lazy, Suspense } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedSampleDataIfEmpty, DEFAULT_PROFILES, renameUserProfile, exportDatabase, importDatabase, type DatabaseBackup } from './db';
import type { ViewMode, UserProfile } from './types';

import { SAMPLE_QUESTIONS } from './data/questions';
import { Header } from './components/layout/Header';

// Each tab is loaded on demand, so switching views doesn't require downloading
// every other view's code up front.
const DashboardView = lazy(() => import('./components/dashboard/DashboardView').then(m => ({ default: m.DashboardView })));
const KnowledgeView = lazy(() => import('./components/knowledge/KnowledgeView').then(m => ({ default: m.KnowledgeView })));
const PracticeView = lazy(() => import('./components/practice/PracticeView').then(m => ({ default: m.PracticeView })));
const MistakeBankView = lazy(() => import('./components/mistakes/MistakeBankView').then(m => ({ default: m.MistakeBankView })));
const VocabularyView = lazy(() => import('./components/vocabulary/VocabularyView').then(m => ({ default: m.VocabularyView })));
const MockTestView = lazy(() => import('./components/exam/MockTestView').then(m => ({ default: m.MockTestView })));
const NotesView = lazy(() => import('./components/notes/NotesView').then(m => ({ default: m.NotesView })));

function ViewLoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    </div>
  );
}

const LOCAL_STORAGE_USER_KEY = 'toeic_active_user_id';
const LOCAL_STORAGE_VIEW_KEY = 'toeic_active_view';
const LOCAL_STORAGE_DRILL_KEY = 'toeic_active_drill';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>(() => {
    return (localStorage.getItem(LOCAL_STORAGE_VIEW_KEY) as ViewMode) || 'dashboard';
  });
  const [activeDrill, setActiveDrill] = useState<{ questionIds: string[]; title: string } | null>(() => {
    try {
      const v = localStorage.getItem(LOCAL_STORAGE_DRILL_KEY);
      return v ? JSON.parse(v) : null;
    } catch {
      return null;
    }
  });
  
  // Persistent active user ID across reload / F5
  const [activeUserId, setActiveUserId] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_USER_KEY) || 'user_1';
  });

  const handleNavigateView = (view: ViewMode) => {
    if (view !== 'practice') {
      setActiveDrill(null);
      localStorage.removeItem(LOCAL_STORAGE_DRILL_KEY);
    }
    setCurrentView(view);
    localStorage.setItem(LOCAL_STORAGE_VIEW_KEY, view);
  };

  // Seed sample data on mount if empty
  useEffect(() => {
    seedSampleDataIfEmpty();
  }, []);

  // Update localStorage when user switches profile
  const handleSelectProfile = (userId: string) => {
    setActiveUserId(userId);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, userId);
    setActiveDrill(null); // reset active drill when switching user
  };

  // Reactive queries from IndexedDB scoped strictly by activeUserId
  const profiles = useLiveQuery(
    async () => {
      const list = await db.userProfiles.toArray();
      return list.length > 0 ? list : DEFAULT_PROFILES;
    },
    []
  ) || DEFAULT_PROFILES;

  const userAttempts = useLiveQuery(
    () => db.attempts.where('userId').equals(activeUserId).toArray(),
    [activeUserId]
  ) || [];

  const userSrsItems = useLiveQuery(
    () => db.srsItems.where('userId').equals(activeUserId).toArray(),
    [activeUserId]
  ) || [];

  const userVocab = useLiveQuery(
    async () => {
      const items = await db.vocabulary.where('userId').equals(activeUserId).toArray();
      return items.sort((a, b) => b.createdAt - a.createdAt);
    },
    [activeUserId]
  ) || [];

  const userNotes = useLiveQuery(
    async () => {
      const items = await db.notes.where('userId').equals(activeUserId).toArray();
      return items.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    [activeUserId]
  ) || [];

  const userMockAttempts = useLiveQuery(
    async () => {
      const items = await db.mockExamAttempts.where('userId').equals(activeUserId).toArray();
      return items.sort((a, b) => b.completedAt - a.completedAt);
    },
    [activeUserId]
  ) || [];


  // Active user profile object
  const activeProfile: UserProfile = profiles.find(p => p.id === activeUserId) || DEFAULT_PROFILES[0];

  // Derived counts for header badges
  const mistakeCount = userAttempts.filter(a => !a.isCorrect || a.cognitiveStatus === 'lucky_guess').length;
  const vocabCount = userVocab.length;

  // Handle starting a targeted drill from recommendations / mistake bank / knowledge
  const handleStartDrill = (questionIds: string[], title: string) => {
    const drill = { questionIds, title };
    setActiveDrill(drill);
    localStorage.setItem(LOCAL_STORAGE_DRILL_KEY, JSON.stringify(drill));
    handleNavigateView('practice');
  };

  const handleClearDrill = () => {
    setActiveDrill(null);
    localStorage.removeItem(LOCAL_STORAGE_DRILL_KEY);
  };

  // Determine questions to pass to PracticeView
  const practiceQuestions = activeDrill
    ? SAMPLE_QUESTIONS.filter(q => activeDrill.questionIds.includes(q.id))
    : SAMPLE_QUESTIONS;

  // Reset database handler
  const handleResetData = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ dữ liệu học tập (lượt làm bài, SRS, từ vựng, ghi chú, bài thi thử)? Hành động này không thể hoàn tác — hãy Xuất dữ liệu trước nếu muốn giữ lại.')) {
      await db.attempts.clear();
      await db.srsItems.clear();
      await db.vocabulary.clear();
      await db.notes.clear();
      await db.mockExamAttempts.clear();
      await seedSampleDataIfEmpty();
      handleClearDrill();
      handleNavigateView('dashboard');
    }
  };

  // Rename active profile (profiles ship with generic names since this app is public)
  const handleRenameProfile = async (profileId: string, name: string) => {
    await renameUserProfile(profileId, name);
  };

  // Export all local data to a downloadable JSON backup file
  const handleExportData = async () => {
    const backup = await exportDatabase();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toeic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Import a previously exported JSON backup, replacing all current local data
  const handleImportData = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text) as DatabaseBackup;
      if (!window.confirm('Nhập file sao lưu sẽ THAY THẾ toàn bộ dữ liệu hiện tại trên máy này. Tiếp tục?')) {
        return;
      }
      await importDatabase(backup);
      window.alert('Nhập dữ liệu thành công! Trang sẽ tải lại.');
      window.location.reload();
    } catch (err) {
      console.error('Lỗi nhập dữ liệu:', err);
      window.alert('File sao lưu không hợp lệ hoặc bị lỗi, vui lòng kiểm tra lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Header */}

      <Header
        currentView={currentView}
        onViewChange={(view) => {
          handleNavigateView(view);
        }}
        mistakeCount={mistakeCount}
        vocabCount={vocabCount}
        notesCount={userNotes.length}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={handleSelectProfile}
        onRenameProfile={handleRenameProfile}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <Suspense fallback={<ViewLoadingFallback />}>
        {currentView === 'dashboard' && (
          <DashboardView
            userName={activeProfile.name}
            userProfile={activeProfile}
            attempts={userAttempts}
            srsItems={userSrsItems}
            vocabulary={userVocab}
            notes={userNotes}
            mockExamAttempts={userMockAttempts}
            onStartDrill={handleStartDrill}
            onNavigateToView={(view) => {
              handleNavigateView(view);
            }}
          />
        )}

        {currentView === 'knowledge' && (
          <KnowledgeView
            onStartDrill={handleStartDrill}
          />
        )}

        {currentView === 'practice' && (
          <PracticeView
            userId={activeUserId}
            questions={practiceQuestions.length > 0 ? practiceQuestions : SAMPLE_QUESTIONS}
            attempts={userAttempts}
            filterTitle={activeDrill?.title}
            onClearFilter={handleClearDrill}
            onCompleteSession={() => handleNavigateView('dashboard')}
          />
        )}

        {currentView === 'mistake_bank' && (
          <MistakeBankView
            userId={activeUserId}
            userName={activeProfile.name}
            attempts={userAttempts}
            onStartDrill={handleStartDrill}
          />
        )}

        {currentView === 'vocabulary' && (
          <VocabularyView
            userId={activeUserId}
            userName={activeProfile.name}
            vocabulary={userVocab}
          />
        )}

        {currentView === 'mock_test' && (
          <MockTestView
            userId={activeUserId}
            userName={activeProfile.name}
            historyAttempts={userMockAttempts}
            notes={userNotes}
            onNavigateHome={() => handleNavigateView('dashboard')}
          />
        )}

        {currentView === 'notes' && (
          <NotesView
            userId={activeUserId}
            userName={activeProfile.name}
            notes={userNotes}
            onStartDrill={handleStartDrill}
          />
        )}
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🎯 TOEIC Adaptive Studio — Local-First Personal Mastery Engine</span>
          <span className="text-[11px] text-slate-500">
            Hồ sơ hiện tại: <strong className="text-slate-800">{activeProfile.name}</strong> • Dữ liệu lưu cục bộ trong trình duyệt này — nhớ xuất dữ liệu để sao lưu
          </span>
        </div>
      </footer>
    </div>
  );
}


export default App;
