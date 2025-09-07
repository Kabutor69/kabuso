import { NextResponse } from "next/server";
import { YouTube } from "youtube-sr";

export const runtime = "nodejs";

// Cache trending results for 30 minutes
type YouTubeVideo = {
  id?: string;
  title?: string;
  channel?: { name?: string };
  thumbnail?: { url?: string };
  duration?: number | { seconds?: number };
  views?: number;
  uploadedAt?: string;
};
let cachedTrending: Array<{
  videoId: string;
  title: string;
  artists: string;
  thumbnail: string;
  duration: number;
  views?: number;
  uploadedAt?: string;
}> = [];
let lastTrendingFetch = 0;
const TRENDING_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  const now = Date.now();
  
  // Return cached results if still fresh
  if (cachedTrending.length > 0 && (now - lastTrendingFetch) < TRENDING_CACHE_DURATION) {
    return NextResponse.json(cachedTrending);
  }

  try {
    // Try multiple search strategies for trending content
    const searches = [
      "trending songs 2024",
      "popular music",
      "top hits",
      "viral songs",
      "latest music",
      "new releases"
    ];

    let allResults: YouTubeVideo[] = [];
    
    for (const searchTerm of searches) {
      try {
        const results = await YouTube.search(searchTerm, { 
          type: "video",
          limit: 10 
        });
        if (results && Array.isArray(results)) {
          allResults = [...allResults, ...results];
        }
      } catch (searchErr) {
        console.warn(`Search failed for "${searchTerm}":`, searchErr);
      }
    }

    // Remove duplicates and filter valid tracks
    const uniqueTracks = new Map<string, YouTubeVideo>();
    allResults.forEach((video) => {
      if (video?.id && 
          /^[a-zA-Z0-9-_]{11}$/.test(video.id) && 
          !uniqueTracks.has(video.id)) {
        uniqueTracks.set(video.id, video);
      }
    });

    const songs = (Array.from(uniqueTracks.values()) as YouTubeVideo[])
      .slice(0, 24) // Top 24 trending
      .map((video) => ({
        videoId: (video.id as string),
        title: (video.title as string) || "",
        artists: video.channel?.name || "Unknown Artist",
        thumbnail: video.thumbnail?.url || "/placeholder-music.jpg",
        // Normalize duration to seconds
        duration: typeof video.duration === 'number' 
          ? (video.duration > 10000 ? Math.floor(video.duration / 1000) : video.duration)
          : (video.duration?.seconds || 0),
        views: video.views,
        uploadedAt: video.uploadedAt,
      }));

    // Cache results
    cachedTrending = songs;
    lastTrendingFetch = now;

    return NextResponse.json(songs);

  } catch (err) {
    console.error("Trending fetch error:", err);
    
    // Return cached results if available, even if stale
    if (cachedTrending.length > 0) {
      return NextResponse.json(cachedTrending);
    }
    
    return NextResponse.json(
      { error: "Failed to fetch trending songs" }, 
      { status: 500 }
    );
  }
}
