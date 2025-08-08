import { useEffect, useState } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "@/hooks/use-auth";

const extra: any = Constants.expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};
const AUTH_API_URL = extra.AUTH_API_URL || "https://dev.auth.growzone.co/api/v1";
const API_URL = `${AUTH_API_URL}/instagram/integration-status`;

export interface InstagramIntegrationData {
  is_connected: boolean;
  instagram_username?: string;
}

export function useInstagramStatus() {
  const { token, isLoadingUserStorage } = useAuth();
  const [data, setData] = useState<InstagramIntegrationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchStatus() {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to fetch status.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isLoadingUserStorage && token) {
      fetchStatus();
    }
  }, [token, isLoadingUserStorage]);

  return { data, loading, error, refetch: fetchStatus };
}
