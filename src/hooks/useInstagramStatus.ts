import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { authApi } from "@/lib/axios";

export interface InstagramIntegrationData {
  is_connected: boolean;
  instagram_username?: string;
}

export function useInstagramStatus() {
  const { token, isLoadingUserStorage } = useAuth();
  const [data, setData] = useState<InstagramIntegrationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const response = await authApi.get("/instagram/integration-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to fetch status.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isLoadingUserStorage && token) {
      fetchStatus();
    }
  }, [token, isLoadingUserStorage, fetchStatus]);

  return { data, loading, error, refetch: fetchStatus };
}
