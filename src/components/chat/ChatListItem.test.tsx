import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatListItem } from './ChatListItem';
import { Conversation } from '@/api/@types/chat';

const mockConversation: Conversation = {
  id: '1',
  userId: 'user123',
  userName: 'João Silva',
  userAvatar: 'https://i.pravatar.cc/150?img=1',
  lastMessage: {
    text: 'Opa, viu as últimas fotos?',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    senderId: 'user123',
    type: 'text' as const,
  },
  unreadCount: 2,
  online: true,
  pinned: false,
  muted: false,
  isFollowing: true,
};

describe('ChatListItem', () => {
  it('renders conversation data correctly', () => {
    const { getByText } = render(
      <ChatListItem conversation={mockConversation} onPress={() => {}} />
    );

    expect(getByText('João Silva')).toBeDefined();
    expect(getByText('Opa, viu as últimas fotos?')).toBeDefined();
    expect(getByText('2')).toBeDefined();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ChatListItem conversation={mockConversation} onPress={onPressMock} />
    );

    fireEvent.press(getByText('João Silva'));
    expect(onPressMock).toHaveBeenCalled();
  });

  it('shows typing indicator when user is typing', () => {
    const typingConversation = {
      ...mockConversation,
      typing: true,
    };
    const { getByText } = render(
      <ChatListItem conversation={typingConversation} onPress={() => {}} />
    );

    expect(getByText('digitando...')).toBeDefined();
  });
});
