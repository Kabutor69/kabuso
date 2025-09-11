"use client";
import { useFavorites } from "../../context/FavoritesContext";
import { useAudio } from "../../context/AudioContext";
import Navbar from "../../components/Navbar";
import Playbar from "../../components/Playbar";
import { Heart, Play, MoreHorizontal, Music, Trash2, Clock } from "lucide-react";
import TrackCard from "../../components/TrackCard";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

  const formatDuration = (raw?: number) => {
    if (!raw || raw < 1) return "0:00";
    const seconds = Math.floor(raw > 10000 ? raw / 1000 : raw);
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAllFavorites = () => {
    if (favorites.length === 0) return;
    
    // Add all favorites to queue and play first one
    favorites.forEach((track, index) => {
      if (index === 0) {
        playTrack(track, true, true);
      } else {
        addToQueue(track);
      }
    });
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400 pb-28">
        <Navbar />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-gray-800/50 rounded-2xl p-12 max-w-md mx-auto">
              <Heart className="w-20 h-20 text-gray-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-300 mb-4">No Favorites Yet</h2>
              <p className="text-gray-500 mb-6">
                Start adding songs to your favorites to see them here
              </p>
              <div className="text-left space-y-2 text-sm text-gray-500">
                <p>• Click the heart icon on any song</p>
                <p>• Your favorites will be saved locally</p>
                <p>• Access them anytime from this page</p>
              </div>
            </div>
          </div>
        </div>
        
        <Playbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400 pb-28">
      <Navbar />
      
      {/* Header */}
      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-cyan-500 p-2 rounded-xl">
              <Heart className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                My Favorites
              </h1>
              <p className="text-gray-400 text-sm">{favorites.length} songs</p>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
          </div>

          {/* Play All Button */}
          <div className="mb-8">
            <button 
              onClick={playAllFavorites}
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Play className="w-5 h-5 ml-1" />
              Play All Favorites
            </button>
          </div>

          {/* Favorites Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((track) => (
              <TrackCard
                key={track.videoId}
                track={track}
                isActive={currentTrack?.videoId === track.videoId}
                isPlaying={isPlaying}
                onPlay={() => playTrack(track)}
                onAddToQueue={() => addToQueue(track)}
                isFavorite={true}
                onToggleFavorite={() => removeFromFavorites(track.videoId)}
                showMeta
              />
            ))}
          </div>
        </div>
      </div>

      <Playbar />
    </div>
  );
}
