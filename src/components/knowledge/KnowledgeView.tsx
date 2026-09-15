import { useState, useMemo } from 'react';
import { TAXONOMY } from '../../data/taxonomy';
import { SAMPLE_QUESTIONS } from '../../data/questions';
import { 
  BookOpen, 
  Lightbulb, 
  AlertTriangle, 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  BookmarkCheck 
} from 'lucide-react';

interface KnowledgeViewProps {
  onStartDrill: (questionIds: string[], title: string) => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({ onStartDrill }) => {
  const nodeIds = Object.keys(TAXONOMY);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodeIds[0]);

  const selectedNode = TAXONOMY[selectedNodeId] || TAXONOMY[nodeIds[0]];

  // Pre-calculate question count per node once to avoid repeated filtering
  const questionCountByNode = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const q of SAMPLE_QUESTIONS) {
      for (const nId of q.knowledgeNodeIds) {
        counts[nId] = (counts[nId] || 0) + 1;
      }
    }
    return counts;
  }, []);

  // Find linked questions for this topic
  const linkedQuestions = useMemo(() => {
    return SAMPLE_QUESTIONS.filter(q => 
      q.knowledgeNodeIds.includes(selectedNode.id)
    );
  }, [selectedNode.id]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-50 via-sky-50/50 to-white border border-blue-100 shadow-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200">
            Hệ thống kiến thức chuẩn hóa
          </span>
          <span className="text-xs text-slate-500">
            Trải nghiệm học tinh gọn tương tự Study4
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Chuyên Đề Ngữ Pháp & Bí Quyết Trị Bẫy TOEIC
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          Học sâu theo cấu trúc: <strong>Quy tắc $\rightarrow$ Ví dụ $\rightarrow$ Lỗi hay mắc $\rightarrow$ Mẹo 3 giây $\rightarrow$ Luyện tập ngay</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Sidebar */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-3.5 space-y-2 h-fit shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 block">
            Danh sách chuyên đề ({nodeIds.length})
          </span>

          <div className="space-y-1.5">
            {nodeIds.map(nodeId => {
              const node = TAXONOMY[nodeId];
              const isSelected = selectedNodeId === nodeId;
              const qCount = questionCountByNode[nodeId] || 0;

              return (
                <button
                  key={nodeId}
                  onClick={() => setSelectedNodeId(nodeId)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <BookmarkCheck className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
                    <span className="text-xs truncate">{node.name}</span>
                  </div>

                  {qCount > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {qCount} câu
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic Theory & Practice Hub */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            {/* Header of selected topic */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  {selectedNode.id}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {selectedNode.name}
                </h2>
                <p className="text-xs text-slate-600">
                  {selectedNode.description}
                </p>
              </div>

              {linkedQuestions.length > 0 && (
                <button
                  onClick={() => onStartDrill(linkedQuestions.map(q => q.id), `Chuyên đề: ${selectedNode.name}`)}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] whitespace-nowrap shrink-0"
                >
                  <span>Luyện tập ngay ({linkedQuestions.length} câu)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Section 1: Rule Summary */}
            <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>1. Quy tắc cốt lõi (Core Rule)</span>
              </div>
              <p className="text-sm text-slate-800 font-mono leading-relaxed bg-white p-3.5 rounded-xl border border-blue-100 shadow-xs">
                {selectedNode.ruleSummary}
              </p>
            </div>

            {/* Section 2: Examples */}
            {selectedNode.examples && selectedNode.examples.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>2. Ví dụ thực tế trong đề thi</span>
                </div>
                <div className="space-y-2">
                  {selectedNode.examples.map((ex, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 italic flex items-start gap-2">
                      <span className="text-indigo-600 font-bold not-italic">✓</span>
                      <span>"{ex}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Common Mistakes */}
            {selectedNode.commonMistakes && selectedNode.commonMistakes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>3. Các bẫy & Lỗi học sinh hay mắc (Common Mistakes)</span>
                </div>
                <div className="space-y-2">
                  {selectedNode.commonMistakes.map((mistake, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 leading-relaxed flex items-start gap-2">
                      <span className="font-bold text-rose-600">✗</span>
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Quick Tips & Tricks */}
            {selectedNode.quickTips && selectedNode.quickTips.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>4. Mẹo nhận diện nhanh 3 giây (TOEIC Shortcuts)</span>
                </div>
                <div className="space-y-2">
                  {selectedNode.quickTips.map((tip, i) => (
                    <div key={i} className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed font-mono whitespace-pre-line">
                      {tip}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Signals tags */}
            {selectedNode.keySignals && selectedNode.keySignals.length > 0 && (
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-500 font-semibold flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                  Từ khóa nhận diện:
                </span>
                {selectedNode.keySignals.map((sig, i) => (
                  <span key={i} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                    {sig}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
