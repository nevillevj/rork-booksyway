import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { useCallback, useMemo } from 'react';

interface StorageContextType {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  setSecureItem: (key: string, value: string) => Promise<void>;
  getSecureItem: (key: string) => Promise<string | null>;
  removeSecureItem: (key: string) => Promise<void>;
}

export const [StorageProvider, useStorage] = createContextHook((): StorageContextType => {
  const setItem = useCallback(async (key: string, value: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) return;
    if (!value || value.length > 10000) return;
    await AsyncStorage.setItem(key.trim(), value);
  }, []);

  const getItem = useCallback(async (key: string): Promise<string | null> => {
    if (!key?.trim() || key.length > 100) return null;
    return await AsyncStorage.getItem(key.trim());
  }, []);

  const removeItem = useCallback(async (key: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) return;
    await AsyncStorage.removeItem(key.trim());
  }, []);

  const setSecureItem = useCallback(async (key: string, value: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) return;
    if (!value || value.length > 10000) return;
    
    if (Platform.OS === 'web') {
      localStorage.setItem(key.trim(), value);
    } else {
      await SecureStore.setItemAsync(key.trim(), value);
    }
  }, []);

  const getSecureItem = useCallback(async (key: string): Promise<string | null> => {
    if (!key?.trim() || key.length > 100) return null;
    
    if (Platform.OS === 'web') {
      return localStorage.getItem(key.trim());
    } else {
      return await SecureStore.getItemAsync(key.trim());
    }
  }, []);

  const removeSecureItem = useCallback(async (key: string): Promise<void> => {
    if (!key?.trim() || key.length > 100) return;
    
    if (Platform.OS === 'web') {
      localStorage.removeItem(key.trim());
    } else {
      await SecureStore.deleteItemAsync(key.trim());
    }
  }, []);

  return useMemo(() => ({
    setItem,
    getItem,
    removeItem,
    setSecureItem,
    getSecureItem,
    removeSecureItem,
  }), [setItem, getItem, removeItem, setSecureItem, getSecureItem, removeSecureItem]);
});