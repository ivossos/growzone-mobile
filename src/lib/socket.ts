/**
 * WebSocket Service for Real-time Chat
 */

import { Message, TypingIndicator, OnlineStatus } from "@/api/@types/chat";

type MessageHandler = (message: Message) => void;
type TypingHandler = (data: TypingIndicator) => void;
type OnlineStatusHandler = (data: OnlineStatus) => void;
type ConnectionHandler = () => void;

class ChatSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  // Event handlers
  private messageHandlers: MessageHandler[] = [];
  private typingHandlers: TypingHandler[] = [];
  private onlineStatusHandlers: OnlineStatusHandler[] = [];
  private connectHandlers: ConnectionHandler[] = [];
  private disconnectHandlers: ConnectionHandler[] = [];

  constructor(url: string) {
    this.url = url;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("Socket already connected");
      return;
    }

    this.token = token;
    const wsUrl = `${this.url}?token=${token}`;

    try {
      this.socket = new WebSocket(wsUrl);

      this.socket.onopen = () => {
        console.log("✅ WebSocket connected");
        this.reconnectAttempts = 0;
        this.connectHandlers.forEach((handler) => handler());
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.socket.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
      };

      this.socket.onclose = () => {
        console.log("WebSocket disconnected");
        this.disconnectHandlers.forEach((handler) => handler());
        this.attemptReconnect();
      };
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any) {
    switch (data.type) {
      case "message":
        this.messageHandlers.forEach((handler) => handler(data.payload));
        break;
      case "typing":
        this.typingHandlers.forEach((handler) => handler(data.payload));
        break;
      case "online_status":
        this.onlineStatusHandlers.forEach((handler) => handler(data.payload));
        break;
      default:
        console.log("Unknown message type:", data.type);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Attempting to reconnect in ${delay}ms...`);
    setTimeout(() => {
      if (this.token) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * Send a message through WebSocket
   */
  sendMessage(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error("WebSocket is not connected");
    }
  }

  /**
   * Send typing indicator
   */
  sendTyping(conversationId: string, isTyping: boolean) {
    this.sendMessage({
      type: "typing",
      payload: {
        conversationId,
        isTyping,
      },
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  /**
   * Event listeners
   */
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter((h) => h !== handler);
    };
  }

  onTyping(handler: TypingHandler) {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter((h) => h !== handler);
    };
  }

  onOnlineStatus(handler: OnlineStatusHandler) {
    this.onlineStatusHandlers.push(handler);
    return () => {
      this.onlineStatusHandlers = this.onlineStatusHandlers.filter((h) => h !== handler);
    };
  }

  onConnect(handler: ConnectionHandler) {
    this.connectHandlers.push(handler);
    return () => {
      this.connectHandlers = this.connectHandlers.filter((h) => h !== handler);
    };
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectHandlers.push(handler);
    return () => {
      this.disconnectHandlers = this.disconnectHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance
// WebSocket URL from AWS Lambda deployment
const WS_URL = "wss://aa5uoe07w3.execute-api.us-east-1.amazonaws.com/dev";
export const chatSocket = new ChatSocketService(WS_URL);
