"use client";
import { useAudio } from "../context/AudioContext";
import { useState } from "react";
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

  const [showQueue, setShowQueue] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (t: number) => {
    if (isNaN(t) || t === 0) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
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
      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center gap-2">
            <span className="text-sm">{error}</span>
            <button 
              onClick={() => setError(null)} 
              className="hover:bg-red-600 rounded p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Playbar */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-r from-gray-900 to-black text-cyan-400 shadow-2xl z-50 border-t border-gray-800">
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 h-1">
          <div 
            className="h-full bg-cyan-500 transition-all duration-100"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
            <div className="relative">
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                className="w-14 h-14 rounded-lg shadow-lg"
              />
              {isLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm truncate" title={currentTrack.title}>
                {currentTrack.title}
              </p>
              <p className="text-xs text-gray-400 truncate" title={currentTrack.artists}>
                {currentTrack.artists}
              </p>
            </div>
            <button className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Main Controls */}
          <div className="flex flex-col items-center w-full md:w-1/3 max-w-md">
            <div className="flex gap-4 items-center mb-3">
              <button 
                onClick={cyclePlaybackMode}
                className={`transition-colors ${
                  playbackMode !== 'normal' ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                }`}
                title={`Playback mode: ${playbackMode}`}
              >
                {getPlaybackIcon()}
              </button>
              
              <button 
                onClick={playPrevious}
                className="text-gray-300 hover:text-cyan-400 transition-colors"
                disabled={currentIndex === 0 && queue.length <= 1}
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button
                onClick={togglePlay}
                className="bg-cyan-500 text-black px-3 py-3 rounded-full hover:bg-cyan-400 transition-all transform hover:scale-105 shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              
              <button 
                onClick={playNext}
                className="text-gray-300 hover:text-cyan-400 transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              
              <button 
                onClick={shuffleQueue}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Shuffle queue"
              >
                <Shuffle className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Slider */}
            <div className="flex items-center gap-3 w-full">
              <span className="text-xs text-gray-400 min-w-[35px]">
                {formatTime(progress)}
              </span>
              <div className="flex-1 relative group">
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={progress}
                  onChange={(e) => seek(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${progressPercentage}%, #374151 ${progressPercentage}%, #374151 100%)`
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 min-w-[35px]">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Volume & Queue Controls */}
          <div className="flex items-center gap-3 w-full md:w-1/3 justify-end">
            {/* Volume Control */}
            <div 
              className="relative flex items-center gap-2"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button onClick={toggleMute} className="text-gray-300 hover:text-cyan-400 transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              {showVolumeSlider && (
                <div 
                  className="absolute bottom-full mb-2 bg-gray-800 rounded-lg p-2 shadow-lg"
                  onMouseEnter={() => setShowVolumeSlider(true)}
                  onMouseLeave={() => setShowVolumeSlider(false)}
                >
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                    }}
                  />
                </div>
              )}
            </div>

            <span className="text-xs text-gray-400 hidden md:block">
              {queue.length} in queue
            </span>

            <button 
              onClick={() => setShowQueue(!showQueue)}
              className={`transition-colors ${showQueue ? 'text-cyan-400' : 'text-gray-300 hover:text-cyan-400'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Queue Sidebar */}
      {showQueue && (
        <div className="fixed bottom-28 right-4 w-80 max-w-[calc(100vw-2rem)] max-h-96 bg-gray-900 text-cyan-400 rounded-xl shadow-2xl z-50 border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-bold">Queue ({queue.length})</h3>
            <div className="flex gap-2">
              <button 
                onClick={shuffleQueue}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                title="Shuffle queue"
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button 
                onClick={clearQueue}
                className="text-gray-400 hover:text-red-400 transition-colors"
                title="Clear queue"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-64">
            {queue.map((track, index) => (
              <div
                key={`${track.videoId}-${index}`}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-800 transition-colors border-l-2 ${
                  index === currentIndex 
                    ? "bg-gray-800 border-cyan-500" 
                    : "border-transparent"
                }`}
                onClick={() => playFromQueue(index)}
              >
                <div className="relative">
                  <img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="w-12 h-12 rounded-lg" 
                  />
                  {index === currentIndex && (
                    <div className="absolute inset-0 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
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
                
                <div className="flex items-center gap-1">
                  {index === currentIndex && (
                    <div className="text-cyan-500">
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(track.videoId);
                    }}
                    className="text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {queue.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <List className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Your queue is empty</p>
                <p className="text-xs mt-1">Add songs to start listening</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Queue Overlay */}
      {showQueue && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setShowQueue(false)}
        />
      )}
    </>
  );
}
