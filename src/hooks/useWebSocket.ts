/**
 * WebSocket Hook
 * Manages WebSocket connection for real-time chat
 */

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";

const WS_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_RT || "ws://localhost:3000";

interface UseWebSocketReturn {
  socket: Socket | null;
  connected: boolean;
  error: Error | null;
}

export function useWebSocket(): UseWebSocketReturn {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket connection
    const socket = io(WS_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on("connect", () => {
      console.log("WebSocket connected");
      setConnected(true);
      setError(null);
    });

    socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err);
      setError(err);
      setConnected(false);
    });

    socket.on("error", (err) => {
      console.error("WebSocket error:", err);
      setError(err);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return {
    socket: socketRef.current,
    connected,
    error,
  };
}
