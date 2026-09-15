import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedSampleDataIfEmpty, DEFAULT_PROFILES } from './db';
import type { ViewMode, UserProfile } from './types';

import { SAMPLE_QUESTIONS } from './data/questions';
import { Header } from './components/layout/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { KnowledgeView } from './components/knowledge/KnowledgeView';
import { PracticeView } from './components/practice/PracticeView';
import { MistakeBankView } from './components/mistakes/MistakeBankView';
import { VocabularyView } from './components/vocabulary/VocabularyView';
import { MockTestView } from './components/exam/MockTestView';
import { NotesView } from './components/notes/NotesView';

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
    if (window.confirm('Bạn có chắc muốn làm mới dữ liệu? Hồ sơ học viên sẽ được đặt về trạng thái chuẩn ban đầu.')) {
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
        onResetData={handleResetData}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>🎯 TOEIC Adaptive Studio — Local-First Personal Mastery Engine</span>
          <span className="text-[11px] text-slate-500">
            Hồ sơ hiện tại: <strong className="text-slate-800">{activeProfile.name}</strong> • 100% Offline & Local-First
          </span>
        </div>
      </footer>
    </div>
  );
}


export default App;
