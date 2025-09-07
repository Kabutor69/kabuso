"use client";
import { useEffect, useState } from "react";
import { useAudio } from "../context/AudioContext";
import { useFavorites } from "../context/FavoritesContext";
import Navbar from "../components/Navbar";
import Playbar from "../components/Playbar";
import { Search, TrendingUp, Music, Clock, Play, Heart, MoreHorizontal } from "lucide-react";

type Song = {
  videoId: string;
  title: string;
  artists: string;
  thumbnail: string;
  duration?: number;
  views?: number;
  uploadedAt?: string;
};

export default function HomePage() {
  const { playTrack, addToQueue, currentTrack } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/trending");
        const data = await res.json();
        setSongs(data);
      } catch (err) {
        console.error("Trending fetch failed", err);
        setError("Failed to load trending songs");
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const formatDuration = (raw?: number) => {
    if (!raw || raw < 1) return "0:00";
    // Some sources may provide milliseconds – normalize to seconds if too large
    const seconds = Math.floor(raw > 10000 ? raw / 1000 : raw);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (!views) return "";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading trending music...</p>
          </div>
        </div>
        <Playbar />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="text-red-400 text-6xl mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
        <Playbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pb-28">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-4">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-transparent"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              Kabuso
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Discover and stream your favorite music for free
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Trending Now</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4" />
                <span>Free Streaming</span>
              </div>
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h2 className="text-3xl font-bold">Trending Now</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {songs.map((song, index) => (
              <div
                key={song.videoId}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 border border-gray-700/50"
              >
                <div className="relative mb-4">
                  <img 
                    src={song.thumbnail} 
                    alt={song.title} 
                    className="w-full aspect-square rounded-xl object-cover shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => playTrack(song)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold">
                    #{index + 1}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors" title={song.title}>
                    {song.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-1" title={song.artists}>
                    {song.artists}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-4">
                      {song.duration && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-700/40 text-gray-300 font-mono">
                          <Clock className="w-3 h-3" />
                          {formatDuration(song.duration)}
                        </span>
                      )}
                      {song.views && (
                        <span>{formatViews(song.views)}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => playTrack(song)}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </button>
                    <button
                      onClick={() => addToQueue(song)}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Add to queue"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFavorite(song)}
                      className={`p-2 transition-colors ${
                        isFavorite(song.videoId) 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                      title={isFavorite(song.videoId) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Heart className={`w-4 h-4 ${isFavorite(song.videoId) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {songs.length === 0 && (
            <div className="text-center py-16">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No trending songs found</h3>
              <p className="text-gray-500">Try refreshing the page or check back later</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-16 mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-2xl p-6 text-center">
              <Search className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Search Music</h3>
              <p className="text-gray-400 text-sm">Find any song, artist, or album instantly</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-2xl p-6 text-center">
              <Music className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">High Quality</h3>
              <p className="text-gray-400 text-sm">Stream in the best audio quality available</p>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-2xl p-6 text-center">
              <Heart className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Free Forever</h3>
              <p className="text-gray-400 text-sm">No subscriptions, no ads, completely free</p>
            </div>
          </div>
        </div>
      </div>
      
      <Playbar />
    </div>
  );
}