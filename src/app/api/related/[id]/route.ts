import { NextRequest, NextResponse } from "next/server";
import { YouTube } from "youtube-sr";
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
    // Get video info to extract title and artist for related search
    const info = await ytdl.getInfo(videoId);
    const videoDetails = info.videoDetails;
    
    if (!videoDetails) {
      return NextResponse.json(
        { error: "Video not found" }, 
        { status: 404 }
      );
    }

    // Create search query from video title and author
    const searchQuery = `${videoDetails.title} ${videoDetails.author.name}`;
    
    // Search for related videos
    const results = await YouTube.search(searchQuery, { 
      type: "video",
      limit: 10 
    });
    
    if (!results || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "No related videos found" }, 
        { status: 404 }
      );
    }

    // Filter out the current video and format results
    type YouTubeVideo = {
      id?: string;
      title?: string;
      channel?: { name?: string };
      thumbnail?: { url?: string };
      duration?: { seconds?: number };
      views?: number;
      uploadedAt?: string;
    };
    const relatedSongs = (results as YouTubeVideo[])
      .filter((video) => 
        Boolean(video) &&
        Boolean(video.id) && 
        video.id !== videoId &&
        /^[a-zA-Z0-9-_]{11}$/.test(video.id as string) &&
        Boolean(video.title)
      )
      .slice(0, 5) // Return top 5 related
      .map((video) => ({
        videoId: video.id as string,
        title: (video.title as string) || "",
        artists: video.channel?.name || "Unknown Artist",
        thumbnail: video.thumbnail?.url || "/placeholder-music.jpg",
        duration: video.duration?.seconds || 0,
        views: video.views,
        uploadedAt: video.uploadedAt,
      }));

    // Return related songs (multiple for auto-play queue)
    if (relatedSongs.length > 0) {
      // Check if client wants a single random song or multiple
      const url = new URL(req.url);
      const single = url.searchParams.get('single') === 'true';
      
      if (single) {
      const randomIndex = Math.floor(Math.random() * relatedSongs.length);
      return NextResponse.json(relatedSongs[randomIndex]);
      }
      
      // Return all related songs for auto-play queue
      return NextResponse.json(relatedSongs);
    }

    return NextResponse.json(
      { error: "No related videos found" }, 
      { status: 404 }
    );

  } catch (err) {
    console.error("Related videos error:", err);
    return NextResponse.json(
      { error: "Failed to fetch related videos" }, 
      { status: 500 }
    );
  }
}
