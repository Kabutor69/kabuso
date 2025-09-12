"use client";
import { X, Shuffle, Pause, Play } from "lucide-react";
import type { Track } from "../context/AudioContext";

type QueueDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  queue: Track[];
  currentIndex: number;
  isPlaying: boolean;
  playFromQueue: (index: number) => void;
  removeFromQueue: (videoId: string) => void;
  clearQueue: () => void;
  shuffleQueue: () => void;
};

export default function QueueDrawer({
  isOpen,
  onClose,
  queue,
  currentIndex,
  isPlaying,
  playFromQueue,
  removeFromQueue,
  clearQueue,
  shuffleQueue,
}: QueueDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside className="fixed right-0 bottom-0 top-0 w-[360px] max-w-[90vw] bg-gray-900 text-cyan-400 border-l border-gray-800 z-50 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="font-bold">Queue ({queue.length})</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={shuffleQueue}
              className="text-gray-400 hover:text-cyan-400 transition-colors p-2 rounded-lg hover:bg-gray-800"
              title="Shuffle queue"
              aria-label="Shuffle queue"
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button 
              onClick={clearQueue}
              className="text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm font-medium"
              title="Clear all songs from queue"
              aria-label="Clear all songs from queue"
            >
              Clear All
            </button>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-2 rounded-lg hover:bg-gray-800"
              title="Close queue"
              aria-label="Close queue"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-2 flex-1">
          {queue.map((track, index) => (
            <div
              key={`${track.videoId}-${index}`}
              className={`group flex items-center gap-3 p-3 cursor-pointer rounded-lg hover:bg-gray-800 transition-colors border-l-2 ${
                index === currentIndex ? "bg-gray-800 border-cyan-500" : "border-transparent"
              }`}
              onClick={() => playFromQueue(index)}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={track.thumbnail} 
                  alt={track.title} 
                  className="w-12 h-12 rounded-lg object-cover" 
                />
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <div className="text-cyan-500">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={track.title}>
                  {track.title}
                </p>
                <p className="text-xs text-gray-400 truncate" title={track.artists}>
                  {track.artists}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromQueue(track.videoId);
                }}
                className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remove from queue"
                title="Remove from queue"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          {queue.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p>Your queue is empty</p>
              <p className="text-xs mt-1">Add songs to start listening</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


