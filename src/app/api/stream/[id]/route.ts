import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ must await
) {
  // await the params
  const { id: videoId } = await context.params;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return NextResponse.json({ error: "Invalid video ID" }, { status: 400 });
  }

  try {
    const ytdl = (await import("@distube/ytdl-core")).default; // ✅ default export

    console.log(`Redirecting to video audio stream: ${videoId}`);

    const info = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!format?.url) {
      throw new Error("No audio format found");
    }

    // 🔹 redirect to YouTube audio URL (works without cookies)
    return NextResponse.redirect(format.url, 302);
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json({ error: "Streaming failed" }, { status: 500 });
  }
}
