import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const videoId = params.id;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  try {
    // Import ytdl only when needed (fixes build issues)
    const ytdl = await import("@distube/ytdl-core");

    const info = await ytdl.getInfo(videoId);
<<<<<<< HEAD
    const format = ytdl.chooseFormat(info.formats, { 
      quality: 'highestaudio',
      filter: 'audioonly',
=======
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
>>>>>>> 438d3e15d9dc6c4ec165cd0db9f5bf79277050c1
    });

    if (!format?.url) {
      throw new Error("No audio format found");
    }

<<<<<<< HEAD
    const stream = ytdl(videoId, {
      quality: 'highestaudio',
      filter: 'audioonly',
      requestOptions: {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
        },
      },
    });

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
=======
    // Redirect to YouTube audio URL
    return NextResponse.redirect(format.url, 302);
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json({ error: "Streaming failed" }, { status: 500 });
>>>>>>> 438d3e15d9dc6c4ec165cd0db9f5bf79277050c1
  }
}
