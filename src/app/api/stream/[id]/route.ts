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

    // Create a readable stream (Node.js Readable) with optional byte range
    const nodeStream = ytdl(videoId, {
      format: bestAudio,
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions,
      range: totalSize && statusCode === 206 ? { start: startByte, end: endByte } : undefined,
      highWaterMark: 1 << 20, // 1MB buffer to reduce stalls on serverless
    });

    // Set appropriate headers for streaming
    const contentType = bestAudio.mimeType?.split(";")[0] || 'audio/mpeg';
    const headers = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    });

    if (statusCode === 206 && totalSize && endByte !== undefined) {
      const chunkSize = (endByte as number) - startByte + 1;
      headers.set('Content-Range', `bytes ${startByte}-${endByte}/${totalSize}`);
      headers.set('Content-Length', String(chunkSize));
    } else if (totalSize) {
      headers.set('Content-Length', String(totalSize));
    }

    // Convert Node stream to Web ReadableStream for NextResponse
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: statusCode,
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
