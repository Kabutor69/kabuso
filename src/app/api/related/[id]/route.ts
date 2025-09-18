import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  try {
    const query = q || 'music';

    const tracks = await youtubeService.getRelatedMusic(query);

    // Filter out the current video from results
    const filteredTracks = tracks
      .filter(track => track.videoId !== videoId)
      .slice(0, 15);

    return NextResponse.json({ tracks: filteredTracks });

  } catch (error) {
    console.error('Related songs error:', error);
    return NextResponse.json({ error: 'Failed to load related songs' }, { status: 500 });
  }
}