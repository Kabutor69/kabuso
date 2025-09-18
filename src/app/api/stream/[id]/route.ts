import { NextRequest, NextResponse } from 'next/server';
import { youtubeService } from '@/lib/youtube';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  try {
    console.log(`Streaming video: ${videoId}`);
    
    const { stream, format } = await youtubeService.getAudioStream(videoId);

    const responseHeaders = new Headers({
      'Content-Type': format.mimeType || 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    });

    return new NextResponse(stream as unknown as ReadableStream<Uint8Array>, {
      status: 200,
      headers: responseHeaders,
    });

  } catch (error: unknown) {
    console.error('Stream error:', error);
    return NextResponse.json({ error: 'Streaming failed' }, { status: 500 });
  }
}