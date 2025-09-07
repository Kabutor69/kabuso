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

    // 1) Try Piped API (privacy-friendly YouTube proxy) to avoid bot checks
    const pipedInstances = [
      process.env.PIPED_INSTANCE?.replace(/\/$/, '') || 'https://piped.video',
      'https://pipedapi.kavin.rocks',
      'https://piped.video',
    ];

    for (const base of pipedInstances) {
      try {
        const infoRes = await fetch(`${base}/streams/${videoId}`, {
          headers: requestOptions.headers,
          next: { revalidate: 0 },
        });
        if (!infoRes.ok) throw new Error(`Piped info ${infoRes.status}`);
        const infoJson = await infoRes.json();
        const audioStreams: Array<{ url: string; mimeType?: string; bitrate?: number; codec?: string }>
          = infoJson?.audioStreams || [];
        if (audioStreams.length > 0) {
          // Prefer mp4/m4a
          const preferred =
            audioStreams.find(s => (s.mimeType || '').includes('audio/mp4')) ||
            audioStreams.find(s => (s.codec || '').includes('mp4a')) ||
            audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

          if (preferred?.url) {
            const upstreamHeaders: Record<string, string> = {
              'user-agent': requestOptions.headers['user-agent'],
              'accept-language': requestOptions.headers['accept-language'],
            };
            const clientRange = req.headers.get('range');
            if (clientRange) upstreamHeaders['range'] = clientRange;

            const upstream = await fetch(preferred.url, {
              headers: upstreamHeaders,
              redirect: 'follow',
            });

            const contentType = upstream.headers.get('content-type') || preferred.mimeType || 'audio/mpeg';
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
          }
        }
      } catch {
        // try next instance
      }
    }

    // 2) Fallback to ytdl (may hit bot checks in some regions)
    const info = await ytdl.getInfo(videoId, { requestOptions });
    if (!info || !info.videoDetails) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
    const preferred = audioFormats.find(f => f.mimeType?.includes('audio/mp4')) || audioFormats[0];
    if (!preferred?.url) {
      return NextResponse.json({ error: 'No audio format available' }, { status: 400 });
    }
    const upstream = await fetch(preferred.url, {
      headers: requestOptions.headers,
      redirect: 'follow',
    });
    const headers = new Headers({
      'Content-Type': upstream.headers.get('content-type') || preferred.mimeType || 'audio/mpeg',
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
