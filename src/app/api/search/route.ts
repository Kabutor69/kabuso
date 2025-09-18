import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.max(1, Math.min(50, isNaN(limitParam) ? 20 : limitParam));
  const type = searchParams.get('type') || 'all'; // all, artist, genre

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    let tracks;

    switch (type) {
      case 'artist':
        tracks = await youtubeService.searchByArtist(query);
        break;
      case 'genre':
        tracks = await youtubeService.searchByGenre(query);
        break;
      default:
        tracks = await youtubeService.searchVideos({
          query,
          maxResults: limit,
          order: 'relevance',
        });
    }

    return NextResponse.json({ tracks: tracks.slice(0, limit) });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}