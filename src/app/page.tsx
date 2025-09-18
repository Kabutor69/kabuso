"use client";
import { useState, useEffect } from "react";
import { useAudio, type Track } from "../context/AudioContext";
import { useFavorites } from "../context/FavoritesContext";
import { useSearch } from "../lib/searchService";
import Navbar from "../components/Navbar";
import Playbar from "../components/Playbar";
import TrackCard from "../components/TrackCard";
import { TrendingUp, Music, Play, AlertCircle, Loader2 } from "lucide-react";

export default function HomePage() {
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { searchTrending, isLoading, error } = useSearch();
  
  const [songs, setSongs] = useState<Track[]>([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const results = await searchTrending(20);
        setSongs(results);
      } catch (err) {
        console.error("Trending fetch failed", err);
      }
    };
    fetchTrending();
  }, [searchTrending]);

  const playAllTrending = () => {
    if (songs.length === 0) return;
    
    songs.forEach((track, index) => {
      if (index === 0) {
        playTrack(track, true, true);
      } else {
        addToQueue(track);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400">
        <Navbar />
        <div className="px-6 pt-8 pb-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-cyan-500 p-2 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="h-8 w-40 bg-gray-800/60 rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm animate-pulse">
                  <div className="w-full aspect-square rounded-xl mb-4 bg-gray-800/60" />
                  <div className="h-5 w-3/4 mb-2 bg-gray-800/60 rounded" />
                  <div className="h-4 w-1/2 bg-gray-800/60 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <Playbar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] px-6">
          <div className="text-center max-w-md">
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-red-400">Oops! Something went wrong</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-cyan-500/20"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Playbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-cyan-300 pb-28">
      <Navbar />
      
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-6 border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md p-2">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Trending Music</h1>
              <p className="text-gray-400 text-xs sm:text-sm">
                {songs.length} {songs.length === 1 ? 'song' : 'songs'} • Updated daily
              </p>
            </div>
          </div>
          
          {songs.length > 0 && (
            <button 
              onClick={playAllTrending}
              className="flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors font-medium shadow-lg hover:shadow-cyan-500/20"
            >
              <Play className="w-4 h-4 ml-0.5" />
              Play All
            </button>
          )}
        </div>
      </div>
 
      {/* Content */}
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto py-6">
          {songs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {songs.map((song, index) => (
                <TrackCard
                  key={song.videoId}
                  track={song}
                  isActive={currentTrack?.videoId === song.videoId}
                  isPlaying={currentTrack?.videoId === song.videoId && isPlaying}
                  indexBadge={`#${index + 1}`}
                  onPlay={() => playTrack(song)}
                  onAddToQueue={() => addToQueue(song)}
                  isFavorite={isFavorite(song.videoId)}
                  onToggleFavorite={() => toggleFavorite(song)}
                  showMeta
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No trending songs found</h3>
              <p className="text-gray-500">Try refreshing the page or check back later</p>
            </div>
          )}
 
          <div className="h-24" />
        </div>
      </div>
      
      <Playbar />
    </div>
  );
}