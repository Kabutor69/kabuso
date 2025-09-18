import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseApiOptions {
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export interface UseApiReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<T | null>;
  reset: () => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { immediate = false, retryCount = 0, retryDelay = 1000 } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = retryCount + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await apiFunction(...args);
        
        if (!controller.signal.aborted) {
          setData(result);
          setError(null);
          return result;
        }
        
        return null;
      } catch (err) {
        if (controller.signal.aborted) {
          return null;
        }

        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        
        if (attempts === maxAttempts - 1) {
          setError(errorMessage);
          return null;
        }

        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    return null;
  }, [apiFunction, retryCount, retryDelay]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute]);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
  };
}

// Specialized hook for YouTube API calls
export function useYouTubeApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const makeRequest = useCallback(async (
    url: string,
    options: RequestInit = {}
  ): Promise<any> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    isLoading,
    error,
    makeRequest,
    cancelRequest,
    clearError,
  };
}

// Hook for managing local storage with type safety
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for managing search history
export function useSearchHistory(maxItems: number = 10) {
  const [history, setHistory] = useLocalStorage<string[]>('kabuso_search_history', []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    
    setHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, maxItems);
    });
  }, [setHistory, maxItems]);

  const removeFromHistory = useCallback((query: string) => {
    setHistory(prev => prev.filter(item => item !== query));
  }, [setHistory]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}
