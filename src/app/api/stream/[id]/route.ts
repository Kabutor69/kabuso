import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";
import { Readable } from "stream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

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

    // Create a readable stream (Node.js Readable)
    const nodeStream = ytdl(videoId, {
      format: bestAudio,
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions,
    });

    // Set appropriate headers for streaming
    const contentType = bestAudio.mimeType?.split(";")[0] || 'audio/mpeg';
    const headers = new Headers({
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      // Avoid CDN buffering issues; stream is dynamic
      'Cache-Control': 'no-store',
    });

    // Handle range requests for seeking
    const range = req.headers.get('range');
    if (range) {
      headers.set('Accept-Ranges', 'bytes');
    }

    // Convert Node stream to Web ReadableStream for NextResponse
    const webStream = Readable.toWeb(nodeStream) as unknown as ReadableStream<Uint8Array>;

    return new NextResponse(webStream, {
      status: 200,
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
