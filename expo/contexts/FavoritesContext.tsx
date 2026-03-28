import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorage } from './StorageContext';

interface FavoriteItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  type: 'hotel' | 'apartment' | 'villa' | 'hostel';
  distance: string;
  amenities: string[];
  isPopular?: boolean;
  hasFreeCancellation?: boolean;
  addedAt: string;
}

interface FavoritesContextType {
  favorites: FavoriteItem[];
  addToFavorites: (item: Omit<FavoriteItem, 'addedAt'>) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => Promise<void>;
  isLoading: boolean;
}

const FAVORITES_STORAGE_KEY = 'user_favorites';

export const [FavoritesProvider, useFavorites] = createContextHook((): FavoritesContextType => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getItem, setItem } = useStorage();

  // Load favorites from storage on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const stored = await getItem(FAVORITES_STORAGE_KEY);
        if (stored) {
          const parsedFavorites = JSON.parse(stored) as FavoriteItem[];
          setFavorites(parsedFavorites);
        }
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [getItem]);

  // Save favorites to storage whenever favorites change
  const saveFavorites = useCallback(async (newFavorites: FavoriteItem[]) => {
    if (!Array.isArray(newFavorites)) return;
    if (newFavorites.length > 1000) return; // Limit to prevent excessive storage
    
    try {
      await setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [setItem]);

  const addToFavorites = useCallback(async (item: Omit<FavoriteItem, 'addedAt'>) => {
    if (!item?.id?.trim() || item.id.length > 100) return;
    if (!item?.name?.trim() || item.name.length > 200) return;
    if (typeof item.price !== 'number' || item.price < 0) return;
    
    const favoriteItem: FavoriteItem = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    
    const newFavorites = [...favorites, favoriteItem];
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
    console.log('Added to favorites:', item.name);
  }, [favorites, saveFavorites]);

  const removeFromFavorites = useCallback(async (id: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== id);
    setFavorites(newFavorites);
    await saveFavorites(newFavorites);
    console.log('Removed from favorites:', id);
  }, [favorites, saveFavorites]);

  const isFavorite = useCallback((id: string) => {
    return favorites.some(fav => fav.id === id);
  }, [favorites]);

  const toggleFavorite = useCallback(async (item: Omit<FavoriteItem, 'addedAt'>) => {
    if (isFavorite(item.id)) {
      await removeFromFavorites(item.id);
    } else {
      await addToFavorites(item);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  return useMemo(() => ({
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    isLoading,
  }), [favorites, addToFavorites, removeFromFavorites, isFavorite, toggleFavorite, isLoading]);
});