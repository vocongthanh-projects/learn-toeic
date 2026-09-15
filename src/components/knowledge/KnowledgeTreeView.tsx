import { useState } from 'react';
import { TAXONOMY } from '../../data/taxonomy';
import { SAMPLE_QUESTIONS } from '../../data/questions';
import { 
  ChevronRight, 
  Lightbulb, 
  ArrowRight,
  Layers
} from 'lucide-react';


interface KnowledgeTreeViewProps {
  onStartDrill: (questionIds: string[], title: string) => void;
}

export const KnowledgeTreeView: React.FC<KnowledgeTreeViewProps> = ({
  onStartDrill
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('grammar.verb.tense.past_simple');

  const nodes = Object.values(TAXONOMY);
  const rootNodes = nodes.filter(n => n.parent === null);

  const getChildNodes = (parentId: string) => {
    return nodes.filter(n => n.parent === parentId);
  };

  const selectedNode = TAXONOMY[selectedNodeId] || nodes[0];

  // Find linked questions for selected node
  const linkedQuestions = SAMPLE_QUESTIONS.filter(q => 
    q.knowledgeNodeIds.includes(selectedNode.id) ||
    (selectedNode.parent === null && q.knowledgeNodeIds.some(nId => nId.startsWith(selectedNode.id)))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
            Cấu trúc phân cấp
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">
          Knowledge Graph — Cây Kiến Thức TOEIC
        </h1>
        <p className="text-xs text-slate-300">
          Không dùng tag rời rạc: Kiến thức được xâu chuỗi theo từng phân hệ giúp bạn nắm trọn vẹn bức tranh tổng thể.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Tree Navigation */}
        <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 block">
            Danh mục chuyên đề
          </span>

          <div className="space-y-1 text-xs">
            {rootNodes.map(root => {
              const children = getChildNodes(root.id);
              const isRootSelected = selectedNodeId === root.id;

              return (
                <div key={root.id} className="space-y-1">
                  <button
                    onClick={() => setSelectedNodeId(root.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-left transition-all ${
                      isRootSelected
                        ? 'bg-sky-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Layers className="w-4 h-4 shrink-0 text-sky-400" />
                      <span className="truncate">{root.name}</span>
                    </div>
                    <span className="text-[10px] opacity-70">
                      {children.length > 0 ? `${children.length} nhánh` : ''}
                    </span>
                  </button>

                  {/* Child nodes */}
                  {children.length > 0 && (
                    <div className="pl-4 space-y-1 border-l border-slate-800 ml-3">
                      {children.map(child => {
                        const isChildSelected = selectedNodeId === child.id;
                        return (
                          <button
                            key={child.id}
                            onClick={() => setSelectedNodeId(child.id)}
                            className={`w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left transition-all ${
                              isChildSelected
                                ? 'bg-indigo-600/90 text-white font-semibold shadow-sm'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            }`}
                          >
                            <span className="truncate">{child.name}</span>
                            <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Node Detail Card */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl backdrop-blur-xl">
          {selectedNode ? (
            <div className="space-y-6">
              {/* Title & Tag */}
              <div className="space-y-2 border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">
                    {selectedNode.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    {linkedQuestions.length} câu hỏi liên kết
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white">
                  {selectedNode.name}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {/* Rule Summary */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 space-y-1.5">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>Quy tắc cốt lõi:</span>
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {selectedNode.ruleSummary}
                </p>
              </div>

              {/* Signals */}
              {selectedNode.keySignals && selectedNode.keySignals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Dấu hiệu nhận biết nhanh trong đề:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedNode.keySignals.map((sig, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-amber-300 font-mono">
                        {sig}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples */}
              {selectedNode.examples && selectedNode.examples.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Ví dụ minh họa chuẩn TOEIC:
                  </span>
                  <div className="space-y-1.5">
                    {selectedNode.examples.map((ex, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 italic">
                        "{ex}"
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drill Action */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {linkedQuestions.length > 0 
                    ? `Có sẵn ${linkedQuestions.length} câu hỏi thực hành` 
                    : 'Chưa có câu hỏi gán trực tiếp cho node này'}
                </span>

                {linkedQuestions.length > 0 && (
                  <button
                    onClick={() => onStartDrill(linkedQuestions.map(q => q.id), `Chuyên đề: ${selectedNode.name}`)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <span>Luyện chuyên đề này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Chọn một chuyên đề bên trái để xem chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
