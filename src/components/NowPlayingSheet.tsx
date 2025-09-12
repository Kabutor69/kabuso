"use client";
import { X, SkipBack, SkipForward, Pause, Play } from "lucide-react";
import type { Track } from "../context/AudioContext";

type NowPlayingSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onNext: () => void;
  onPrev: () => void;
};

export default function NowPlayingSheet({
  isOpen,
  onClose,
  track,
  isPlaying,
  progress,
  duration,
  onTogglePlay,
  onSeek,
  onNext,
  onPrev,
}: NowPlayingSheetProps) {
  if (!isOpen || !track) return null;

  const formatTime = (t: number) => {
    if (isNaN(t) || t <= 0) return "0:00";
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = Math.floor(t % 60).toString().padStart(2, "0");
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-gray-800 rounded-t-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-400">Now Playing</div>
          <button aria-label="Close" title="Close" onClick={onClose} className="text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.thumbnail} alt={track.title} className="w-16 h-16 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate">{track.title}</p>
            <p className="text-xs text-gray-400 truncate">{track.artists}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-400">{formatTime(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 slider"
          />
          <span className="text-xs text-gray-400">{formatTime(duration)}</span>
        </div>
        <div className="flex items-center justify-center gap-6">
          <button aria-label="Previous" title="Previous" onClick={onPrev} className="text-gray-300">
            <SkipBack className="w-7 h-7" />
          </button>
          <button aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"} onClick={onTogglePlay} className="bg-cyan-500 text-black p-3 rounded-full">
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>
          <button aria-label="Next" title="Next" onClick={onNext} className="text-gray-300">
            <SkipForward className="w-7 h-7" />
          </button>
        </div>
      </div>
    </div>
  );
}


