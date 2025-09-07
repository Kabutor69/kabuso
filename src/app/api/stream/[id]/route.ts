import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const preferredRegion = ["iad1", "sfo1", "dub1"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json(
      { error: "Invalid video ID" }, 
      { status: 400 }
    );
  }

  try {
    // Common headers to improve success rate from cloud hosts
    const requestOptions = {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9',
      },
    } as const;

    // Check if video exists and get info
    const info = await ytdl.getInfo(videoId, { requestOptions });
    
    if (!info || !info.videoDetails) {
      return NextResponse.json(
        { error: "Video not found" }, 
        { status: 404 }
      );
    }

    // Get the best audio format with broad browser support (prefer MP4/MPEG)
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const preferred =
      audioFormats.find((f) => f.mimeType?.includes('audio/mp4')) ||
      audioFormats.find((f) => f.mimeType?.includes('audio/mpeg'));
    const bestAudio = preferred || ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });

    if (!bestAudio) {
      return NextResponse.json(
        { error: "No audio format available" }, 
        { status: 400 }
      );
    }

    // Range/seek support
    const getContentLength = (format: unknown): number | undefined => {
      if (format && typeof format === 'object' && 'contentLength' in (format as Record<string, unknown>)) {
        const raw = (format as { contentLength?: string }).contentLength;
        const parsed = raw ? parseInt(raw, 10) : NaN;
        return Number.isFinite(parsed) ? parsed : undefined;
      }
      return undefined;
    };
    const totalSize = getContentLength(bestAudio);
    const rangeHeader = req.headers.get('range');
    let statusCode = 200;
    let startByte = 0;
    let endByte: number | undefined = totalSize ? totalSize - 1 : undefined;
    if (rangeHeader && totalSize) {
      const match = /bytes=(\d+)-(\d+)?/.exec(rangeHeader);
      if (match) {
        startByte = parseInt(match[1], 10);
        if (match[2]) {
          endByte = Math.min(parseInt(match[2], 10), totalSize - 1);
        } else {
          endByte = totalSize - 1;
        }
        if (startByte > (endByte as number)) startByte = 0;
        statusCode = 206;
      }
    }

    // Instead of piping ytdl stream (can be blocked on serverless), fetch the direct media URL
    const upstreamHeaders: Record<string, string> = {
      'user-agent': requestOptions.headers['user-agent'],
      'accept-language': requestOptions.headers['accept-language'],
    };
    const clientRange = req.headers.get('range');
    if (clientRange) upstreamHeaders['range'] = clientRange;

    const upstream = await fetch(bestAudio.url!, {
      headers: upstreamHeaders,
      redirect: 'follow',
    });

    // Prepare response headers from upstream
    const contentType = upstream.headers.get('content-type') || bestAudio.mimeType?.split(';')[0] || 'audio/mpeg';
    const headers = new Headers({
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
      'Accept-Ranges': upstream.headers.get('accept-ranges') || 'bytes',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    });
    const cr = upstream.headers.get('content-range');
    if (cr) headers.set('Content-Range', cr);
    const cl = upstream.headers.get('content-length');
    if (cl) headers.set('Content-Length', cl);

    return new NextResponse(upstream.body as ReadableStream<Uint8Array>, {
      status: upstream.status,
      headers,
    });

  } catch (err) {
    console.error("Streaming error:", err);
    return NextResponse.json(
      { error: "Failed to stream audio" }, 
      { status: 500 }
    );
  }
}
