import React, { useState } from 'react';
import { FileText, MessageSquare, Newspaper, Mail, Bell, Type } from 'lucide-react';
import type { Passage } from '../../types';
import { AudioPlayer } from './AudioPlayer';

interface PassageViewerProps {
  passage: Passage;
  part: number;
}

export const PassageViewer: React.FC<PassageViewerProps> = ({ passage, part }) => {
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  const getPassageIcon = () => {
    switch (passage.type) {
      case 'conversation':
      case 'talk':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'incomplete_text':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      default:
        if (passage.title?.toLowerCase().includes('email') || passage.title?.toLowerCase().includes('e-mail')) {
          return <Mail className="w-4 h-4 text-amber-600" />;
        }
        if (passage.title?.toLowerCase().includes('notice') || passage.title?.toLowerCase().includes('announcement')) {
          return <Bell className="w-4 h-4 text-emerald-600" />;
        }
        return <Newspaper className="w-4 h-4 text-blue-600" />;
    }
  };

  const getBadgeLabel = () => {
    switch (passage.type) {
      case 'conversation': return 'Conversation Script';
      case 'talk': return 'Talk Script';
      case 'incomplete_text': return 'Part 6 Document';
      case 'double_passage': return 'Double Passage';
      case 'triple_passage': return 'Triple Passage';
      default: return 'Part 7 Reading Document';
    }
  };

  const textContent = passage.content || passage.transcript || '';

  return (
    <div className="space-y-3">
      {passage.audioUrl && (
        <AudioPlayer
          src={passage.audioUrl}
          label={part === 3 ? 'Nghe đoạn hội thoại' : 'Nghe bài nói/thông báo'}
        />
      )}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Passage Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
            {getPassageIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {getBadgeLabel()}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-mono">
                Part {part}
              </span>
            </div>
            {passage.title && (
              <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                {passage.title}
              </h4>
            )}
          </div>
        </div>

        {/* Font size switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <Type className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <button
            type="button"
            onClick={() => setFontSize('sm')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              fontSize === 'sm' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            A-
          </button>
          <button
            type="button"
            onClick={() => setFontSize('base')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              fontSize === 'base' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize('lg')}
            className={`px-1.5 py-0.5 rounded text-[11px] font-semibold transition-colors ${
              fontSize === 'lg' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Scrollable Passage Body (Kéo lên kéo xuống) */}
      <div className="p-5 sm:p-6 max-h-[380px] sm:max-h-[460px] overflow-y-auto space-y-3 leading-relaxed text-slate-800 font-sans select-text">
        {textContent.split('\n\n').map((paragraph, pIdx) => {
          const trimmed = paragraph.trim();
          if (!trimmed) return null;

          // Check if paragraph looks like email headers
          const isEmailHeader = trimmed.startsWith('To:') || trimmed.startsWith('From:') || trimmed.startsWith('Date:') || trimmed.startsWith('Subject:');

          if (isEmailHeader) {
            return (
              <div key={pIdx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs space-y-1 text-slate-700">
                {trimmed.split('\n').map((line, lIdx) => (
                  <div key={lIdx} className="flex">
                    <span className="font-bold text-slate-900 w-20 shrink-0">{line.split(':')[0]}:</span>
                    <span className="text-slate-600">{line.split(':').slice(1).join(':')}</span>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <p 
              key={pIdx} 
              className={`${
                fontSize === 'sm' ? 'text-xs' :
                fontSize === 'lg' ? 'text-base' :
                'text-sm'
              } text-slate-800 leading-relaxed`}
            >
              {trimmed}
            </p>
          );
        })}
      </div>

      <div className="px-5 py-2 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Cuộn lên / xuống để đọc trọn vẹn văn bản</span>
        <span className="font-mono">{passage.questionIds.length} câu hỏi liên kết</span>
      </div>
      </div>
    </div>
  );
};
