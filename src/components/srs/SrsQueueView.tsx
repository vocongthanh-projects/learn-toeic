import type { SrsItem } from '../../types';
import { SAMPLE_QUESTIONS } from '../../data/questions';
import { 
  Repeat, 
  Clock, 
  ArrowRight, 
  Info, 
  Calendar
} from 'lucide-react';


interface SrsQueueViewProps {
  srsItems: SrsItem[];
  onStartDrill: (questionIds: string[], title: string) => void;
}

export const SrsQueueView: React.FC<SrsQueueViewProps> = ({
  srsItems,
  onStartDrill
}) => {
  const now = Date.now();
  const questionMap = new Map(SAMPLE_QUESTIONS.map(q => [q.id, q]));

  const dueItems = srsItems.filter(item => item.nextReview <= now);
  const futureItems = srsItems.filter(item => item.nextReview > now);

  const dueQuestionIds = dueItems.map(item => item.targetId);

  const formatTimeUntil = (targetTimestamp: number) => {
    const diff = targetTimestamp - now;
    if (diff <= 0) return 'Đến hạn ngay bây giờ';
    const hours = Math.round(diff / (1000 * 60 * 60));
    if (hours < 24) return `Trong ${hours} giờ tới`;
    const days = Math.round(hours / 24);
    return `Sau ${days} ngày nữa`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              Lặp lại ngắt quãng (FSRS-Ready)
            </span>
            <span className="text-xs text-slate-400">
              {dueItems.length} câu cần ôn hôm nay
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            Hàng đợi Ôn tập Spaced Repetition
          </h1>
          <p className="text-xs text-slate-300">
            Không học dồn dập: Ôn đúng điểm rơi của đường cong quên lãng (Forgetting Curve) để lưu vào trí nhớ dài hạn.
          </p>
        </div>

        {dueQuestionIds.length > 0 && (
          <button
            onClick={() => onStartDrill(dueQuestionIds, `Ôn tập ${dueQuestionIds.length} câu đến hạn SRS`)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/20 transition-all hover:scale-[1.02] whitespace-nowrap"
          >
            <Repeat className="w-4 h-4" />
            <span>Ôn ngay {dueQuestionIds.length} câu đến hạn</span>
          </button>
        )}
      </div>

      {/* Info Card explaining the FSRS variables */}
      <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-900/30 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-purple-300 font-semibold">Cơ chế tính toán Spaced Repetition:</strong>
          <span className="block mt-0.5 text-slate-400">
            • <strong>Stability (S):</strong> Số ngày thông tin duy trì trong não bộ. Làm đúng và tự tin sẽ tăng S mạnh mẽ.
            <br />
            • <strong>Difficulty (D):</strong> Độ khó cố hữu (thang 1-10). Khi bạn làm sai, D tăng lên và chu kỳ ôn tập sẽ rút ngắn lại.
          </span>
        </div>
      </div>

      {/* Due Items Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>Cần ôn tập ngay hôm nay ({dueItems.length})</span>
        </h2>

        {dueItems.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
            🎉 Tuyệt vời! Bạn không còn câu hỏi nào bị quá hạn ôn tập hôm nay.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueItems.map(item => {
              const q = questionMap.get(item.targetId);
              if (!q) return null;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-purple-950/15 border border-purple-500/30 hover:border-purple-500/50 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-300 font-mono">
                      Part {q.part} • #{q.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold text-[10px]">
                      Đến hạn
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 line-clamp-2 font-medium">
                    {q.question}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-purple-900/40 text-[11px] text-slate-400">
                    <div className="flex gap-3 font-mono">
                      <span>S: <strong className="text-slate-200">{item.stability.toFixed(1)}d</strong></span>
                      <span>D: <strong className="text-slate-200">{item.difficulty.toFixed(1)}</strong></span>
                      <span>Reps: <strong className="text-slate-200">{item.reps}</strong></span>
                    </div>

                    <button
                      onClick={() => onStartDrill([q.id], `Ôn câu ${q.id}`)}
                      className="text-purple-400 hover:text-purple-200 font-semibold flex items-center gap-1"
                    >
                      <span>Ôn câu này</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming SRS Items Section */}
      <div className="space-y-3 pt-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>Lịch ôn các ngày tiếp theo ({futureItems.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {futureItems.map(item => {
            const q = questionMap.get(item.targetId);
            if (!q) return null;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300 font-mono">
                    Part {q.part} • #{q.id}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {formatTimeUntil(item.nextReview)}
                  </span>
                </div>

                <p className="text-slate-300 line-clamp-2">
                  {q.question}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                  <span>Ổn định: {item.stability.toFixed(1)} ngày</span>
                  <span>Đã ôn: {item.reps} lần</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
