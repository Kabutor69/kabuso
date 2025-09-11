"use client";
import { Play, MoreHorizontal, Heart, Clock, Music } from "lucide-react";
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
  showMeta?: boolean; // show duration/views if provided
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
}: TrackCardProps) {
  const durationText = (raw?: number) => {
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

  const viewsText = (views?: number) => {
    if (!views) return "";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <div
      className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 hover:bg-gray-800/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/20 border border-gray-700/50"
      role="article"
      aria-label={`${track.title} by ${track.artists}`}
    >
      <div className="relative mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={track.thumbnail}
          alt={track.title}
          className="w-full aspect-square rounded-xl object-cover shadow-lg"
        />
        <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={onPlay}
            className="bg-cyan-500 hover:bg-cyan-400 text-black p-3 rounded-full shadow-lg transform hover:scale-110 transition-all duration-200"
            aria-label="Play"
            title="Play"
          >
            <Play className="w-6 h-6 ml-1" />
          </button>
        </div>
        {typeof indexBadge !== "undefined" && (
          <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold">
            {indexBadge}
          </div>
        )}
        {isActive && (
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

        {showMeta && (track.duration || track.views) && (
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              {track.duration && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-700/40 text-gray-300 font-mono">
                  <Clock className="w-3 h-3" />
                  {durationText(track.duration)}
                </span>
              )}
              {track.views && <span>{viewsText(track.views)}</span>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onPlay}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Play
          </button>
          {onAddToQueue && (
            <button
              onClick={onAddToQueue}
              className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
              title="Add to queue"
              aria-label="Add to queue"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onToggleFavorite}
            className={`p-2 transition-colors ${
              isFavorite ? "text-red-400 hover:text-red-300" : "text-gray-400 hover:text-red-400"
            }`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}


