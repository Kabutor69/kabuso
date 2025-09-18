import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  try {
    const videoInfo = await youtubeService.getVideoInfo(videoId);

    if (!videoInfo) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ video: videoInfo });

  } catch (error) {
    console.error('Video info error:', error);
    return NextResponse.json({ error: 'Failed to get video info' }, { status: 500 });
  }
}
