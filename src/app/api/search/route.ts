import { NextRequest, NextResponse } from "next/server";
import { YouTube } from "youtube-sr";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { error: "Search query is required" }, 
      { status: 400 }
    );
  }

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Search query must be at least 2 characters" }, 
      { status: 400 }
    );
  }

  try {
    // Search for videos using youtube-sr
    const results = await YouTube.search(query, { 
      type: "video",
      limit: 50 
    });
    
    if (!results || !Array.isArray(results)) {
      return NextResponse.json([]);
    }

    // Filter and format results
    type YouTubeVideo = {
      id?: string;
      title?: string;
      channel?: { name?: string };
      thumbnail?: { url?: string };
      duration?: { seconds?: number };
      views?: number;
      uploadedAt?: string;
    };
    const songs = (results as YouTubeVideo[])
      .filter((video) => 
        Boolean(video) && 
        Boolean(video.id) && 
        /^[a-zA-Z0-9-_]{11}$/.test(video.id as string) &&
        Boolean(video.title)
      )
      .map((video) => ({
        videoId: video.id as string,
        title: (video.title as string) || "",
        artists: video.channel?.name || "Unknown Artist",
        thumbnail: video.thumbnail?.url || "/placeholder-music.jpg",
        duration: video.duration?.seconds || 0,
        views: video.views,
        uploadedAt: video.uploadedAt,
      }));

    return NextResponse.json(songs);

  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json(
      { error: "Search temporarily unavailable" }, 
      { status: 500 }
    );
  }
}
