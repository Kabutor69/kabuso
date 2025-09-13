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
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!format?.url) {
      throw new Error("No audio format found");
    }

    // Redirect to YouTube audio URL
    return NextResponse.redirect(format.url, 302);
  } catch (error) {
    console.error("Stream error:", error);
    return NextResponse.json({ error: "Streaming failed" }, { status: 500 });
  }
}
