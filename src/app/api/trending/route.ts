import { NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type Track = {
  videoId: string;
  title: string;
  artists: string;
  duration: number;
  views: number;
  thumbnail: string;
};

type TrendingCache = { data: { tracks: Track[] }; timestamp: number } | null;

// Simple cache
let cache: TrendingCache = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.max(1, Math.min(50, isNaN(limitParam) ? 20 : limitParam));

    // Return cached data if still fresh and limit unchanged
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION && Array.isArray(cache.data?.tracks) && cache.data.tracks.length >= limit) {
      const sliced = { tracks: cache.data.tracks.slice(0, limit) };
      return NextResponse.json(sliced);
    }

    const results = await YouTube.search('trending music 2024', {
      type: 'video',
      limit: 60,
    });

    const seen = new Set<string>();
    const tracks: Track[] = results
      .filter(video => !!video.id)
      .map(video => ({
        videoId: video.id!,
        title: video.title || 'Unknown Title',
        artists: video.channel?.name || 'Unknown Artist',
        duration: Math.floor((video.duration || 0) / 1000),
        views: video.views || 0,
        thumbnail: video.thumbnail?.url || '',
      }))
      .filter(t => {
        if (seen.has(t.videoId)) return false;
        seen.add(t.videoId);
        return true;
      });

    const data = { tracks };
    cache = { data, timestamp: Date.now() };

    return NextResponse.json({ tracks: tracks.slice(0, limit) });

  } catch (error) {
    console.error('Trending error:', error);
    if (cache) {
      return NextResponse.json(cache.data);
    }
    return NextResponse.json({ error: 'Failed to load trending songs' }, { status: 500 });
  }
}