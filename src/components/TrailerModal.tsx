import React from 'react';
import { X } from 'lucide-react';
import ReactPlayer from 'react-player';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ isOpen, onClose, videoUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/60 hover:bg-brand-red rounded-full text-white transition-colors backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>
        <ReactPlayer
          url={videoUrl}
          width="100%"
          height="100%"
          playing={isOpen}
          controls={true}
          style={{ backgroundColor: 'black' }}
        />
      </div>
    </div>
  );
};
