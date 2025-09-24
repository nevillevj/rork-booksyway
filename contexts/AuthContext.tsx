import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { AuthContextType, User, LoginCredentials, SignUpData, GoogleAuthData } from '@/types/auth';
import { useStorage } from '@/contexts/StorageContext';

WebBrowser.maybeCompleteAuthSession();

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
    
    async signInWithGoogle(googleData: GoogleAuthData): Promise<{ user: User; token: string; refreshToken: string }> {
      if (!googleData?.email?.trim() || !googleData?.firstName?.trim() || !googleData?.lastName?.trim()) {
        throw new Error('Invalid Google authentication data');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user: User = {
        id: googleData.googleId,
        email: googleData.email,
        firstName: googleData.firstName,
        lastName: googleData.lastName,
        profileImage: googleData.profileImage,
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
        token: 'mock_google_jwt_token',
        refreshToken: 'mock_google_refresh_token',
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

  const googleAuthConfig = useMemo(() => {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'com.yourcompany.yourapp',
    });

    return {
      clientId: Platform.select({
        ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 'your-ios-client-id.googleusercontent.com',
        android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 'your-android-client-id.googleusercontent.com',
        web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id.googleusercontent.com',
        default: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 'your-web-client-id.googleusercontent.com',
      }),
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
    };
  }, []);

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

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const request = new AuthSession.AuthRequest({
        clientId: googleAuthConfig.clientId,
        scopes: googleAuthConfig.scopes,
        redirectUri: googleAuthConfig.redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
      });

      if (result.type === 'success' && result.params.code) {
        const tokenResponse = await AuthSession.exchangeCodeAsync(
          {
            clientId: googleAuthConfig.clientId,
            code: result.params.code,
            redirectUri: googleAuthConfig.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier || '',
            },
          },
          {
            tokenEndpoint: 'https://oauth2.googleapis.com/token',
          }
        );

        if (tokenResponse.accessToken) {
          const userInfoResponse = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenResponse.accessToken}`
          );
          const userInfo = await userInfoResponse.json();

          const googleData: GoogleAuthData = {
            email: userInfo.email,
            firstName: userInfo.given_name || '',
            lastName: userInfo.family_name || '',
            profileImage: userInfo.picture,
            googleId: userInfo.id,
          };

          const { user, token, refreshToken } = await authAPI.signInWithGoogle(googleData);
          
          await storage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
          await storage.setSecureItem(STORAGE_KEYS.AUTH_TOKEN, token);
          await storage.setSecureItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
          
          const consentPreferences = {
            terms: true,
            privacy: true,
            marketing: false,
            timestamp: new Date().toISOString(),
          };
          await storage.setItem(STORAGE_KEYS.CONSENT_PREFERENCES, JSON.stringify(consentPreferences));
          
          setUser(user);
        } else {
          throw new Error('Failed to get access token from Google');
        }
      } else if (result.type === 'error') {
        throw new Error(result.params?.error_description || 'Google authentication failed');
      } else {
        throw new Error('Google authentication was cancelled');
      }
    } catch (error) {
      console.error('Google sign in failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authAPI, storage, googleAuthConfig]);

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
    signInWithGoogle,
    logout,
    updateProfile,
    deleteAccount,
    completeOnboarding,
  }), [user, isAuthenticated, isLoading, hasCompletedOnboarding, login, signUp, signInWithGoogle, logout, updateProfile, deleteAccount, completeOnboarding]);
});