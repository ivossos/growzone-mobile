/**
 * Mock Data for Chat Development
 * TODO: Replace with real API calls
 */

import { Conversation, Message } from "../@types/chat";

export const mockConversations: Conversation[] = [
  {
    id: "1",
    userId: "user123",
    userName: "João Silva",
    userAvatar: "https://i.pravatar.cc/150?img=1",
    lastMessage: {
      text: "Opa, viu as últimas fotos da minha plantação?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 min ago
      senderId: "user123",
      type: "text",
    },
    unreadCount: 2,
    online: true,
    pinned: false,
    muted: false,
    isFollowing: true,
  },
  {
    id: "2",
    userId: "user456",
    userName: "Maria Santos",
    userAvatar: "https://i.pravatar.cc/150?img=5",
    lastMessage: {
      text: "Valeu pelas dicas! Vou testar amanhã",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
      senderId: "user456",
      type: "text",
    },
    unreadCount: 0,
    online: false,
    pinned: true,
    muted: false,
    isFollowing: true,
  },
  {
    id: "3",
    userId: "user789",
    userName: "Pedro Oliveira",
    userAvatar: "https://i.pravatar.cc/150?img=3",
    lastMessage: {
      text: "Conseguiu resolver o problema da praga?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
      senderId: "user789",
      type: "audio",
    },
    unreadCount: 1,
    online: true,
    typing: false,
    pinned: false,
    muted: false,
    isFollowing: false,
  },
  {
    id: "4",
    userId: "user101",
    userName: "Ana Costa",
    userAvatar: "https://i.pravatar.cc/150?img=9",
    lastMessage: {
      text: "Muito obrigada pela ajuda! 🌱",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h ago
      senderId: "user101",
      type: "text",
    },
    unreadCount: 0,
    online: false,
    pinned: false,
    muted: true,
    isFollowing: true,
  },
];

export const mockMessages: { [conversationId: string]: Message[] } = {
  "1": [
    {
      _id: 1,
      text: "Opa, viu as últimas fotos da minha plantação?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
      user: {
        _id: "user123",
        name: "João Silva",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
    },
    {
      _id: 2,
      text: "Ainda não! Manda aí",
      createdAt: new Date(Date.now() - 1000 * 60 * 4),
      user: {
        _id: "currentUser",
        name: "Você",
      },
    },
    {
      _id: 3,
      text: "Olha só como tá ficando",
      createdAt: new Date(Date.now() - 1000 * 60 * 3),
      user: {
        _id: "user123",
        name: "João Silva",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400",
    },
    {
      _id: 4,
      text: "Ficou massa demais! 🔥",
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      user: {
        _id: "currentUser",
        name: "Você",
      },
    },
  ],
  "2": [
    {
      _id: 5,
      text: "E aí, como faço pra controlar a umidade?",
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      user: {
        _id: "user456",
        name: "Maria Santos",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
    },
    {
      _id: 6,
      text: "Usa um higrômetro digital, é bem preciso",
      createdAt: new Date(Date.now() - 1000 * 60 * 45),
      user: {
        _id: "currentUser",
        name: "Você",
      },
    },
    {
      _id: 7,
      text: "E mantém entre 40-60% na fase vegetativa",
      createdAt: new Date(Date.now() - 1000 * 60 * 44),
      user: {
        _id: "currentUser",
        name: "Você",
      },
    },
    {
      _id: 8,
      text: "Valeu pelas dicas! Vou testar amanhã",
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      user: {
        _id: "user456",
        name: "Maria Santos",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
    },
  ],
};

// Simulate API delay
export const delay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));
