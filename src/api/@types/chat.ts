/**
 * Chat Types & Interfaces
 * Growzone Mobile - Chat System
 */

export interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
  online?: boolean;
  lastSeen?: string;
}

export interface Message {
  _id: string | number;
  text?: string;
  createdAt: Date | number;
  user: {
    _id: string | number;
    name: string;
    avatar?: string;
  };
  image?: string;
  video?: string;
  audio?: {
    uri: string;
    duration: number;
  };
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
  read?: boolean;
  replyTo?: {
    _id: string | number;
    text: string;
    user: {
      _id: string | number;
      name: string;
    };
  };
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: {
    text: string;
    createdAt: string;
    senderId: string;
    type?: 'text' | 'audio' | 'image' | 'video' | 'file';
  };
  unreadCount: number;
  online?: boolean;
  typing?: boolean;
  pinned?: boolean;
  muted?: boolean;
  isFollowing?: boolean;
}

export interface ChatApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SendMessagePayload {
  conversationId?: string;
  recipientId: string;
  text?: string;
  image?: string;
  video?: string;
  audio?: {
    uri: string;
    duration: number;
  };
  replyToId?: string | number;
}

export interface CreateConversationPayload {
  recipientId: string;
  initialMessage?: string;
}

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'pending' | 'failed';

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface OnlineStatus {
  userId: string;
  online: boolean;
  lastSeen?: string;
}
