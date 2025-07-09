import axios from "axios";
import { useAuth } from "@/hooks/use-auth";

const API_URL = "https://dev1.auth.growzone.co/api/v1/instagram/disconnect";

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