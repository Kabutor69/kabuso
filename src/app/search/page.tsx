"use client";
import { useState, useEffect, useRef } from "react";
import { useAudio, type Track } from "../../context/AudioContext";
import { useFavorites } from "../../context/FavoritesContext";
import Navbar from "../../components/Navbar";
import Playbar from "../../components/Playbar";
import { 
  Search as SearchIcon, 
  Play, 
  Plus, 
  Loader2, 
  Music,
  AlertCircle,
  X,
  Clock,
  Heart
} from "lucide-react";

const TrackSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-800 rounded-xl aspect-square mb-3"></div>
    <div className="bg-gray-800 h-4 rounded mb-2"></div>
    <div className="bg-gray-800 h-3 rounded w-3/4"></div>
  </div>
);

const SearchResultCard = ({ 
  track, 
  onPlay, 
  onAddToQueue, 
  isCurrentTrack, 
  isPlaying,
  isFavorite,
  onToggleFavorite
}: { 
  track: Track; 
  onPlay: () => void; 
  onAddToQueue: () => void;
  isCurrentTrack: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => (
  <div className="group relative bg-gray-900 bg-opacity-50 rounded-xl p-4 hover:bg-opacity-70 transition-all duration-200 border border-gray-800 hover:border-gray-700">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img 
          src={track.thumbnail} 
          alt={track.title} 
          className="w-16 h-16 rounded-lg object-cover" 
        />
        {isCurrentTrack && (
          <div className="absolute inset-0 bg-cyan-500 bg-opacity-20 rounded-lg flex items-center justify-center">
            <div className={`w-3 h-3 bg-cyan-500 rounded-full ${isPlaying ? 'animate-pulse' : ''}`} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-cyan-400 truncate mb-1" title={track.title}>
          {track.title}
        </h3>
        <p className="text-gray-400 text-sm truncate" title={track.artists}>
          {track.artists}
        </p>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onToggleFavorite}
          className={`p-2 rounded-lg transition-colors ${
            isFavorite 
              ? 'text-red-400 hover:text-red-300 bg-red-500/10' 
              : 'text-gray-400 hover:text-red-400 bg-gray-700 hover:bg-gray-600'
          }`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        <button
          onClick={onAddToQueue}
          className="bg-gray-700 hover:bg-gray-600 p-2 rounded-lg transition-colors"
          title="Add to queue"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={onPlay}
          className="bg-cyan-500 hover:bg-cyan-400 text-black p-2 rounded-lg transition-colors"
          title="Play now"
        >
          <Play className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </div>
  </div>
);

export default function SearchPage() {
  const { playTrack, addToQueue, currentTrack, isPlaying } = useAudio();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = localStorage.getItem('kabuso_search_history');
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    }
  }, []);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  const saveToSearchHistory = (query: string) => {
    if (!query.trim()) return;
    
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('kabuso_search_history', JSON.stringify(newHistory));
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);
    setHasSearched(true);
    saveToSearchHistory(query.trim());

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setTracks(data);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryClick = (historyQuery: string) => {
    setQuery(historyQuery);
    // Trigger search automatically
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kabuso_search_history');
    }
  };

  const playAllResults = () => {
    if (tracks.length === 0) return;
    
    // Add all tracks to queue and play first one
    tracks.forEach((track, index) => {
      if (index === 0) {
        playTrack(track, true, true);
      } else {
        addToQueue(track);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-cyan-400 pb-32">
      <Navbar />
      
      {/* Hero Section */}
      <div className="px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-cyan-500 p-2 rounded-xl">
              <SearchIcon className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              Search Music
            </h1>
          </div>
          <p className="text-gray-400 text-sm mb-8">Find any song from YouTube Music's vast library</p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="relative mb-8">
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for songs, artists, albums..."
                className="w-full bg-gray-800 text-cyan-400 pl-12 pr-24 py-4 rounded-xl outline-none border border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500 focus:ring-opacity-20 transition-all"
                disabled={isSearching}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <button 
                type="submit" 
                disabled={!query.trim() || isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-black px-6 py-2 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>

          {/* Search History */}
          {searchHistory.length > 0 && !hasSearched && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent Searches
                </h3>
                <button 
                  onClick={clearSearchHistory}
                  className="text-gray-500 hover:text-gray-400 text-xs transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((historyQuery, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyQuery)}
                    className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded-full text-sm transition-colors border border-gray-700 hover:border-gray-600"
                  >
                    {historyQuery}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="px-6">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          {hasSearched && !isSearching && tracks.length > 0 && (
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400 text-sm">
                Found {tracks.length} results for "{query}"
              </p>
              <button 
                onClick={playAllResults}
                className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4 ml-0.5" />
                Play All
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-8 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-400 mb-2">Search failed</h3>
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <button 
                  onClick={handleSearch}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-800 bg-opacity-50 rounded-xl p-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-700 w-16 h-16 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="bg-gray-700 h-4 rounded mb-2"></div>
                      <div className="bg-gray-700 h-3 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isSearching && !error && tracks.length > 0 && (
            <div className="space-y-3">
              {tracks.map((track) => (
                <SearchResultCard
                  key={track.videoId}
                  track={track}
                  onPlay={() => playTrack(track, true, true)}
                  onAddToQueue={() => addToQueue(track)}
                  isCurrentTrack={currentTrack?.videoId === track.videoId}
                  isPlaying={isPlaying}
                  isFavorite={isFavorite(track.videoId)}
                  onToggleFavorite={() => toggleFavorite(track)}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {hasSearched && !isSearching && !error && tracks.length === 0 && (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">No results found</h3>
              <p className="text-gray-500 text-sm">
                Try different keywords or check your spelling
              </p>
            </div>
          )}

          {/* Default State */}
          {!hasSearched && !isSearching && (
            <div className="text-center py-16">
              <div className="bg-gray-800 bg-opacity-50 rounded-2xl p-12 max-w-md mx-auto">
                <SearchIcon className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-300 mb-4">Search for Music</h3>
                <p className="text-gray-500 mb-6">
                  Discover millions of songs from YouTube Music
                </p>
                <div className="text-left space-y-2 text-sm text-gray-500">
                  <p>• Search by song title</p>
                  <p>• Find artists and albums</p>
                  <p>• Discover new music</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Playbar />
    </div>
  );
}
