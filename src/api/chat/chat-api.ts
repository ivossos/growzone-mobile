/**
 * Chat API Service
 * Backend integration for messaging
 */

import { socialApi } from "@/lib/axios";
import {
  Conversation,
  Message,
  SendMessagePayload,
  ChatApiResponse,
  TypingIndicator,
} from "../@types/chat";

/**
 * Get all conversations for current user
 */
export async function getConversations(): Promise<Conversation[]> {
  const response = await socialApi.get<ChatApiResponse<Conversation[]>>("/chat/conversations");
  return response.data.data;
}

/**
 * Get messages for a specific conversation
 */
export async function getMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
  const response = await socialApi.get<ChatApiResponse<Message[]>>(
    `/chat/conversations/${conversationId}/messages`,
    {
      params: { limit, offset },
    }
  );
  return response.data.data;
}

/**
 * Send a message
 */
export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  const response = await socialApi.post<ChatApiResponse<Message>>(
    "/chat/messages",
    payload
  );
  return response.data.data;
}

/**
 * Mark messages as read
 */
export async function markAsRead(conversationId: string, messageIds: (string | number)[]): Promise<void> {
  await socialApi.post(`/chat/conversations/${conversationId}/read`, {
    message_ids: messageIds,
  });
}

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
  await socialApi.post(`/chat/conversations/${conversationId}/typing`, {
    is_typing: isTyping,
  });
}

/**
 * Create a new conversation
 */
export async function createConversation(recipientId: string, initialMessage?: string): Promise<Conversation> {
  const response = await socialApi.post<ChatApiResponse<Conversation>>(
    "/chat/conversations",
    {
      recipient_id: recipientId,
      initial_message: initialMessage,
    }
  );
  return response.data.data;
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string | number): Promise<void> {
  await socialApi.delete(`/chat/messages/${messageId}`);
}

/**
 * Pin/unpin a conversation
 */
export async function togglePinConversation(conversationId: string, pinned: boolean): Promise<void> {
  await socialApi.patch(`/chat/conversations/${conversationId}`, {
    pinned,
  });
}

/**
 * Mute/unmute a conversation
 */
export async function toggleMuteConversation(conversationId: string, muted: boolean): Promise<void> {
  await socialApi.patch(`/chat/conversations/${conversationId}`, {
    muted,
  });
}

/**
 * Upload media for messages (image/audio/video)
 */
export async function uploadMedia(file: FormData): Promise<{ url: string }> {
  const response = await socialApi.post<ChatApiResponse<{ url: string }>>(
    "/chat/upload",
    file,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data.data;
}
