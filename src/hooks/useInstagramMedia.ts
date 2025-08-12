import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { socialApi } from "@/lib/axios";

export interface InstagramMediaItem {
  id: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | string;
  media_url: string;
  timestamp: string;
  [key: string]: any;
}

export function useInstagramMedia() {
  const { token, user } = useAuth();
  const [items, setItems] = useState<InstagramMediaItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importedInstagramIds, setImportedInstagramIds] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function fetchImportedIds() {
      if (!token || !user?.id) return;

      const headers = { Authorization: `Bearer ${token}` };
      let ids: string[] = [];

      try {
        const r = await socialApi.get(`/listed-social-posts/${user.id}?skip=0&limit=200`, { headers });
        ids = (Array.isArray(r.data) ? r.data : [])
          .filter((post: any) => post.instagram_id)
          .map((post: any) => post.instagram_id);
      } catch {
        try {
          const r = await socialApi.get(`/listed-social-post/${user.id}?skip=0&limit=200`, { headers });
          ids = (Array.isArray(r.data) ? r.data : [])
            .filter((post: any) => post.instagram_id)
            .map((post: any) => post.instagram_id);
        } catch {
          try {
            const r = await socialApi.get(`/listed-social-posts/${user.id}?skip=0&limit=200`, { headers });
            ids = (Array.isArray(r.data) ? r.data : [])
              .filter((post: any) => post.instagram_id)
              .map((post: any) => post.instagram_id);
          } catch (err: any) {
            setError(err?.response?.data?.detail || "Erro ao buscar posts importados.");
          }
        }
      } finally {
        setImportedInstagramIds(ids);
        setInitialized(true);
      }
    }

    fetchImportedIds();
  }, [token, user]);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore || !initialized || !token) return;

    // /instagram/posts em AUTH não pagina (no dev atual). Após a primeira chamada, encerre.
    if (page > 0) {
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await socialApi.get(`/instagram/posts?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newItems: InstagramMediaItem[] = res.data?.posts ?? [];
      const filtered = newItems.filter(
        (item) => !importedInstagramIds.includes(item.id)
      );

      setItems((prev) => [...prev, ...filtered]);
      setHasMore(false);
      setPage((prev) => prev + 1);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erro ao carregar conteúdos do Instagram.");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, token, importedInstagramIds, initialized]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPage(0);
    setHasMore(true);

    try {
      const res = await socialApi.get(`/instagram/posts?limit=20`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const allItems: InstagramMediaItem[] = res.data?.posts ?? [];
      const filtered = allItems.filter(
        (item) => !importedInstagramIds.includes(item.id)
      );

      setItems(filtered);
      setHasMore(false);
      setPage(1);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Erro ao buscar mídia.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, importedInstagramIds]);

  return {
    items,
    loading,
    fetchMore,
    hasMore,
    error,
    refresh,
    importedInstagramIds,
  };
}
