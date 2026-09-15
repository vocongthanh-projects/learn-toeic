import type { ConfidenceLevel } from '../../types';
import { ShieldCheck, ThumbsUp, Dice5, HelpCircle } from 'lucide-react';

interface ConfidenceSelectorProps {
  value: ConfidenceLevel | null;
  onChange: (level: ConfidenceLevel) => void;
  disabled?: boolean;
}

export const ConfidenceSelector: React.FC<ConfidenceSelectorProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  const options: { level: ConfidenceLevel; label: string; sub: string; icon: React.ReactNode; color: string; ringColor: string }[] = [
    {
      level: 'sure',
      label: 'Rất tự tin',
      sub: 'Chắc chắn 100%',
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      color: 'hover:border-emerald-300 hover:bg-emerald-50/50',
      ringColor: 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs font-semibold'
    },
    {
      level: 'likely',
      label: 'Khá chắc',
      sub: 'Khoảng 70-80%',
      icon: <ThumbsUp className="w-4 h-4 text-blue-600" />,
      color: 'hover:border-blue-300 hover:bg-blue-50/50',
      ringColor: 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20 shadow-xs font-semibold'
    },
    {
      level: 'guess',
      label: 'Đoán mò',
      sub: '50/50 loại trừ',
      icon: <Dice5 className="w-4 h-4 text-amber-600" />,
      color: 'hover:border-amber-300 hover:bg-amber-50/50',
      ringColor: 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/20 shadow-xs font-semibold'
    },
    {
      level: 'no_idea',
      label: 'Chưa biết',
      sub: 'Hoàn toàn mới lạ',
      icon: <HelpCircle className="w-4 h-4 text-rose-600" />,
      color: 'hover:border-rose-300 hover:bg-rose-50/50',
      ringColor: 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20 shadow-xs font-semibold'
    }
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <span>Mức độ tự tin của bạn:</span>
          <span className="text-[11px] font-normal text-slate-500">(để hệ thống bắt bẫy hiểu lầm)</span>
        </label>
        {value === null && (
          <span className="text-[11px] text-amber-600 font-semibold animate-pulse">
            * Hãy chọn mức tự tin trước khi nộp
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {options.map(opt => {
          const selected = value === opt.level;
          return (
            <button
              type="button"
              key={opt.level}
              disabled={disabled}
              onClick={() => onChange(opt.level)}
              className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                selected
                  ? opt.ringColor
                  : `border-slate-200 bg-slate-50/60 text-slate-700 ${disabled ? 'opacity-60 cursor-not-allowed' : opt.color}`
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                {opt.icon}
                <span className="text-xs font-bold">{opt.label}</span>
              </div>
              <span className="text-[11px] text-slate-500 leading-tight">{opt.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
