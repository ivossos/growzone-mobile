/**
 * Feature Flags Hook
 *
 * Use this hook to check if features are enabled remotely.
 * Features can be controlled via backend without app updates!
 *
 * @example
 * ```tsx
 * const { isFeatureEnabled, isLoading } = useFeatureFlags();
 *
 * if (isFeatureEnabled('chat_enabled')) {
 *   return <ChatScreen />;
 * }
 *
 * return <ComingSoonScreen />;
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socialApi } from '@/lib/axios';
import { useAuth } from './use-auth';

// =====================================================
// Types
// =====================================================

export interface FeatureFlags {
  chat_enabled: boolean;
  chat_websocket_enabled: boolean;
  chat_media_upload_enabled: boolean;
  chat_voice_messages_enabled: boolean;
  stories_enabled: boolean;
  ai_assistant_enabled: boolean;
  [key: string]: boolean;
}

interface UserFeatureFlagsResponse {
  user_id: number | null;
  enabled_flags: string[];
  all_flags: FeatureFlags;
}

// =====================================================
// Constants
// =====================================================

const STORAGE_KEY = '@growzone:feature_flags';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const RETRY_DELAY = 30 * 1000; // 30 seconds

// Default flags (fallback if API fails)
const DEFAULT_FLAGS: FeatureFlags = {
  chat_enabled: true,
  chat_websocket_enabled: true,
  chat_media_upload_enabled: true,
  chat_voice_messages_enabled: true,
  stories_enabled: true,
  ai_assistant_enabled: false,
};

// =====================================================
// Hook
// =====================================================

export function useFeatureFlags() {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load flags from cache (AsyncStorage)
   */
  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const { flags: cachedFlags, timestamp } = JSON.parse(cached);
        const age = Date.now() - timestamp;

        // Use cache if less than CACHE_DURATION old
        if (age < CACHE_DURATION) {
          console.log('📦 Feature flags loaded from cache (age:', Math.round(age / 1000), 'seconds)');
          setFlags(cachedFlags);
          setLastFetch(timestamp);
          return true;
        }
      }
    } catch (error) {
      console.error('❌ Failed to load feature flags from cache:', error);
    }
    return false;
  }, []);

  /**
   * Save flags to cache
   */
  const saveToCache = useCallback(async (newFlags: FeatureFlags) => {
    try {
      const timestamp = Date.now();
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ flags: newFlags, timestamp })
      );
      console.log('💾 Feature flags saved to cache');
    } catch (error) {
      console.error('❌ Failed to save feature flags to cache:', error);
    }
  }, []);

  /**
   * Fetch flags from API
   */
  const fetchFlags = useCallback(async (force = false) => {
    // Don't fetch if recently fetched (unless forced)
    if (!force && lastFetch && Date.now() - lastFetch < CACHE_DURATION) {
      console.log('⏭️ Skipping feature flags fetch (recently fetched)');
      return;
    }

    try {
      console.log('🔄 Fetching feature flags from API...');
      setError(null);

      const response = await socialApi.get<UserFeatureFlagsResponse>(
        '/feature-flags/enabled',
        {
          params: { user_id: user?.id },
          timeout: 5000, // 5 second timeout
        }
      );

      const newFlags = response.data.all_flags;
      console.log('✅ Feature flags fetched:', newFlags);

      setFlags(newFlags);
      setLastFetch(Date.now());
      await saveToCache(newFlags);
    } catch (error: any) {
      console.error('❌ Failed to fetch feature flags:', error);
      setError(error.message || 'Failed to fetch feature flags');

      // Use cached flags or default flags on error
      const hasCached = await loadFromCache();
      if (!hasCached) {
        console.warn('⚠️ Using default feature flags (API unavailable)');
        setFlags(DEFAULT_FLAGS);
      }

      // Retry after delay
      setTimeout(() => fetchFlags(false), RETRY_DELAY);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, lastFetch, loadFromCache, saveToCache]);

  /**
   * Initialize: load from cache, then fetch from API
   */
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);

      // Try to load from cache first (fast)
      const hasCached = await loadFromCache();

      // Then fetch fresh data from API
      await fetchFlags(false);

      if (!hasCached) {
        setIsLoading(false);
      }
    };

    initialize();
  }, [user?.id]); // Re-fetch when user changes

  /**
   * Check if a specific feature is enabled
   */
  const isFeatureEnabled = useCallback(
    (flagKey: keyof FeatureFlags): boolean => {
      const enabled = flags[flagKey] ?? false;

      if (__DEV__ && !flags.hasOwnProperty(flagKey)) {
        console.warn(
          `⚠️ Feature flag "${flagKey}" not found. Available flags:`,
          Object.keys(flags)
        );
      }

      return enabled;
    },
    [flags]
  );

  /**
   * Manually refresh flags (e.g., on app resume)
   */
  const refresh = useCallback(() => {
    return fetchFlags(true);
  }, [fetchFlags]);

  /**
   * Clear cache (for debugging)
   */
  const clearCache = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Feature flags cache cleared');
  }, []);

  return {
    flags,
    isFeatureEnabled,
    isLoading,
    error,
    refresh,
    clearCache,
    lastUpdated: lastFetch > 0 ? new Date(lastFetch) : null,
  };
}

// =====================================================
// Higher-Order Component (Optional)
// =====================================================

/**
 * HOC to wrap a component with feature flag check
 *
 * @example
 * ```tsx
 * const ChatScreen = withFeatureFlag('chat_enabled', () => (
 *   <View><Text>Chat!</Text></View>
 * ));
 * ```
 */
export function withFeatureFlag<P extends object>(
  flagKey: keyof FeatureFlags,
  Component: React.ComponentType<P>,
  FallbackComponent?: React.ComponentType<P>
) {
  return function FeatureFlagWrapper(props: P) {
    const { isFeatureEnabled, isLoading } = useFeatureFlags();

    if (isLoading) {
      return null; // or a loading spinner
    }

    if (!isFeatureEnabled(flagKey)) {
      if (FallbackComponent) {
        return <FallbackComponent {...props} />;
      }
      return null;
    }

    return <Component {...props} />;
  };
}
