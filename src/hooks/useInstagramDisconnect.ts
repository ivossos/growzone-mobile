import { authApi } from "@/lib/axios";
import { useAuth } from "@/hooks/use-auth";

export function useInstagramDisconnect() {
  const { token } = useAuth();

  async function disconnectInstagram() {
    if (!token) throw new Error("No token available");

    try {
      await authApi.delete("/instagram/disconnect", {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err: any) {
      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to disconnect Instagram";
      const e = new Error(detail);
      (e as any).cause = err;
      throw e;
    }
  }

  return { disconnectInstagram };
}
