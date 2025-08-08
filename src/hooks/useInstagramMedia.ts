import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { socialApi } from "@/lib/axios";

export interface InstagramMediaItem {
  id: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO";
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count: number;
  comments_count: number;
}

export function useInstagramMedia() {
  const { token } = useAuth();
  const [items, setItems] = useState<InstagramMediaItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    setError(null);
    try {
      const res = await socialApi.get<{ posts: InstagramMediaItem[] }>(
        `/instagram/posts?skip=${page * 20}&limit=20`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const newItems = res.data?.posts ?? [];
      setItems((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === 20);
      setPage((prev) => prev + 1);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Erro ao buscar mídias do Instagram."
      );
    } finally {
      setLoading(false);
    }
  }, [loading, page, token, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(0);
    setHasMore(true);
    setError(null);
  }, []);

  return { items, loading, error, fetchMore, hasMore, reset };
}
