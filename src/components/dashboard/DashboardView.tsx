import { useState } from 'react';
import type { Attempt, SrsItem, VocabularyItem, UserNote, MockExamAttempt, UserProfile, ViewMode } from '../../types';
import { generateNextStudyPlan, getLatestAttemptsMap } from '../../engine/recommendations';
import { 
  Sparkles, 
  AlertOctagon, 
  Dice5, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Flame, 
  BookOpen,
  CalendarClock,
  ChevronDown,
  ChevronUp,
  Target,
  Trophy,
  Layers,
  FileText
} from 'lucide-react';

interface DashboardViewProps {
  userName: string;
  userProfile?: UserProfile;
  attempts: Attempt[];
  srsItems: SrsItem[];
  vocabulary?: VocabularyItem[];
  notes?: UserNote[];
  mockExamAttempts?: MockExamAttempt[];
  onStartDrill: (questionIds: string[], title: string) => void;
  onNavigateToView: (view: ViewMode) => void;
}

function computeActivityStreak(timestamps: number[]): { streak: number; last7Days: { dateStr: string; dayLabel: string; active: boolean }[] } {
  const activeDaysSet = new Set<string>();
  for (const t of timestamps) {
    if (t > 0) {
      const d = new Date(t);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      activeDaysSet.add(dateStr);
    }
  }

  const now = new Date();
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const last7Days: { dateStr: string; dayLabel: string; active: boolean }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayLabel = i === 0 ? 'Hôm nay' : dayNames[d.getDay()];
    last7Days.push({
      dateStr,
      dayLabel,
      active: activeDaysSet.has(dateStr)
    });
  }

  // Calculate consecutive days backwards from today
  let streak = 0;
  const curr = new Date(now);
  const todayStr = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
  
  // If no action yet today, check yesterday to preserve ongoing streak
  if (!activeDaysSet.has(todayStr)) {
    curr.setDate(curr.getDate() - 1);
  }

  while (true) {
    const str = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, '0')}-${String(curr.getDate()).padStart(2, '0')}`;
    if (activeDaysSet.has(str)) {
      streak++;
      curr.setDate(curr.getDate() - 1);
    } else {
      break;
    }
  }

  return { streak, last7Days };
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  userProfile,
  attempts,
  srsItems,
  vocabulary = [],
  notes = [],
  mockExamAttempts = [],
  onStartDrill,
  onNavigateToView
}) => {
  const [showAllRecs, setShowAllRecs] = useState(false);

  // Generate intelligent recommendations with deduplicated attempts and vocab SRS
  const recommendations = generateNextStudyPlan(attempts, srsItems, vocabulary);

  // Deduplicated latest status map (prevents fixed misconceptions from remaining red)
  const latestAttemptsMap = getLatestAttemptsMap(attempts);
  const latestAttempts = Array.from(latestAttemptsMap.values());

  const masteredCount = latestAttempts.filter(a => a.cognitiveStatus === 'mastered').length;
  const luckyGuessCount = latestAttempts.filter(a => a.cognitiveStatus === 'lucky_guess').length;
  const misconceptionCount = latestAttempts.filter(a => a.cognitiveStatus === 'misconception').length;
  const knowledgeGapCount = latestAttempts.filter(a => a.cognitiveStatus === 'knowledge_gap').length;

  const totalQuestionsPracticed = latestAttempts.length;
  const totalAttemptsCount = attempts.length;
  const currentAccuracy = totalQuestionsPracticed > 0 
    ? Math.round((latestAttempts.filter(a => a.isCorrect).length / totalQuestionsPracticed) * 100) 
    : 0;

  // Streak calculation from all user actions
  const allActivityTimestamps = [
    ...attempts.map(a => a.timestamp),
    ...notes.map(n => n.updatedAt),
    ...vocabulary.map(v => v.createdAt),
    ...mockExamAttempts.map(m => m.completedAt)
  ];
  const { streak: streakDays, last7Days } = computeActivityStreak(allActivityTimestamps);

  // Target score & Mock Exam performance (Reading scale: 5 - 495)
  const targetMatch = /(\d{3})/.exec(userProfile?.role || '');
  const parsedTarget = targetMatch ? parseInt(targetMatch[1], 10) : 450;
  const targetScore = parsedTarget > 495 ? Math.round(parsedTarget / 2) : parsedTarget;
  const latestMock = mockExamAttempts.length > 0 ? mockExamAttempts[0] : null;
  const highestMock = mockExamAttempts.length > 0
    ? mockExamAttempts.reduce((max, cur) => (cur.readingScore || cur.totalScore) > (max.readingScore || max.totalScore) ? cur : max, mockExamAttempts[0])
    : null;

  const currentMockScore = latestMock ? (latestMock.readingScore || latestMock.totalScore) : 0;
  const scoreProgressPercent = latestMock
    ? Math.min(100, Math.round((currentMockScore / targetScore) * 100))
    : 0;

  const cardThemes: Record<string, { badge: string; border: string; btn: string }> = {
    red: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      border: 'border-rose-200 hover:border-rose-300 hover:shadow-rose-100/50',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white'
    },
    amber: {
      badge: 'bg-amber-50 text-amber-800 border-amber-200',
      border: 'border-amber-200 hover:border-amber-300 hover:shadow-amber-100/50',
      btn: 'bg-amber-600 hover:bg-amber-700 text-white'
    },
    purple: {
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      border: 'border-purple-200 hover:border-purple-300 hover:shadow-purple-100/50',
      btn: 'bg-purple-600 hover:bg-purple-700 text-white'
    },
    emerald: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      border: 'border-emerald-200 hover:border-emerald-300 hover:shadow-emerald-100/50',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    blue: {
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      border: 'border-blue-200 hover:border-blue-300 hover:shadow-blue-100/50',
      btn: 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  };

  const displayedRecs = showAllRecs ? recommendations : recommendations.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner (Study4 Soft Gradient with Real Streak & Activity tracker) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-100 shadow-xs">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
              Vòng lặp học tập cá nhân
            </span>
            <span className="flex items-center gap-1.5 text-xs text-amber-800 font-bold bg-amber-100/70 px-2.5 py-0.5 rounded-full border border-amber-200">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Chuỗi học: <strong>{streakDays} ngày liên tiếp</strong></span>
            </span>
            {userProfile?.role && (
              <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                {userProfile.role}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Chào {userName}, hôm nay bạn nên học gì?
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Hệ thống tự động phát hiện hiểu lầm, câu đoán mò, lịch ngắt quãng SRS và kết quả thi thử để cá nhân hóa lộ trình tối ưu nhất.
          </p>

          {/* Mini 7-day Activity Strip */}
          <div className="pt-2 flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hoạt động 7 ngày:</span>
            <div className="flex items-center gap-1.5">
              {last7Days.map((d) => (
                <div 
                  key={d.dateStr} 
                  title={`${d.dateStr}: ${d.active ? 'Đã học tập' : 'Chưa có hoạt động'}`}
                  className="flex flex-col items-center gap-0.5"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold transition-all ${
                    d.active 
                      ? 'bg-amber-500 text-white shadow-xs shadow-amber-300' 
                      : 'bg-slate-200/70 text-slate-500'
                  }`}>
                    {d.active ? '✓' : '•'}
                  </div>
                  <span className="text-[9px] font-medium text-slate-500">{d.dayLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap sm:flex-nowrap gap-2.5 shrink-0">
          <button
            onClick={() => onNavigateToView('mock_test')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Trophy className="w-4 h-4" />
            <span>Thi Thử (ETS Mode)</span>
          </button>
          <button
            onClick={() => onNavigateToView('practice')}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Luyện tập tự do</span>
          </button>
        </div>
      </div>

      {/* GOAL VS. MOCK EXAM PROGRESSION WIDGET */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Tiến Trình Mục Tiêu & Thi Thử Thực Tế
              </h2>
              <p className="text-xs text-slate-500">
                Đối chiếu điểm ETS Scaled Score (10 - 990) thực chiến với mục tiêu TOEIC đã đặt ra.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToView('mock_test')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-colors self-start sm:self-auto"
          >
            <span>Làm bài thi thử mới</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {latestMock ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Target Score Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase">Mục tiêu Reading</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-slate-900">{targetScore}</span>
                <span className="text-xs font-bold text-slate-500">/ 495</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block font-medium">
                {userProfile?.role || 'Học viên TOEIC Reading'}
              </span>
            </div>

            {/* Latest Mock Score Card */}
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <span className="text-[11px] font-semibold text-indigo-800 block uppercase">Lần thi gần nhất</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-indigo-700">{latestMock.readingScore || latestMock.totalScore}</span>
                <span className="text-xs font-bold text-indigo-500">/ 495</span>
              </div>
              <div className="text-[10px] text-indigo-600 mt-1 flex gap-2 font-medium">
                <span>📖 Reading Scaled Score</span>
              </div>
            </div>

            {/* Best Mock Score Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[11px] font-semibold text-emerald-800 block uppercase">Điểm cao nhất</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black font-mono text-emerald-700">{highestMock?.readingScore || highestMock?.totalScore || latestMock.readingScore || latestMock.totalScore}</span>
                <span className="text-xs font-bold text-emerald-500">/ 495</span>
              </div>
              <span className="text-[10px] text-emerald-700 mt-1 block font-medium">
                Đã hoàn thành {mockExamAttempts.length} đề thi thử Reading
              </span>
            </div>

            {/* Progress to Target Bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">Khoảng cách mục tiêu:</span>
                <span className="text-indigo-600 font-mono">{scoreProgressPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${scoreProgressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block leading-tight">
                {(latestMock.readingScore || latestMock.totalScore) >= targetScore 
                  ? '🎉 Bạn đã vượt điểm mục tiêu Reading! Hãy làm thêm đề để giữ phong độ.' 
                  : `Cần thêm ${targetScore - (latestMock.readingScore || latestMock.totalScore)} điểm để đạt mốc ${targetScore}.`}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-indigo-900">
                Chưa có dữ liệu thi thử ETS Reading Scaled Score
              </h4>
              <p className="text-xs text-indigo-700">
                Hãy làm một bài Full Reading Test (100 câu) hoặc Mini Test (25 phút) để hệ thống đo đạc chính xác trình độ Reading và tính % đạt mục tiêu {targetScore}+.
              </p>
            </div>
            <button
              onClick={() => onNavigateToView('mock_test')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              Làm bài test đầu tiên
            </button>
          </div>
        )}
      </div>

      {/* CORE HERO: HÔM NAY NÊN HỌC GÌ? (Top đề xuất hành động) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
              ĐỀ XUẤT HỌC HÔM NAY (Next Study Plan)
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              {recommendations.length} đề xuất ưu tiên
            </span>
            {recommendations.length > 3 && (
              <button
                onClick={() => setShowAllRecs(!showAllRecs)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                <span>{showAllRecs ? 'Thu gọn' : `Xem tất cả (${recommendations.length})`}</span>
                {showAllRecs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedRecs.map((rec) => {
            const theme = cardThemes[rec.badgeColor] || cardThemes.blue;

            return (
              <div
                key={rec.id}
                className={`flex flex-col justify-between p-5 rounded-3xl bg-white border ${theme.border} shadow-xs transition-all hover:-translate-y-1 duration-200`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${theme.badge}`}>
                      Priority #{rec.priority} • {rec.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {rec.questionIds.length > 0 ? `${rec.questionIds.length} câu` : 'Flashcards'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {rec.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {rec.subtitle}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (rec.targetView) {
                        onNavigateToView(rec.targetView);
                      } else {
                        onStartDrill(rec.questionIds, rec.title);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl ${theme.btn} text-xs font-bold transition-all shadow-xs group`}
                  >
                    <span>{rec.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* COGNITIVE DIAGNOSTIC MATRIX (CONFIDENCE × ACCURACY) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ma trận Chẩn đoán Nhận thức (Confidence × Accuracy)
            </h2>
            <p className="text-xs text-slate-500">
              Đo lường trên trạng thái làm bài mới nhất của từng câu hỏi để phản ánh năng lực hiện tại.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span>Độ chính xác hiện tại: <strong className="text-blue-600 font-mono">{currentAccuracy}%</strong></span>
            <span>Đã làm: <strong className="text-slate-900 font-mono">{totalQuestionsPracticed}</strong> câu ({totalAttemptsCount} lượt)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quadrant 1: Mastered */}
          <div className="p-5 rounded-3xl bg-white border border-emerald-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Nắm vững (Mastered)</span>
              </span>
              <span className="text-2xl font-extrabold text-emerald-600 font-mono">
                {masteredCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tự tin và làm đúng trên lần thử gần nhất. Đã hình thành phản xạ ngữ pháp tự nhiên.
            </p>
            <div className="text-[10px] text-emerald-600 font-semibold">
              ✓ Giãn cách thời gian ôn ngắt quãng
            </div>
          </div>

          {/* Quadrant 2: Lucky Guesses */}
          <div 
            onClick={() => {
              const luckyIds = latestAttempts.filter(a => a.cognitiveStatus === 'lucky_guess').map(a => a.questionId);
              if (luckyIds.length > 0) onStartDrill(luckyIds, 'Kiểm chứng câu đoán mò');
            }}
            className="p-5 rounded-3xl bg-white border border-amber-200 shadow-xs space-y-3 cursor-pointer hover:border-amber-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Dice5 className="w-4 h-4 text-amber-500" />
                <span>Đoán đúng (Lucky Guess)</span>
              </span>
              <span className="text-2xl font-extrabold text-amber-600 font-mono">
                {luckyGuessCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Đúng do chọn 50/50 hoặc đoán bừa. Cần kiểm chứng lại để biến may mắn thành phản xạ.
            </p>
            <div className="text-[10px] text-amber-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Bấm để kiểm chứng ngay</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Quadrant 3: Misconceptions */}
          <div 
            onClick={() => {
              const misIds = latestAttempts.filter(a => a.cognitiveStatus === 'misconception').map(a => a.questionId);
              if (misIds.length > 0) onStartDrill(misIds, 'Sửa bẫy hiểu lầm');
            }}
            className="p-5 rounded-3xl bg-white border border-rose-200 shadow-xs space-y-3 cursor-pointer hover:border-rose-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-500" />
                <span>Hiểu lầm (Misconception)</span>
              </span>
              <span className="text-2xl font-extrabold text-rose-600 font-mono">
                {misconceptionCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tự tin 100% nhưng lại chọn sai! Bẫy tư duy nguy hiểm nhất làm tụt điểm thi thật.
            </p>
            <div className="text-[10px] text-rose-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Bấm để trị bẫy hiểu lầm</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Quadrant 4: Knowledge Gaps */}
          <div 
            onClick={() => {
              const gapIds = latestAttempts.filter(a => a.cognitiveStatus === 'knowledge_gap').map(a => a.questionId);
              if (gapIds.length > 0) onStartDrill(gapIds, 'Lấp lỗ hổng kiến thức');
            }}
            className="p-5 rounded-3xl bg-white border border-sky-200 shadow-xs space-y-3 cursor-pointer hover:border-sky-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-500" />
                <span>Hổng kiến thức (Gap)</span>
              </span>
              <span className="text-2xl font-extrabold text-sky-600 font-mono">
                {knowledgeGapCount}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Chưa vững cấu trúc hoặc thiếu từ vựng. Cần đọc lại lý thuyết và làm bài chuyên đề.
            </p>
            <div className="text-[10px] text-sky-600 font-bold group-hover:underline flex items-center gap-1">
              <span>Bấm để củng cố nền</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* QUICK SHORTCUTS TO LEARNING MODULES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateToView('knowledge')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Chuyên Đề Ngữ Pháp
            </h4>
            <p className="text-xs text-slate-500">
              Quy tắc $\rightarrow$ Ví dụ $\rightarrow$ Bẫy $\rightarrow$ Mẹo 3 giây
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-blue-600">
            <span>Tra cứu lý thuyết</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateToView('mistake_bank')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-rose-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
              Sổ Tay Câu Sai
            </h4>
            <p className="text-xs text-slate-500">
              Lọc theo Part 1-7, Bẫy âm thanh, Bẫy distractor & Retry có lưu lịch sử
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-rose-600">
            <span>Mở sổ câu sai</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateToView('vocabulary')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              Sổ Từ Vựng FSRS
            </h4>
            <p className="text-xs text-slate-500">
              {vocabulary.length} từ vựng đã lưu. Flashcard ôn tập theo đường cong quên lãng
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-emerald-600">
            <span>Ôn tập từ vựng</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => onNavigateToView('notes')}
          className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-indigo-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Ghi Chú Cá Nhân
            </h4>
            <p className="text-xs text-slate-500">
              {notes.length} bài ghi chú mẹo làm bài, từ vựng và lưu ý từng câu hỏi
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-indigo-600">
            <span>Xem danh sách note</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};
