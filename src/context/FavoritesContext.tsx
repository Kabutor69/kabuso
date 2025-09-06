"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { Track } from "./AudioContext";

type FavoritesContextType = {
  favorites: Track[];
  addToFavorites: (track: Track) => void;
  removeFromFavorites: (videoId: string) => void;
  isFavorite: (videoId: string) => boolean;
  toggleFavorite: (track: Track) => void;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<Track[]>([]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFavorites = localStorage.getItem('kabuso_favorites');
      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (err) {
          console.error('Failed to load favorites:', err);
        }
      }
    }
  }, []);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kabuso_favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const addToFavorites = (track: Track) => {
    setFavorites(prev => {
      const exists = prev.find(fav => fav.videoId === track.videoId);
      if (exists) return prev;
      return [...prev, track];
    });
  };

  const removeFromFavorites = (videoId: string) => {
    setFavorites(prev => prev.filter(fav => fav.videoId !== videoId));
  };

  const isFavorite = (videoId: string) => {
    return favorites.some(fav => fav.videoId === videoId);
  };

  const toggleFavorite = (track: Track) => {
    if (isFavorite(track.videoId)) {
      removeFromFavorites(track.videoId);
    } else {
      addToFavorites(track);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        toggleFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
