/**
 * useChat Hook
 * Manages chat state and backend integration
 */

import { useState, useEffect, useCallback } from "react";
import { Message, Conversation } from "@/api/@types/chat";
import {
  getConversations,
  getMessages,
  sendMessage as apiSendMessage,
  markAsRead,
  sendTypingIndicator,
} from "@/api/chat/chat-api";
import { chatSocket } from "@/lib/socket";
import { useAuth } from "@/context/auth-context";

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { token } = useAuth();

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations();
      setConversations(data);
    } catch (err) {
      setError(err as Error);
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();

    // Connect to WebSocket
    if (token && chatSocket) {
      chatSocket.connect(token);
    }

    return () => {
      chatSocket.disconnect();
    };
  }, [token, loadConversations]);

  return {
    conversations,
    loading,
    error,
    refresh: loadConversations,
  };
}

export function useConversation(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Load messages
  const loadMessages = useCallback(
    async (offset = 0) => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMessages(conversationId, 50, offset);

        if (offset === 0) {
          setMessages(data.reverse());
        } else {
          setMessages((prev) => [...data.reverse(), ...prev]);
        }

        setHasMore(data.length === 50);
      } catch (err) {
        setError(err as Error);
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    },
    [conversationId]
  );

  // Send message
  const sendMessage = useCallback(
    async (text: string, options?: { image?: string; audio?: any; replyToId?: string | number }) => {
      try {
        const payload = {
          conversationId,
          recipientId: "", // This should come from conversation data
          text,
          ...options,
        };

        const newMessage = await apiSendMessage(payload);
        setMessages((prev) => [...prev, newMessage]);
        return newMessage;
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [conversationId]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (messageIds: (string | number)[]) => {
      try {
        await markAsRead(conversationId, messageIds);
      } catch (err) {
        console.error("Failed to mark messages as read:", err);
      }
    },
    [conversationId]
  );

  // Send typing indicator
  const setTyping = useCallback(
    async (typing: boolean) => {
      try {
        await sendTypingIndicator(conversationId, typing);
      } catch (err) {
        console.error("Failed to send typing indicator:", err);
      }
    },
    [conversationId]
  );

  // WebSocket listeners
  useEffect(() => {
    const unsubscribeMessage = chatSocket.onMessage((message) => {
      // Only add messages for this conversation
      if (message.user._id.toString() !== conversationId) return;
      setMessages((prev) => [...prev, message]);
    });

    const unsubscribeTyping = chatSocket.onTyping((data) => {
      if (data.conversationId === conversationId) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      unsubscribeMessage();
      unsubscribeTyping();
    };
  }, [conversationId]);

  // Load initial messages
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    loading,
    error,
    isTyping,
    hasMore,
    sendMessage,
    markMessagesAsRead,
    setTyping,
    loadMore: () => loadMessages(messages.length),
    refresh: () => loadMessages(0),
  };
}
