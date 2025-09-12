"use client";
import { useAudio } from "../context/AudioContext";
import { useFavorites } from "../context/FavoritesContext";
import { useEffect, useState } from "react";
import QueueDrawer from "./QueueDrawer";
import NowPlayingSheet from "./NowPlayingSheet";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  List,
  Repeat,
  Repeat1,
  Shuffle,
  Heart,
  X,
  Loader2,
} from "lucide-react";

export default function Playbar() {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    togglePlay,
    progress,
    duration,
    seek,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    queue,
    currentIndex,
    playFromQueue,
    removeFromQueue,
    clearQueue,
    playbackMode,
    setPlaybackMode,
    shuffleQueue,
    error,
    setError,
  } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [showQueue, setShowQueue] = useState(false);
  const [showNowPlaying, setShowNowPlaying] = useState(false);

  // Auto-dismiss error toast after 4s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error, setError]);

  if (!currentTrack) return null;

  const currentIsFavorite = isFavorite(currentTrack.videoId);

  const formatTime = (t: number) => {
    if (isNaN(t) || t === 0) return "0:00";
    const hours = Math.floor(t / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = Math.floor(t % 60).toString().padStart(2, "0");
    if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds}`;
    return `${minutes}:${seconds}`;
  };

  const getPlaybackIcon = () => {
    switch (playbackMode) {
      case 'repeat': return <Repeat className="w-5 h-5" />;
      case 'repeat-one': return <Repeat1 className="w-5 h-5" />;
      case 'shuffle': return <Shuffle className="w-5 h-5" />;
      default: return <Repeat className="w-5 h-5 opacity-50" />; 
    }
  };

  const cyclePlaybackMode = () => {
    const modes: ('normal' | 'repeat' | 'repeat-one' | 'shuffle')[] = ['normal', 'repeat', 'repeat-one', 'shuffle'];
    const currentModeIndex = modes.indexOf(playbackMode);
    const nextMode = modes[(currentModeIndex + 1) % modes.length];
    setPlaybackMode(nextMode);
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      {error && (
        <div className="fixed top-6 right-4 z-50">
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl shadow-xl backdrop-blur-md min-w-[260px] text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium">{error}</span>
              <button onClick={() => setError(null)} className="text-red-300 hover:text-red-200 transition-colors" aria-label="Dismiss" title="Dismiss">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full bg-black/90 text-cyan-300 shadow-2xl z-50 border-t border-gray-800">
        <div className="w-full bg-gray-800 h-1">
          <div className="h-full bg-cyan-500 transition-all duration-100" style={{ width: `${progressPercentage}%` }} />
        </div>

        <div className="px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentTrack.thumbnail} alt={currentTrack.title} className="w-14 h-14 rounded-lg object-cover" />
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1" onClick={() => setShowNowPlaying(true)}>
              <p className="font-semibold text-sm truncate" title={currentTrack.title}>{currentTrack.title}</p>
              <p className="text-xs text-gray-400 truncate" title={currentTrack.artists}>{currentTrack.artists}</p>
            </div>
            <button aria-label={currentIsFavorite ? "Remove from favorites" : "Add to favorites"} title={currentIsFavorite ? "Remove from favorites" : "Add to favorites"} onClick={() => toggleFavorite(currentTrack)} className={`transition-colors ${currentIsFavorite ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-red-400"}`}>
              <Heart className={`w-5 h-5 ${currentIsFavorite ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="flex flex-col items-center w-full md:w-1/3 max-w-md">
            <div className="flex gap-4 items-center mb-2">
              <button aria-label={`Playback mode: ${playbackMode}`} title={`Playback mode: ${playbackMode}`} onClick={cyclePlaybackMode} className={`transition-colors ${playbackMode !== 'normal' ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>{getPlaybackIcon()}</button>
              <button onClick={playPrevious} className="text-gray-300 hover:text-cyan-400 transition-colors" disabled={currentIndex === 0 && queue.length <= 1}>
                <SkipBack className="w-6 h-6" />
              </button>
              <button aria-label={isPlaying ? "Pause" : "Play"} title={isPlaying ? "Pause" : "Play"} onClick={togglePlay} className="bg-cyan-500 text-black px-3 py-3 rounded-full hover:bg-cyan-400 transition-all transform hover:scale-105 shadow-lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
              </button>
              <button aria-label="Next" title="Next" onClick={playNext} className="text-gray-300 hover:text-cyan-400 transition-colors">
                <SkipForward className="w-6 h-6" />
              </button>
              <button onClick={shuffleQueue} className="text-gray-500 hover:text-gray-300 transition-colors" title="Shuffle queue">
                <Shuffle className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 w-full">
              <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(progress)}</span>
              <div className="flex-1">
                <input type="range" min={0} max={duration || 0} value={progress} onChange={(e) => seek(parseFloat(e.target.value))} className="slider w-full" style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${progressPercentage}%, #374151 ${progressPercentage}%, #374151 100%)`
                }} />
              </div>
              <span className="text-xs text-gray-400 min-w-[35px]">{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-1/3 justify-end">
            <div className="flex items-center gap-2">
              <button aria-label={isMuted ? "Unmute" : "Mute"} title={isMuted ? "Unmute" : "Mute"} onClick={toggleMute} className="text-gray-300 hover:text-cyan-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input type="range" min={0} max={1} step={0.01} value={isMuted ? 0 : volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="w-24 slider" style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
              }} />
            </div>

            <span className="text-xs text-gray-400 hidden md:block">{queue.length} in queue</span>

            <button onClick={() => setShowQueue(!showQueue)} className={`transition-colors ${showQueue ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}>
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <QueueDrawer isOpen={showQueue} onClose={() => setShowQueue(false)} queue={queue} currentIndex={currentIndex} isPlaying={isPlaying} playFromQueue={playFromQueue} removeFromQueue={removeFromQueue} clearQueue={clearQueue} shuffleQueue={shuffleQueue} />

      <NowPlayingSheet isOpen={showNowPlaying} onClose={() => setShowNowPlaying(false)} track={currentTrack} isPlaying={isPlaying} progress={progress} duration={duration} onTogglePlay={togglePlay} onSeek={seek} onNext={playNext} onPrev={playPrevious} />
    </>
  );
}
