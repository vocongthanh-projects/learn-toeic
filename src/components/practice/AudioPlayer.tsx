import React from 'react';
import { Headphones } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  label?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, label = 'Nghe đoạn audio' }) => {
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider shrink-0">
        <Headphones className="w-4 h-4" />
        <span>{label}</span>
      </div>
      {/* key={src} forces the browser to load the new clip when navigating between questions */}
      <audio key={src} controls preload="none" src={src} className="w-full h-9">
        Trình duyệt của bạn không hỗ trợ phát audio.
      </audio>
    </div>
  );
};
