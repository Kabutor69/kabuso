"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAudio, type Track } from "../../context/AudioContext";
import { useFavorites } from "../../context/FavoritesContext";
import Navbar from "../../components/Navbar";
import Playbar from "../../components/Playbar";
import { 
  Search as SearchIcon, 
  Play, 
  Music,
  AlertCircle,
  X,
  Clock
} from "lucide-react";
import TrackCard from "../../components/TrackCard";

// Skeleton kept for potential future use

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
  const searchParams = useSearchParams();

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

  // If ?q= is present, auto-run search
  useEffect(() => {
    const initialQ = (searchParams?.get('q') || '').trim();
    if (initialQ) {
      setQuery(initialQ);
      setTimeout(() => {
        const form = document.querySelector('form');
        form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }, 0);
    }
  }, [searchParams]);

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
      if (data?.error) throw new Error(data.error);
      const list = Array.isArray(data) ? data : Array.isArray(data?.tracks) ? data.tracks : [];
      setTracks(list);
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
    <div className="min-h-screen bg-black text-cyan-300 pb-32">
      <Navbar />
      
      {/* Header */}
      <div className="px-4 sm:px-6 pt-6 pb-6 border-b border-gray-800/60">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-md p-2">
            <SearchIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text">Search</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Find your favorite music</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="px-4 sm:px-6 pt-6 pb-8">
        <div className="max-w-7xl mx-auto">

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
                type={isSearching ? "button" : "submit"}
                onClick={isSearching ? () => {
                  setIsSearching(false);
                  setError(null);
                } : undefined}
                disabled={!query.trim() && !isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-cyan-500 text-black px-6 py-2 rounded-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isSearching ? 'Cancel' : 'Search'}
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
      <div className="px-4 sm:px-6">
        <div className="max-w-7xl mx-auto py-6">
          {/* Results Header */}
          {hasSearched && !isSearching && tracks.length > 0 && (
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-gray-400 text-sm">
                  Found {tracks.length} results for &quot;{query}&quot;
                </p>
              </div>
              <button 
                onClick={playAllResults}
                className="flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 rounded-lg hover:bg-cyan-400 transition-colors font-medium shadow-lg hover:shadow-cyan-500/20"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-4 border border-gray-800/50 bg-gray-900/40 backdrop-blur-sm animate-pulse">
                  <div className="w-full aspect-square rounded-xl mb-4 bg-gray-800/60" />
                  <div className="h-5 w-3/4 mb-2 bg-gray-800/60 rounded" />
                  <div className="h-4 w-1/2 bg-gray-800/60 rounded" />
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isSearching && !error && tracks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.isArray(tracks) && tracks.map((track) => (
                <TrackCard
                  key={track.videoId}
                  track={track}
                  isActive={currentTrack?.videoId === track.videoId}
                  isPlaying={isPlaying}
                  onPlay={() => playTrack(track, true, true)}
                  onAddToQueue={() => addToQueue(track)}
                  isFavorite={isFavorite(track.videoId)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  showMeta
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
            <div className="text-center py-16 text-gray-500">
              Start searching for songs
            </div>
          )}

          <div className="h-24" />
        </div>
      </div>

      <Playbar />
    </div>
  );
}
