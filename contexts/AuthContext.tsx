import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContextType, User, LoginCredentials, SignUpData } from '@/types/auth';
import { useStorage } from '@/contexts/StorageContext';

// GDPR compliant storage keys
const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  ONBOARDING_COMPLETE: 'onboarding_complete',
  CONSENT_PREFERENCES: 'consent_preferences',
} as const;





export const [AuthProvider, useAuth] = createContextHook((): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const storage = useStorage();

  const isAuthenticated = user !== null;

  // Mock API functions (replace with actual API calls)
  const authAPI = useMemo(() => ({
    async login(credentials: LoginCredentials): Promise<{ user: User; token: string; refreshToken: string }> {
      if (!credentials?.email?.trim() || !credentials?.password?.trim()) {
        throw new Error('Invalid credentials');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: '1',
        email: credentials.email,
        firstName: 'John',
        lastName: 'Doe',
        preferences: {
          currency: 'USD',
          language: 'en',
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return {
        user,
        token: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
      };
    },
    
    async signUp(data: SignUpData): Promise<{ user: User; token: string; refreshToken: string }> {
      if (!data?.email?.trim() || !data?.password?.trim() || !data?.firstName?.trim() || !data?.lastName?.trim()) {
        throw new Error('Invalid signup data');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const user: User = {
        id: Date.now().toString(),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        preferences: {
          currency: 'USD',
          language: 'en',
          notifications: {
            email: data.agreeToMarketing,
            push: true,
            sms: false,
          },
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      return {
        user,
        token: 'mock_jwt_token',
        refreshToken: 'mock_refresh_token',
      };
    },
    
    async updateProfile(updates: Partial<User>): Promise<User> {
      if (!updates || typeof updates !== 'object') {
        throw new Error('Invalid update data');
      }
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const storedUser = await storage.getItem(STORAGE_KEYS.USER_DATA);
      if (!storedUser) throw new Error('User not found');
      
      const currentUser = JSON.parse(storedUser);
      const updatedUser = { ...currentUser, ...updates, updatedAt: new Date().toISOString() };
      
      return updatedUser;
    },
    
    async deleteAccount(): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }), [storage]);

  const initializeAuth = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const storedUser = await storage.getItem(STORAGE_KEYS.USER_DATA);
      const authToken = await storage.getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
      const onboardingComplete = await storage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      
      if (storedUser && authToken) {
        setUser(JSON.parse(storedUser));
        setHasCompletedOnboarding(onboardingComplete === 'true');
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { user, token, refreshToken } = await authAPI.login(credentials);
      
      await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await storage.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      
      setUser(user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authAPI, storage]);

  const signUp = useCallback(async (data: SignUpData): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!data.agreeToTerms || !data.agreeToPrivacy) {
        throw new Error('You must agree to the Terms of Service and Privacy Policy to create an account.');
      }
      
      const { user, token, refreshToken } = await authAPI.signUp(data);
      
      await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      await storage.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      
      const consentPreferences = {
        terms: data.agreeToTerms,
        privacy: data.agreeToPrivacy,
        marketing: data.agreeToMarketing,
        timestamp: new Date().toISOString(),
      };
      await storage.setItem(STORAGE_KEYS.CONSENT_PREFERENCES, JSON.stringify(consentPreferences));
      
      setUser(user);
    } catch (error) {
      console.error('Sign up failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authAPI, storage]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      await storage.removeSecureItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storage]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      
      const updatedUser = await authAPI.updateProfile(updates);
      
      await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authAPI, storage]);

  const deleteAccount = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await authAPI.deleteAccount();
      
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      await storage.removeSecureItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeSecureItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
      await storage.removeItem(STORAGE_KEYS.CONSENT_PREFERENCES);
      
      setUser(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Account deletion failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authAPI, storage]);

  const completeOnboarding = useCallback((): void => {
    storage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, 'true');
    setHasCompletedOnboarding(true);
  }, [storage]);

  return useMemo(() => ({
    user,
    isAuthenticated,
    isLoading,
    hasCompletedOnboarding,
    login,
    signUp,
    logout,
    updateProfile,
    deleteAccount,
    completeOnboarding,
  }), [user, isAuthenticated, isLoading, hasCompletedOnboarding, login, signUp, logout, updateProfile, deleteAccount, completeOnboarding]);
});