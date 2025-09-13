import { NextRequest } from "next/server";
import ytdl from "@distube/ytdl-core";

export const dynamic = "force-dynamic";
export const maxDuration = 300;
export const runtime = "nodejs";

function isVercel() {
  return process.env.VERCEL === "1";
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const videoId = params.id;

  if (!videoId || !/^[a-zA-Z0-9-_]{11}$/.test(videoId)) {
    return new Response(JSON.stringify({ error: "Invalid video ID" }), {
      status: 400,
    });
  }

  try {
    const info = await ytdl.getInfo(videoId);
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!format?.url) {
      throw new Error("No audio format found");
    }

    // On Vercel → redirect to YouTube's own CDN URL
    if (isVercel()) {
      return Response.redirect(format.url, 302);
    }

    // Local → stream via ytdl
    const nodeStream = ytdl(videoId, {
      quality: "highestaudio",
      filter: "audioonly",
      highWaterMark: 1 << 25,
    });

    const readable = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(readable, {
      status: 200,
      headers: {
        "Content-Type": format.mimeType || "audio/mpeg",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new Response(JSON.stringify({ error: "Streaming failed" }), {
      status: 500,
    });
  }
}
