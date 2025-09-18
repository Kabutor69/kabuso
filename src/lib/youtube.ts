import { google, youtube_v3 } from 'googleapis';
import ytdl from '@distube/ytdl-core';

export interface YouTubeTrack {
  videoId: string;
  title: string;
  artists: string;
  duration: number;
  views: number;
  thumbnail: string;
}

export interface YouTubeSearchOptions {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
  publishedAfter?: string;
  publishedBefore?: string;
}

export interface VideoInfo {
  videoId: string;
  title: string;
  artists: string;
  duration: number;
  views: number;
  thumbnail: string;
  description?: string;
  publishedAt?: string;
  channelId?: string;
}

class YouTubeService {
  private youtube: youtube_v3.Youtube | null = null;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY || '';
    // Don't throw error during build time
    if (!this.apiKey && typeof window === 'undefined') {
      console.warn('YouTube API key not found. Service will not be available.');
      return;
    }
    
    if (!this.apiKey) {
      throw new Error('YouTube API key is required. Please set YOUTUBE_API_KEY environment variable.');
    }
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: this.apiKey,
    });
  }

  private ensureInitialized(): void {
    if (!this.youtube) {
      throw new Error('YouTube service not initialized. Please check your API key.');
    }
  }

  /**
   * Search for videos using YouTube Data API v3
   */
  async searchVideos(options: YouTubeSearchOptions): Promise<YouTubeTrack[]> {
    this.ensureInitialized();
    try {
      const response = await this.youtube!.search.list({
        part: ['snippet'],
        q: options.query,
        type: ['video'],
        maxResults: Math.min(options.maxResults || 50, 50),
        order: options.order || 'relevance',
        publishedAfter: options.publishedAfter,
        publishedBefore: options.publishedBefore,
        videoDuration: 'medium', // Filter out shorts (short videos)
        fields: 'items(id(videoId),snippet(title,channelTitle,thumbnails,publishedAt))',
      });

      if (!response.data.items || response.data.items.length === 0) {
        return [];
      }

      // Get video IDs for detailed information
      const videoIds = response.data.items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => !!id);

      if (videoIds.length === 0) {
        return [];
      }

      // Get detailed video information including duration and view count
      const videoDetails = await this.getVideoDetails(videoIds);

      // Combine search results with video details
      const tracks: YouTubeTrack[] = response.data.items
        .map((item) => {
          const videoId = item.id?.videoId;
          const details = videoDetails.find((d) => d.id === videoId);
          
          if (!videoId || !details) return null;

          return {
            videoId,
            title: item.snippet?.title || 'Unknown Title',
            artists: item.snippet?.channelTitle || 'Unknown Artist',
            duration: this.parseDuration(details.contentDetails?.duration || ''),
            views: parseInt(details.statistics?.viewCount || '0'),
            thumbnail: item.snippet?.thumbnails?.high?.url || 
                      item.snippet?.thumbnails?.medium?.url || 
                      item.snippet?.thumbnails?.default?.url || '',
          };
        })
        .filter((track): track is YouTubeTrack => {
          if (!track) return false;
          // Filter out shorts and very short videos
          return track.duration >= 30 && !/shorts/i.test(track.title);
        });

      return tracks;
    } catch (error) {
      console.error('YouTube search error:', error);
      throw new Error('Failed to search YouTube videos');
    }
  }

  /**
   * Get detailed video information including duration and view count
   */
  private async getVideoDetails(videoIds: string[]): Promise<youtube_v3.Schema$Video[]> {
    this.ensureInitialized();
    try {
      const response = await this.youtube!.videos.list({
        part: ['contentDetails', 'statistics'],
        id: videoIds,
        fields: 'items(id,contentDetails(duration),statistics(viewCount))',
      });

      return response.data.items || [];
    } catch (error) {
      console.error('YouTube video details error:', error);
      return [];
    }
  }

  /**
   * Get comprehensive video information for a single video
   */
  async getVideoInfo(videoId: string): Promise<VideoInfo | null> {
    this.ensureInitialized();
    try {
      const response = await this.youtube!.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId],
        fields: 'items(id,snippet(title,channelTitle,thumbnails,publishedAt,description,channelId),contentDetails(duration),statistics(viewCount))',
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const item = response.data.items[0];
      return {
        videoId: item.id || '',
        title: item.snippet?.title || 'Unknown Title',
        artists: item.snippet?.channelTitle || 'Unknown Artist',
        duration: this.parseDuration(item.contentDetails?.duration || ''),
        views: parseInt(item.statistics?.viewCount || '0'),
        thumbnail: item.snippet?.thumbnails?.high?.url || 
                  item.snippet?.thumbnails?.medium?.url || 
                  item.snippet?.thumbnails?.default?.url || '',
        description: item.snippet?.description || undefined,
        publishedAt: item.snippet?.publishedAt || undefined,
        channelId: item.snippet?.channelId || undefined,
      };
    } catch (error) {
      console.error('YouTube video info error:', error);
      return null;
    }
  }

  /**
   * Get audio stream for a video using ytdl-core
   */
  async getAudioStream(videoId: string): Promise<{ stream: NodeJS.ReadableStream; format: ytdl.videoFormat; info: ytdl.videoInfo }> {
    try {
      const info = await ytdl.getInfo(videoId);
      const format = ytdl.chooseFormat(info.formats, {
        quality: 'highestaudio',
        filter: 'audioonly',
      });

      if (!format || !format.url) {
        throw new Error('No audio format found');
      }

      const stream = ytdl(videoId, {
        quality: 'highestaudio',
        filter: 'audioonly',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36',
          },
        },
      });

      return { stream, format, info };
    } catch (error) {
      console.error('YouTube stream error:', error);
      throw new Error('Failed to get audio stream');
    }
  }

  /**
   * Parse ISO 8601 duration format to seconds
   */
  private parseDuration(duration: string): number {
    if (!duration) return 0;
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Search for trending music videos
   */
  async getTrendingMusic(): Promise<YouTubeTrack[]> {
    const currentYear = new Date().getFullYear();
    const publishedAfter = `${currentYear}-01-01T00:00:00Z`;
    
    return this.searchVideos({
      query: 'music',
      maxResults: 50,
      order: 'viewCount',
      publishedAfter,
    });
  }

  /**
   * Search for related music videos based on a query
   */
  async getRelatedMusic(query: string = 'music'): Promise<YouTubeTrack[]> {
    return this.searchVideos({
      query,
      maxResults: 50,
      order: 'relevance',
    });
  }

  /**
   * Search for music by specific artist
   */
  async searchByArtist(artist: string): Promise<YouTubeTrack[]> {
    return this.searchVideos({
      query: `${artist} music`,
      maxResults: 30,
      order: 'relevance',
    });
  }

  /**
   * Search for music by genre
   */
  async searchByGenre(genre: string): Promise<YouTubeTrack[]> {
    return this.searchVideos({
      query: `${genre} music`,
      maxResults: 30,
      order: 'relevance',
    });
  }
}

// Export singleton instance
export const youtubeService = new YouTubeService();
