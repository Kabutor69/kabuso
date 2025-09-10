import { NextRequest, NextResponse } from 'next/server';
import ytdl from '@distube/ytdl-core';

// Force dynamic rendering and set max duration for Vercel
export const dynamic = 'force-dynamic';
export const maxDuration = 300;
export const preferredRegion = ['iad1', 'sfo1', 'dub1'];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  
  if (!videoId) {
    return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
  }

  console.log(`[Stream] Starting stream for videoId: ${videoId}`);

  // Browser-like headers to avoid bot detection
  const requestOptions = {
    headers: {
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'accept-encoding': 'gzip, deflate, br',
      'dnt': '1',
      'connection': 'keep-alive',
      'upgrade-insecure-requests': '1',
    }
  };

  try {
    // Method 1: Direct YouTube page parsing (most reliable)
    console.log(`[Stream] Trying direct YouTube page parsing`);
    
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const pageResponse = await fetch(youtubeUrl, {
      headers: requestOptions.headers,
      signal: AbortSignal.timeout(15000),
    });

    if (pageResponse.ok) {
      const pageText = await pageResponse.text();
      console.log(`[Stream] Got YouTube page, length: ${pageText.length}`);

      // Extract player response from page
      const playerResponseMatch = pageText.match(/var ytInitialPlayerResponse = ({.+?});/);
      if (playerResponseMatch) {
        try {
          const playerResponse = JSON.parse(playerResponseMatch[1]);
          console.log(`[Stream] Parsed player response`);

          const streamingData = playerResponse?.streamingData;
          if (streamingData?.adaptiveFormats) {
            console.log(`[Stream] Found ${streamingData.adaptiveFormats.length} adaptive formats`);

            // Filter for audio-only formats
            const audioFormats = streamingData.adaptiveFormats.filter((format: { mimeType?: string; url?: string }) => {
              return format.mimeType?.includes('audio') && 
                     format.url && 
                     !format.mimeType?.includes('video');
            });

            if (audioFormats.length > 0) {
              console.log(`[Stream] Found ${audioFormats.length} audio formats`);

              // Select best audio format (prefer mp4/m4a, then highest bitrate)
              const bestFormat = audioFormats.find((f: { mimeType?: string }) => f.mimeType?.includes('audio/mp4')) ||
                                audioFormats.find((f: { codec?: string }) => f.codec?.includes('mp4a')) ||
                                audioFormats.sort((a: { bitrate?: number }, b: { bitrate?: number }) => (b.bitrate || 0) - (a.bitrate || 0))[0];

              if (bestFormat?.url) {
                console.log(`[Stream] Using audio format: ${bestFormat.mimeType}, bitrate: ${bestFormat.bitrate}`);

                // Get range header for seeking support
                const range = req.headers.get('range');
                const upstreamHeaders: Record<string, string> = {
                  'user-agent': requestOptions.headers['user-agent'],
                  'accept-language': requestOptions.headers['accept-language'],
                };
                
                if (range) {
                  upstreamHeaders['range'] = range;
                }

                // Fetch the audio stream
                const streamResponse = await fetch(bestFormat.url, {
                  headers: upstreamHeaders,
                  redirect: 'follow',
                  signal: AbortSignal.timeout(20000),
                });

                if (streamResponse.ok) {
                  console.log(`[Stream] Successfully fetched audio stream`);

                  // Prepare response headers
                  const responseHeaders = new Headers({
                    'Content-Type': bestFormat.mimeType || 'audio/mpeg',
                    'Cache-Control': 'no-store, no-cache, must-revalidate',
                    'Accept-Ranges': 'bytes',
                    'X-Content-Type-Options': 'nosniff',
                  });

                  // Copy range-related headers if present
                  const contentRange = streamResponse.headers.get('content-range');
                  const contentLength = streamResponse.headers.get('content-length');
                  
                  if (contentRange) {
                    responseHeaders.set('Content-Range', contentRange);
                  }
                  if (contentLength) {
                    responseHeaders.set('Content-Length', contentLength);
                  }

                  // Return the stream with appropriate status
                  const status = range ? 206 : 200;
                  
                  console.log(`[Stream] Returning audio stream with status ${status}`);
                  return new NextResponse(streamResponse.body as ReadableStream<Uint8Array>, {
                    status,
                    headers: responseHeaders,
                  });
                } else {
                  console.log(`[Stream] Stream fetch failed: ${streamResponse.status}`);
                }
              }
            } else {
              console.log(`[Stream] No audio formats found in adaptiveFormats`);
            }
          } else {
            console.log(`[Stream] No streamingData or adaptiveFormats found`);
          }
        } catch (parseError) {
          console.log(`[Stream] Failed to parse player response:`, parseError);
        }
      } else {
        console.log(`[Stream] Player response not found in page`);
      }
    } else {
      console.log(`[Stream] YouTube page fetch failed: ${pageResponse.status}`);
    }

    // Method 2: ytdl-core fallback with proper configuration
    console.log(`[Stream] Trying ytdl-core fallback`);
    
    try {
      const info = await ytdl.getInfo(videoId, {
        requestOptions: {
          headers: requestOptions.headers,
        },
      });

      if (!info || !info.videoDetails) {
        console.log(`[Stream] ytdl: Video not found`);
        return NextResponse.json({ error: 'Video not found' }, { status: 404 });
      }

      console.log(`[Stream] ytdl: Got video info for "${info.videoDetails.title}"`);

      // Get audio stream
      const audioStream = ytdl(videoId, {
        quality: 'highestaudio',
        filter: 'audioonly',
        requestOptions: {
          headers: requestOptions.headers,
        },
      });

      // Convert Node.js stream to Web ReadableStream
      const webStream = new ReadableStream({
        start(controller) {
          audioStream.on('data', (chunk) => {
            controller.enqueue(chunk);
          });
          
          audioStream.on('end', () => {
            controller.close();
          });
          
          audioStream.on('error', (error) => {
            controller.error(error);
          });
        },
        cancel() {
          audioStream.destroy();
        }
      });

      // Get range header for seeking
      const range = req.headers.get('range');
      const status = range ? 206 : 200;

      const headers = new Headers({
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Accept-Ranges': 'bytes',
        'X-Content-Type-Options': 'nosniff',
      });

      console.log(`[Stream] ytdl: Returning audio stream with status ${status}`);
      return new NextResponse(webStream, {
        status,
        headers,
      });

    } catch (ytdlError) {
      console.log(`[Stream] ytdl fallback failed:`, ytdlError);
    }

    // If all methods fail
    console.log(`[Stream] All streaming methods failed`);
    return NextResponse.json({ 
      error: 'Unable to stream video. Please try again later.' 
    }, { status: 500 });

  } catch (error) {
    console.log(`[Stream] Final error:`, error);
    return NextResponse.json({ 
      error: 'Streaming failed. Please try again.' 
    }, { status: 500 });
  }
}