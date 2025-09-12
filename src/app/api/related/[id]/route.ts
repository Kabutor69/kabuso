import { NextRequest, NextResponse } from 'next/server';
import YouTube from 'youtube-sr';

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

    const results = await YouTube.search(query, {
      type: 'video',
      limit: 60,
    });

    const seen = new Set<string>([videoId]);
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
      .filter(t => t.duration >= 30)
      .filter(t => !/shorts/i.test(t.title))
      .filter(t => {
        if (seen.has(t.videoId)) return false;
        seen.add(t.videoId);
        return true;
      })
      .slice(0, 15);

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error('Related songs error:', error);
    return NextResponse.json({ error: 'Failed to load related songs' }, { status: 500 });
  }
}