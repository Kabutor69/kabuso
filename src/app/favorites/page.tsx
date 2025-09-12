"use client";
import { useFavorites } from "../../context/FavoritesContext";
import { useAudio } from "../../context/AudioContext";
import Navbar from "../../components/Navbar";
import Playbar from "../../components/Playbar";
import { Heart, Play } from "lucide-react";
import TrackCard from "../../components/TrackCard";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites } = useFavorites();
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();

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
      <div className="min-h-screen bg-black text-cyan-300 pb-28">
        <Navbar />
        
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-12 max-w-md mx-auto">
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
    <div className="min-h-screen bg-black text-cyan-300 pb-28">
      <Navbar />
      
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-6 border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md p-2">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">My Favorites</h1>
            <p className="text-gray-400 text-xs sm:text-sm">{favorites.length} songs</p>
          </div>
        </div>
      </div>

      {/* Play All Button */}
      <div className="px-4 sm:px-6 pt-6 pb-4">
        <div className="max-w-7xl mx-auto">
          <button 
            onClick={playAllFavorites}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            <Play className="w-5 h-5 ml-1" />
            Play All Favorites
          </button>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="px-4 sm:px-6 pb-6">
        <div className="max-w-7xl mx-auto pb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

      <Playbar />
    </div>
  );
}
