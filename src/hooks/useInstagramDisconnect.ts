import axios from "axios";
import Constants from "expo-constants";
import { useAuth } from "@/hooks/use-auth";

const extra: any = Constants.expoConfig?.extra ?? (Constants as any).manifestExtra ?? {};
const AUTH_API_URL = extra.AUTH_API_URL || "https://dev.auth.growzone.co/api/v1";
const API_URL = `${AUTH_API_URL}/instagram/disconnect`;

export function useInstagramDisconnect() {
  const { token } = useAuth();

  async function disconnectInstagram() {
    if (!token) throw new Error("No token available");

    await axios.delete(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return { disconnectInstagram };
}