import { Play, MoreHorizontal, Heart, Clock, Music, Loader2 } from "lucide-react";
import type { Track } from "../context/AudioContext";

type TrackCardProps = {
  track: Track;
  isActive?: boolean;
  isPlaying?: boolean;
  indexBadge?: string | number;
  onPlay: () => void;
  onAddToQueue?: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  showMeta?: boolean;
  isLoading?: boolean;
};

export default function TrackCard({
  track,
  isActive = false,
  isPlaying = false,
  indexBadge,
  onPlay,
  onAddToQueue,
  isFavorite,
  onToggleFavorite,
  showMeta = true,
  isLoading = false,
}: TrackCardProps) {
  
  const formatDuration = (raw?: number) => {
    if (!raw || raw < 1) return "";
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

  const formatViews = (views?: number) => {
    if (!views) return "";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
      return `${Math.ceil(diffDays / 365)} years ago`;
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="group bg-gray-900/60 border border-gray-800 rounded-xl p-3 animate-pulse">
        <div className="relative mb-3">
          <div className="w-full aspect-square rounded-lg bg-gray-700" />
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-4 bg-gray-700 rounded mb-2" />
          <div className="h-3 bg-gray-700 rounded w-2/3 mb-2" />
          {showMeta && (
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="h-3 bg-gray-700 rounded w-1/3" />
              <div className="h-3 bg-gray-700 rounded w-1/4" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="group bg-gray-900/60 border border-gray-800 rounded-xl p-3 hover:bg-gray-900 transition-colors h-full flex flex-col"
      role="article"
      aria-label={`${track.title} by ${track.artists}`}
    >
      <div className="relative mb-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full aspect-square rounded-lg object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-music.jpg';
          }}
        />
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-black/30">
          <button
            onClick={onPlay}
            className="bg-cyan-500 hover:bg-cyan-400 text-black p-2 rounded-full transition-colors"
            aria-label="Play"
            title="Play"
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        </div>
        {typeof indexBadge !== "undefined" && (
          <div className="absolute top-2 right-2 bg-black/70 rounded-md px-1.5 py-0.5 text-[10px] font-semibold">
            {indexBadge}
          </div>
        )}
        {isActive && (
          <div className="absolute top-2 left-2 bg-cyan-500 text-black rounded-md px-1.5 py-0.5 text-[10px] font-semibold flex items-center gap-1">
            {isPlaying ? (
              <>
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse"></div>
                Playing
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

      <div className="flex-1 flex flex-col">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2 leading-tight">
          {track.title}
        </h3>
        <p className="text-gray-400 text-xs mb-2 line-clamp-1">
          {track.artists}
        </p>
        
        {showMeta && (
          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(track.duration)}</span>
            </div>
            {track.views && (
              <span>{formatViews(track.views)}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <button
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-full transition-colors ${
              isFavorite
                ? 'text-red-500 hover:text-red-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          {onAddToQueue && (
            <button
              onClick={onAddToQueue}
              className="p-1.5 text-gray-400 hover:text-gray-300 rounded-full transition-colors"
              aria-label="Add to queue"
              title="Add to queue"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}