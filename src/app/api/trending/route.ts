import { NextResponse } from 'next/server';
import { youtubeService, YouTubeTrack } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type TrendingCache = { data: { tracks: YouTubeTrack[] }; timestamp: number } | null;

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

    const tracks = await youtubeService.getTrendingMusic();

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