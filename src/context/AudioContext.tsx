"use client";
import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from "react";

export type Track = {
  videoId: string;
  title: string;
  artists: string;
  thumbnail: string;
  duration?: number;
  views?: number;
  uploadedAt?: string;
};

export type PlaybackMode = 'normal' | 'repeat' | 'repeat-one' | 'shuffle';

type AudioState = {
  currentTrack: Track | null;
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Track[];
  history: Track[];
  playbackMode: PlaybackMode;
  error: string | null;
};

type AudioContextType = AudioState & {
  playTrack: (track: Track, addToQueue?: boolean, playNow?: boolean) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (videoId: string) => void;
  clearQueue: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  playFromQueue: (index: number) => void;
  setPlaybackMode: (mode: PlaybackMode) => void;
  shuffleQueue: () => void;
  setError: (error: string | null) => void;
  loadRelatedSongs: (videoId: string, queryHint?: { title?: string; artists?: string }) => Promise<void>;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [state, setState] = useState<AudioState>({
    currentTrack: null,
    currentIndex: -1,
    isPlaying: false,
    isLoading: false,
    progress: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    queue: [],
    history: [],
    playbackMode: 'normal',
    error: null,
  });

  // Initialize volume from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('kabuso_volume');
      const savedMode = localStorage.getItem('kabuso_playback_mode') as PlaybackMode;
      
      setState(prev => ({
        ...prev,
        volume: savedVolume ? parseFloat(savedVolume) : 0.7,
        playbackMode: savedMode || 'normal'
      }));
    }
  }, []);

  // Persist volume and playback mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kabuso_volume', state.volume.toString());
      localStorage.setItem('kabuso_playback_mode', state.playbackMode);
    }
  }, [state.volume, state.playbackMode]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const playTrack = useCallback((track: Track, addToQueue = true, playNow = true) => {
    setState(prev => {
      const newQueue = [...prev.queue];
      let newIndex = prev.currentIndex;

      if (addToQueue) {
        const existingIndex = newQueue.findIndex(t => t.videoId === track.videoId);
        if (existingIndex === -1) {
          newQueue.push(track);
          newIndex = playNow ? newQueue.length - 1 : prev.currentIndex;
        } else {
          newIndex = playNow ? existingIndex : prev.currentIndex;
        }
      }

      return {
        ...prev,
        currentTrack: playNow ? track : prev.currentTrack,
        currentIndex: newIndex,
        queue: newQueue,
        error: null,
        isLoading: playNow,
      };
    });
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setState(prev => {
      const exists = prev.queue.find(t => t.videoId === track.videoId);
      if (exists) return prev;
      return {
        ...prev,
        queue: [...prev.queue, track],
      };
    });
  }, []);

  const removeFromQueue = useCallback((videoId: string) => {
    setState(prev => {
      const newQueue = prev.queue.filter(t => t.videoId !== videoId);
      let newIndex = prev.currentIndex;
      let newCurrentTrack = prev.currentTrack;
      
      if (prev.currentTrack?.videoId === videoId) {
        newCurrentTrack = null;
        newIndex = -1;
      } else if (prev.currentIndex > newQueue.length - 1) {
        newIndex = Math.max(0, newQueue.length - 1);
      }

      return {
        ...prev,
        queue: newQueue,
        currentIndex: newIndex,
        currentTrack: newCurrentTrack,
      };
    });
  }, []);

  const clearQueue = useCallback(() => {
    setState(prev => ({
      ...prev,
      queue: [],
      currentIndex: -1,
      currentTrack: null,
    }));
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;
    
    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {
        setState(prev => ({ ...prev, error: 'Playback failed' }));
      });
    }
  }, [state.isPlaying, state.currentTrack]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setState(prev => ({ ...prev, progress: time }));
    }
  }, []);

  const setVolume = useCallback((v: number) => {
    setState(prev => ({ ...prev, volume: v, isMuted: false }));
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const toggleMute = useCallback(() => {
    setState(prev => {
      const newMuted = !prev.isMuted;
      if (audioRef.current) {
        audioRef.current.volume = newMuted ? 0 : prev.volume;
      }
      return { ...prev, isMuted: newMuted };
    });
  }, []);

  // Load related songs based on current track metadata
  const loadRelatedSongs = useCallback(async (videoId: string, queryHint?: { title?: string; artists?: string }) => {
    try {
      const q = [queryHint?.title, queryHint?.artists].filter(Boolean).join(' ');
      const url = q ? `/api/related/${videoId}?q=${encodeURIComponent(q)}` : `/api/related/${videoId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const relatedSongs = Array.isArray(data) ? data : Array.isArray(data?.tracks) ? data.tracks : [];

      if (relatedSongs.length > 0) {
        setState(prev => {
          const existingIds = new Set<string>([
            ...prev.queue.map(t => t.videoId),
            ...prev.history.map(t => t.videoId),
            prev.currentTrack?.videoId || '',
          ].filter(Boolean) as string[]);
          const newSongs = relatedSongs.filter((song: Track) => !existingIds.has(song.videoId));
          return {
            ...prev,
            queue: [...prev.queue, ...newSongs],
          };
        });
      }
    } catch (err) {
      console.error('Failed to load related songs', err);
    }
  }, []);

  const getNextTrack = useCallback((): Track | null => {
    const { queue, currentIndex, playbackMode } = state;
    
    if (playbackMode === 'repeat-one' && state.currentTrack) {
      return state.currentTrack;
    }
    
    if (playbackMode === 'shuffle') {
      const availableTracks = queue.filter((_, i) => i !== currentIndex);
      if (availableTracks.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      return availableTracks[randomIndex];
    }
    
    if (currentIndex < queue.length - 1 && queue[currentIndex + 1]) {
      return queue[currentIndex + 1];
    } else if (playbackMode === 'repeat' && queue[0]) {
      return queue[0];
    }
    
    return null;
  }, [state]);

  const playNext = useCallback(async () => {
    const nextTrack = getNextTrack();
    
    if (nextTrack) {
      const newIndex = state.queue.findIndex(t => t.videoId === nextTrack.videoId);
      setState(prev => ({
        ...prev,
        currentTrack: nextTrack,
        currentIndex: newIndex,
        isLoading: true,
        error: null,
      }));
    } else {
      const finished = state.currentTrack;
      if (finished) {
        await loadRelatedSongs(finished.videoId, { title: finished.title, artists: finished.artists });
        // After loading, try to play the next item if it was appended
        setTimeout(() => {
          const { queue, currentIndex } = state;
          const next = queue[currentIndex + 1];
          if (next) {
            setState(prev => ({
              ...prev,
              currentTrack: next,
              currentIndex: currentIndex + 1,
              isLoading: true,
              error: null,
            }));
          } else {
            setState(prev => ({ ...prev, error: 'No more songs in queue', isLoading: false }));
          }
        }, 200);
      } else {
        setState(prev => ({ ...prev, error: 'No more songs in queue', isLoading: false }));
      }
    }
  }, [state, getNextTrack, loadRelatedSongs]);

  const playPrevious = useCallback(() => {
    if (state.currentIndex > 0 && state.queue[state.currentIndex - 1]) {
      const prevTrack = state.queue[state.currentIndex - 1];
      setState(prev => ({
        ...prev,
        currentTrack: prevTrack,
        currentIndex: prev.currentIndex - 1,
        isLoading: true,
        error: null,
      }));
    } else if (state.history.length > 0) {
      const lastTrack = state.history[state.history.length - 1];
      if (lastTrack) {
        playTrack(lastTrack, false, true);
      }
    }
  }, [state, playTrack]);

  const playFromQueue = useCallback((index: number) => {
    if (index >= 0 && index < state.queue.length && state.queue[index]) {
      const track = state.queue[index];
      setState(prev => ({
        ...prev,
        currentTrack: track,
        currentIndex: index,
        isLoading: true,
        error: null,
      }));
    }
  }, [state.queue]);

  const setPlaybackMode = useCallback((mode: PlaybackMode) => {
    setState(prev => ({ ...prev, playbackMode: mode }));
  }, []);

  const shuffleQueue = useCallback(() => {
    setState(prev => {
      const shuffled = [...prev.queue];
      const currentTrack = prev.currentTrack;
      
      const filteredQueue = shuffled.filter(t => t.videoId !== currentTrack?.videoId);
      
      for (let i = filteredQueue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = filteredQueue[i];
        filteredQueue[i] = filteredQueue[j];
        filteredQueue[j] = temp;
      }
      
      const newQueue = currentTrack ? [currentTrack, ...filteredQueue] : filteredQueue;
      
      return {
        ...prev,
        queue: newQueue,
        currentIndex: currentTrack ? 0 : -1,
      };
    });
  }, []);

  // Handle audio source changes - SIMPLIFIED
  useEffect(() => {
    if (!audioRef.current || !state.currentTrack) return;

    const audio = audioRef.current;
    audio.src = `/api/stream/${state.currentTrack.videoId}`;
    audio.crossOrigin = 'anonymous';
    audio.volume = state.isMuted ? 0 : state.volume;
    
    // Simple event handlers
    audio.oncanplay = () => {
      audio.play().then(() => {
        setState(prev => ({ 
          ...prev, 
          isPlaying: true, 
          isLoading: false,
          history: prev.currentTrack && !prev.history.find(t => t.videoId === prev.currentTrack!.videoId) 
            ? [...prev.history.slice(-9), prev.currentTrack] 
            : prev.history
        }));
      }).catch((error) => {
        console.error('Play failed:', error);
        setState(prev => ({ 
          ...prev, 
          isPlaying: false, 
          isLoading: false, 
          error: 'Failed to play track' 
        }));
      });
    };
    
    audio.onerror = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false, 
        error: 'Failed to load track' 
      }));
    };

    // Load related songs after delay
    setTimeout(() => {
      if (state.queue.length <= 2 && state.currentTrack) {
        loadRelatedSongs(state.currentTrack.videoId, { title: state.currentTrack.title, artists: state.currentTrack.artists });
      }
    }, 1500);

  }, [state.currentTrack, loadRelatedSongs, state.queue.length, state.isMuted, state.volume]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setState(prev => ({ ...prev, progress: audio.currentTime }));
    };
    
    const setDuration = () => {
      setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    };
    
    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
    };
    
    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };
    
    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
      playNext();
    };
    
    const handleError = () => {
      setState(prev => ({ 
        ...prev, 
        isPlaying: false, 
        isLoading: false, 
        error: 'Audio playback error' 
      }));
    };

    audio.addEventListener("timeupdate", updateProgress);
    audio.addEventListener("loadedmetadata", setDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("loadedmetadata", setDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [playNext]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || target?.isContentEditable) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
        return;
      }

      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) seek(Math.min((audioRef.current.currentTime || 0) + 5, state.duration));
        return;
      }
      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) seek(Math.max((audioRef.current.currentTime || 0) - 5, 0));
        return;
      }

      if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(1, state.volume + 0.05));
        return;
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(0, state.volume - 0.05));
        return;
      }

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        playNext();
        return;
      }
      if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        playPrevious();
        return;
      }

      if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [state.volume, state.duration, togglePlay, playNext, playPrevious, toggleMute, seek, setVolume]);

  return (
    <AudioContext.Provider
      value={{
        ...state,
        playTrack,
        addToQueue,
        removeFromQueue,
        clearQueue,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
        playFromQueue,
        setPlaybackMode,
        shuffleQueue,
        setError,
        loadRelatedSongs,
      }}
    >
      {children}
      <audio ref={audioRef} hidden />
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error("useAudio must be used inside AudioProvider");
  return ctx;
};