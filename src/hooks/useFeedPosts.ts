import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { socialDevApi } from "@/lib/axios";

export interface FeedPost {
  id: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | string;
  media_url: string;
  timestamp: string;
  [key: string]: any;
}

export function useFeedPosts(limit = 20) {
  const { token } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (loading) return;
      setLoading(true);
      setError(null);

      try {
        const skip = reset ? 0 : page * limit;
        const response = await socialDevApi.get(
          `/feed-posts?skip=${skip}&limit=${limit}&types=grow,social`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newPosts: FeedPost[] = response.data.posts ?? [];
        setPosts(prev => (reset ? newPosts : [...prev, ...newPosts]));
        setHasMore(newPosts.length === limit);
        setPage(prev => (reset ? 1 : prev + 1));
      } catch (err: any) {
        setError(err.response?.data?.detail || err.message || "Erro ao carregar feed.");
      } finally {
        setLoading(false);
      }
    },
    [token, page, limit, loading]
  );

  useEffect(() => {
    fetchPosts(true);
  }, [fetchPosts]);

  const refresh = useCallback(() => fetchPosts(true), [fetchPosts]);
  const fetchMore = useCallback(() => {
    if (hasMore && !loading) fetchPosts();
  }, [fetchPosts, hasMore, loading]);

  return {
    posts,
    loading,
    error,
    hasMore,
    refresh,
    fetchMore,
  };
}
