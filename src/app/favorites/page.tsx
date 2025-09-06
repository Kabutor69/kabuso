"use client";
import { useFavorites } from "../../context/FavoritesContext";
import { useAudio } from "../../context/AudioContext";
import Navbar from "../../components/Navbar";
import Playbar from "../../components/Playbar";
import { Heart, Play, MoreHorizontal, Music, Trash2 } from "lucide-react";

export default function FavoritesPage() {
  const { favorites, removeFromFavorites, isFavorite } = useFavorites();
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
              <div
                key={track.videoId}
                className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20 border border-gray-700/50"
              >
                <div className="relative mb-4">
                  <img 
                    src={track.thumbnail} 
                    alt={track.title} 
                    className="w-full aspect-square rounded-xl object-cover shadow-lg"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => playTrack(track)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-black p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </button>
                  </div>
                  {currentTrack?.videoId === track.videoId && (
                    <div className="absolute top-2 left-2 bg-cyan-500 text-black rounded-full px-2 py-1 text-xs font-semibold flex items-center gap-1">
                      {isPlaying ? (
                        <>
                          <div className="w-2 h-2 bg-black rounded-full animate-pulse"></div>
                          Now Playing
                        </>
                      ) : (
                        <>
                          <Music className="w-3 h-3" />
                          Paused
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-bold text-lg line-clamp-2 group-hover:text-cyan-400 transition-colors" title={track.title}>
                    {track.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-1" title={track.artists}>
                    {track.artists}
                  </p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => playTrack(track)}
                      className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Play
                    </button>
                    <button
                      onClick={() => addToQueue(track)}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Add to queue"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeFromFavorites(track.videoId)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Playbar />
    </div>
  );
}
