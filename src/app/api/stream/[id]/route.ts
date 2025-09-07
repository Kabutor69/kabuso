import { NextRequest, NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export const runtime = "nodejs";

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
    // Check if video exists and get info
    const info = await ytdl.getInfo(videoId);
    
    if (!info || !info.videoDetails) {
      return NextResponse.json(
        { error: "Video not found" }, 
        { status: 404 }
      );
    }

    // Get the best audio format
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const bestAudio = ytdl.chooseFormat(audioFormats, { quality: 'highestaudio' });

    if (!bestAudio) {
      return NextResponse.json(
        { error: "No audio format available" }, 
        { status: 400 }
      );
    }

    // Create a readable stream
    const stream = ytdl(videoId, {
      format: bestAudio,
      quality: 'highestaudio',
      filter: 'audioonly',
    });

    // Set appropriate headers for streaming
    const headers = new Headers({
      'Content-Type': 'audio/mpeg',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
    });

    // Handle range requests for seeking
    const range = req.headers.get('range');
    if (range) {
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Content-Range', range);
    }

    return new NextResponse(stream as unknown as ReadableStream<Uint8Array>, {
      status: 206,
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
