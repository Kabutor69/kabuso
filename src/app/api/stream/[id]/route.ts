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

    // Try multiple approaches to get audio stream
    console.log(`[Stream] Starting stream for videoId: ${videoId}`);

    // Approach 1: Try Piped API first
    const pipedInstances = [
      'https://pipedapi.kavin.rocks',
      'https://piped.video',
      'https://pipedapi.tux.pizza',
    ];

    for (const base of pipedInstances) {
      try {
        console.log(`[Stream] Trying Piped instance: ${base}`);
        const infoRes = await fetch(`${base}/streams/${videoId}`, {
          headers: requestOptions.headers,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });
        
        if (!infoRes.ok) {
          console.log(`[Stream] Piped ${base} failed with status: ${infoRes.status}`);
          continue;
        }
        
        const infoJson = await infoRes.json();
        console.log(`[Stream] Piped response keys:`, Object.keys(infoJson || {}));
        
        const audioStreams = infoJson?.audioStreams || [];
        if (audioStreams.length > 0) {
          console.log(`[Stream] Found ${audioStreams.length} audio streams`);
          
          // Prefer mp4/m4a, then highest bitrate
          const preferred = audioStreams.find(s => s.mimeType?.includes('audio/mp4')) ||
                           audioStreams.find(s => s.codec?.includes('mp4a')) ||
                           audioStreams.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

          if (preferred?.url) {
            console.log(`[Stream] Using audio stream: ${preferred.mimeType}, bitrate: ${preferred.bitrate}`);
            
            const upstreamHeaders: Record<string, string> = {
              'user-agent': requestOptions.headers['user-agent'],
              'accept-language': requestOptions.headers['accept-language'],
            };
            const clientRange = req.headers.get('range');
            if (clientRange) upstreamHeaders['range'] = clientRange;

            const upstream = await fetch(preferred.url, {
              headers: upstreamHeaders,
              redirect: 'follow',
              signal: AbortSignal.timeout(15000), // 15s timeout
            });

            if (!upstream.ok) {
              console.log(`[Stream] Upstream fetch failed: ${upstream.status}`);
              continue;
            }

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

            console.log(`[Stream] Successfully proxying from Piped: ${base}`);
            return new NextResponse(upstream.body as ReadableStream<Uint8Array>, {
              status: upstream.status,
              headers,
            });
          }
        }
      } catch (err) {
        console.log(`[Stream] Piped ${base} error:`, err);
        continue;
      }
    }

    // Approach 2: Fallback to ytdl with better error handling
    console.log(`[Stream] All Piped instances failed, trying ytdl fallback`);
    try {
      const info = await ytdl.getInfo(videoId, { requestOptions });
      if (!info || !info.videoDetails) {
        console.log(`[Stream] ytdl: Video not found`);
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }
      
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
      console.log(`[Stream] ytdl: Found ${audioFormats.length} audio formats`);
      
      const preferred = audioFormats.find(f => f.mimeType?.includes('audio/mp4')) || audioFormats[0];
      if (!preferred?.url) {
        console.log(`[Stream] ytdl: No audio format available`);
        return NextResponse.json({ error: 'No audio format available' }, { status: 400 });
      }
      
      console.log(`[Stream] ytdl: Using format: ${preferred.mimeType}`);
      const upstream = await fetch(preferred.url, {
        headers: requestOptions.headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      });
      
      if (!upstream.ok) {
        console.log(`[Stream] ytdl upstream failed: ${upstream.status}`);
        throw new Error(`Upstream fetch failed: ${upstream.status}`);
      }
      
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
      
      console.log(`[Stream] ytdl: Successfully proxying stream`);
      return new NextResponse(upstream.body as ReadableStream<Uint8Array>, {
        status: upstream.status,
        headers,
      });
    } catch (ytdlErr) {
      console.log(`[Stream] ytdl fallback failed:`, ytdlErr);
      throw ytdlErr;
    }

  } catch (err) {
    console.error("[Stream] Final error:", err);
    return NextResponse.json(
      { error: `Failed to stream audio: ${err instanceof Error ? err.message : 'Unknown error'}` }, 
      { status: 500 }
    );
  }
}
