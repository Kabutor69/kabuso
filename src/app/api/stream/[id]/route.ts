import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await context.params;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  try {
    // ✅ grab default export
    const { default: ytdl } = await import("@distube/ytdl-core");

    console.log(`Streaming video: ${videoId}`);

    const info = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!format?.url) {
      throw new Error("No audio format found");
    }

    const stream = ytdl(videoId, {
      quality: "highestaudio",
      filter: "audioonly",
      requestOptions: {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
          cookie: process.env.YT_COOKIE || "",
        },
      },
    });

    const responseHeaders = new Headers({
      "Content-Type": format.mimeType || "audio/mpeg",
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store",
    });

    return new NextResponse(stream as unknown as ReadableStream<Uint8Array>, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json({ error: "Streaming failed" }, { status: 500 });
  }
}
