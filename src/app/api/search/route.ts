import { NextRequest, NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.max(1, Math.min(50, isNaN(limitParam) ? 20 : limitParam));

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    const results = await YouTube.search(query, {
      type: 'video',
      limit: 60,
    });

    const seen = new Set<string>();
    const tracks = results
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
      })
      .slice(0, limit);

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}