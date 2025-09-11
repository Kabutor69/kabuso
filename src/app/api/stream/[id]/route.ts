import { NextRequest, NextResponse } from 'next/server';
import ytdl, { videoInfo, videoFormat } from '@distube/ytdl-core';

// Force dynamic rendering and set max duration for Vercel
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
export const preferredRegion = ['iad1', 'sfo1', 'dub1'];
export const runtime = 'nodejs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: 'Invalid video ID' }, { status: 400 });
  }

  const defaultHeaders: Record<string, string> = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'accept-language': 'en-US,en;q=0.9',
  };

  try {
    // Always use ytdl first for stability
    const info: videoInfo = await ytdl.getInfo(videoId, {
      requestOptions: { headers: defaultHeaders },
    });

    const chosen: videoFormat = ytdl.chooseFormat(info.formats, {
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    if (chosen && chosen.url) {
      // Proxy the remote audio URL with Range passthrough for seeking
      const range = req.headers.get('range');
      const upstreamHeaders: Record<string, string> = { ...defaultHeaders };
      if (range) upstreamHeaders['range'] = range;

      const upstream = await fetch(chosen.url, {
        headers: upstreamHeaders,
        redirect: 'follow',
        signal: AbortSignal.timeout(20000),
      });

      if (!upstream.ok || !upstream.body) {
        throw new Error(`Upstream fetch failed: ${upstream.status}`);
      }

      const responseHeaders = new Headers({
        'Content-Type': chosen.mimeType || 'audio/mpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
      });

      const contentRange = upstream.headers.get('content-range');
      const contentLength = upstream.headers.get('content-length');
      if (contentRange) responseHeaders.set('Content-Range', contentRange);
      if (contentLength) responseHeaders.set('Content-Length', contentLength);

      const status = range ? 206 : 200;
      return new NextResponse(upstream.body as ReadableStream<Uint8Array>, {
        status,
        headers: responseHeaders,
      });
    }

    // Fallback to server streaming via Node stream adapter
    const nodeStream = ytdl(videoId, {
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions: { headers: defaultHeaders },
    });

    const webStream = new ReadableStream<Uint8Array>({
      start(controller) {
        nodeStream.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
        nodeStream.on('end', () => controller.close());
        nodeStream.on('error', (err: Error) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    const range = req.headers.get('range');
    const status = range ? 206 : 200;
    return new NextResponse(webStream, {
      status,
      headers: new Headers({
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
      }),
    });
  } catch (err) {
    console.error('[Stream] Error:', err);
    return NextResponse.json({ error: 'Streaming failed' }, { status: 500 });
  }
}