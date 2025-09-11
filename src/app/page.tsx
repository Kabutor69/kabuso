"use client";
import { useEffect, useState } from "react";
import { useAudio } from "../context/AudioContext";
import { useFavorites } from "../context/FavoritesContext";
import Navbar from "../components/Navbar";
import Playbar from "../components/Playbar";
import Skeleton from "../components/Skeleton";
import { Search, TrendingUp, Music, Clock, Play, Heart, MoreHorizontal } from "lucide-react";
import TrackCard from "../components/TrackCard";

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
  const { playTrack, addToQueue } = useAudio();
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
        <div className="px-6 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-500 p-2 rounded-xl" />
              <div className="h-8 w-40 bg-gray-800/60 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 border border-gray-800 bg-gray-900/40">
                  <Skeleton className="w-full aspect-square rounded-xl mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
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
      {/* Heading + Grid */}
      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold">Trending</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {songs.map((song, index) => (
              <TrackCard
                key={song.videoId}
                track={song}
                indexBadge={`#${index + 1}`}
                onPlay={() => playTrack(song)}
                onAddToQueue={() => addToQueue(song)}
                isFavorite={isFavorite(song.videoId)}
                onToggleFavorite={() => toggleFavorite(song)}
                showMeta
              />
            ))}
          </div>

          {songs.length === 0 && (
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