import { useState, useCallback, useRef } from 'react';

export interface SearchOptions {
  query: string;
  type?: 'all' | 'artist' | 'genre';
  limit?: number;
}

export interface SearchResult {
  tracks: any[];
  error?: string;
  isLoading: boolean;
}

export interface CacheEntry {
  data: any[];
  timestamp: number;
  query: string;
  type: string;
}

class SearchService {
  private cache = new Map<string, CacheEntry>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50;

  private getCacheKey(query: string, type: string): string {
    return `${type}:${query.toLowerCase().trim()}`;
  }

  private isValidCache(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < this.CACHE_DURATION;
  }

  private cleanupCache(): void {
    if (this.cache.size > this.MAX_CACHE_SIZE) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      // Remove oldest 25% of entries
      const toRemove = Math.floor(entries.length * 0.25);
      for (let i = 0; i < toRemove; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  async search(options: SearchOptions): Promise<SearchResult> {
    const { query, type = 'all', limit = 20 } = options;
    const cacheKey = this.getCacheKey(query, type);
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && this.isValidCache(cached)) {
      return {
        tracks: cached.data.slice(0, limit),
        isLoading: false,
      };
    }

    try {
      let url = `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`;
      if (type !== 'all') {
        url += `&type=${type}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const tracks = Array.isArray(data.tracks) ? data.tracks : [];
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: tracks,
        timestamp: Date.now(),
        query,
        type,
      });
      
      this.cleanupCache();

      return {
        tracks: tracks.slice(0, limit),
        isLoading: false,
      };
    } catch (error) {
      console.error('Search failed:', error);
      return {
        tracks: [],
        error: error instanceof Error ? error.message : 'Search failed',
        isLoading: false,
      };
    }
  }

  async searchTrending(limit = 20): Promise<SearchResult> {
    const cacheKey = 'trending';
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached)) {
      return {
        tracks: cached.data.slice(0, limit),
        isLoading: false,
      };
    }

    try {
      const response = await fetch(`/api/trending?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const tracks = Array.isArray(data.tracks) ? data.tracks : [];
      
      this.cache.set(cacheKey, {
        data: tracks,
        timestamp: Date.now(),
        query: 'trending',
        type: 'trending',
      });

      return {
        tracks: tracks.slice(0, limit),
        isLoading: false,
      };
    } catch (error) {
      console.error('Trending search failed:', error);
      return {
        tracks: [],
        error: error instanceof Error ? error.message : 'Failed to load trending songs',
        isLoading: false,
      };
    }
  }

  async searchRelated(videoId: string, query?: string, limit = 15): Promise<SearchResult> {
    const cacheKey = `related:${videoId}:${query || 'default'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && this.isValidCache(cached)) {
      return {
        tracks: cached.data.slice(0, limit),
        isLoading: false,
      };
    }

    try {
      let url = `/api/related/${videoId}?limit=${limit}`;
      if (query) {
        url += `&q=${encodeURIComponent(query)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const tracks = Array.isArray(data.tracks) ? data.tracks : [];
      
      this.cache.set(cacheKey, {
        data: tracks,
        timestamp: Date.now(),
        query: query || 'default',
        type: 'related',
      });

      return {
        tracks: tracks.slice(0, limit),
        isLoading: false,
      };
    } catch (error) {
      console.error('Related search failed:', error);
      return {
        tracks: [],
        error: error instanceof Error ? error.message : 'Failed to load related songs',
        isLoading: false,
      };
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Singleton instance
export const searchService = new SearchService();

// React hook for search functionality
export function useSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async (options: SearchOptions): Promise<any[]> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await searchService.search(options);
      
      if (result.error) {
        setError(result.error);
        return [];
      }

      return result.tracks;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return [];
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchTrending = useCallback(async (limit = 20): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchService.searchTrending(limit);
      
      if (result.error) {
        setError(result.error);
        return [];
      }

      return result.tracks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load trending songs';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchRelated = useCallback(async (videoId: string, query?: string, limit = 15): Promise<any[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchService.searchRelated(videoId, query, limit);
      
      if (result.error) {
        setError(result.error);
        return [];
      }

      return result.tracks;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load related songs';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    search,
    searchTrending,
    searchRelated,
    isLoading,
    error,
    clearError,
  };
}
