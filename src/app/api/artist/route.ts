import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const artist = searchParams.get('artist');
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.max(1, Math.min(50, isNaN(limitParam) ? 20 : limitParam));

  if (!artist || artist.trim().length === 0) {
    return NextResponse.json({ error: 'Artist name is required' }, { status: 400 });
  }

  try {
    const tracks = await youtubeService.searchByArtist(artist);

    return NextResponse.json({ tracks: tracks.slice(0, limit) });

  } catch (error) {
    console.error('Artist search error:', error);
    return NextResponse.json({ error: 'Artist search failed' }, { status: 500 });
  }
}
