import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get('genre');
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);
  const limit = Math.max(1, Math.min(50, isNaN(limitParam) ? 20 : limitParam));

  if (!genre || genre.trim().length === 0) {
    return NextResponse.json({ error: 'Genre is required' }, { status: 400 });
  }

  try {
    const tracks = await youtubeService.searchByGenre(genre);

    return NextResponse.json({ tracks: tracks.slice(0, limit) });

  } catch (error) {
    console.error('Genre search error:', error);
    return NextResponse.json({ error: 'Genre search failed' }, { status: 500 });
  }
}
