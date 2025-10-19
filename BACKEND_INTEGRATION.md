# Chat Backend Integration Guide

Complete guide for integrating the chat UI with your backend API.

---

## 📋 Overview

The chat feature now has complete backend integration ready with:
- ✅ REST API service
- ✅ WebSocket for real-time messaging
- ✅ Custom React hooks
- ✅ Updated screens (ready to use)

---

## 🗂️ New Files Created

### API Services
- **`src/api/chat/chat-api.ts`** - REST API functions
- **`src/lib/socket.ts`** - WebSocket service

### React Hooks
- **`src/hooks/useChat.ts`** - Custom hooks for managing chat state

### Updated Screens (Backend-ready)
- **`src/app/(drawer)/chat/index-with-api.tsx`** - Chat list with real API
- **`src/app/(drawer)/chat/[id]-with-api.tsx`** - Conversation with real API

### Context Updates
- **`src/context/auth-context.tsx`** - Added `useAuth()` hook export

---

## 🔧 Backend Requirements

Your backend API needs to provide these endpoints:

### REST API Endpoints

#### 1. Get Conversations
```
GET /api/v1/chat/conversations
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "id": "string",
      "userId": "string",
      "userName": "string",
      "userAvatar": "string",
      "lastMessage": {
        "text": "string",
        "createdAt": "ISO8601",
        "senderId": "string",
        "type": "text" | "audio" | "image" | "video"
      },
      "unreadCount": number,
      "online": boolean,
      "pinned": boolean,
      "muted": boolean
    }
  ],
  "success": true
}
```

#### 2. Get Messages
```
GET /api/v1/chat/conversations/{conversationId}/messages?limit=50&offset=0
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "_id": "string | number",
      "text": "string",
      "createdAt": "ISO8601",
      "user": {
        "_id": "string",
        "name": "string",
        "avatar": "string"
      },
      "image": "string (optional)",
      "audio": {
        "uri": "string",
        "duration": number
      } (optional),
      "read": boolean,
      "sent": boolean
    }
  ],
  "success": true
}
```

#### 3. Send Message
```
POST /api/v1/chat/messages
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "conversationId": "string",
  "recipientId": "string",
  "text": "string",
  "image": "string (optional)",
  "audio": { "uri": "string", "duration": number } (optional),
  "replyToId": "string (optional)"
}

Response:
{
  "data": {
    "_id": "string",
    "text": "string",
    "createdAt": "ISO8601",
    "user": { ... },
    "sent": true
  },
  "success": true
}
```

#### 4. Mark as Read
```
POST /api/v1/chat/conversations/{conversationId}/read
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "message_ids": ["string" | number]
}
```

#### 5. Typing Indicator
```
POST /api/v1/chat/conversations/{conversationId}/typing
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "is_typing": boolean
}
```

#### 6. Upload Media
```
POST /api/v1/chat/upload
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: FormData with file

Response:
{
  "data": {
    "url": "string"
  },
  "success": true
}
```

### WebSocket Endpoint

```
wss://dev.social.growzone.co/ws/chat?token={access_token}
```

#### WebSocket Message Format

**Incoming messages:**
```json
{
  "type": "message" | "typing" | "online_status",
  "payload": {
    // For "message" type:
    "_id": "string",
    "text": "string",
    "user": { ... },
    ...

    // For "typing" type:
    "conversationId": "string",
    "userId": "string",
    "isTyping": boolean

    // For "online_status" type:
    "userId": "string",
    "online": boolean,
    "lastSeen": "ISO8601"
  }
}
```

**Outgoing messages:**
```json
{
  "type": "typing",
  "payload": {
    "conversationId": "string",
    "isTyping": boolean
  }
}
```

---

## 🚀 How to Enable Backend Integration

### Step 1: Update Configuration

Edit `src/lib/socket.ts` line 189:
```typescript
// Update to your WebSocket URL
const WS_URL = "wss://YOUR_BACKEND_URL/ws/chat";
```

### Step 2: Replace Mock Screens with API Screens

```bash
# Backup current mock screens
mv src/app/\(drawer\)/chat/index.tsx src/app/\(drawer\)/chat/index-mock.tsx
mv src/app/\(drawer\)/chat/\[id\].tsx src/app/\(drawer\)/chat/\[id\]-mock.tsx

# Enable API screens
mv src/app/\(drawer\)/chat/index-with-api.tsx src/app/\(drawer\)/chat/index.tsx
mv src/app/\(drawer\)/chat/\[id\]-with-api.tsx src/app/\(drawer\)/chat/\[id\].tsx
```

### Step 3: Test the Integration

```bash
npm run web
# or
npm run ios
# or
npm run android
```

---

## 📖 Usage Examples

### Using the Chat Hooks

```typescript
import { useConversations, useConversation } from "@/hooks/useChat";

// In Chat List Screen
function ChatList() {
  const { conversations, loading, error, refresh } = useConversations();

  return (
    <FlatList
      data={conversations}
      onRefresh={refresh}
      refreshing={loading}
    />
  );
}

// In Conversation Screen
function Conversation({ id }) {
  const {
    messages,
    isTyping,
    sendMessage,
    setTyping,
    markMessagesAsRead,
  } = useConversation(id);

  const handleSend = async (text) => {
    await sendMessage(text);
  };

  return <Chat messages={messages} onSend={handleSend} />;
}
```

### Using the API Service Directly

```typescript
import {
  getConversations,
  sendMessage,
  uploadMedia
} from "@/api/chat/chat-api";

// Get conversations
const conversations = await getConversations();

// Send text message
await sendMessage({
  conversationId: "123",
  recipientId: "user456",
  text: "Hello!",
});

// Upload and send image
const formData = new FormData();
formData.append('file', imageFile);
const { url } = await uploadMedia(formData);

await sendMessage({
  conversationId: "123",
  recipientId: "user456",
  image: url,
});
```

### Using WebSocket

```typescript
import { chatSocket } from "@/lib/socket";

// Connect (automatically done in useConversations hook)
chatSocket.connect(accessToken);

// Listen for messages
const unsubscribe = chatSocket.onMessage((message) => {
  console.log("New message:", message);
});

// Send typing indicator
chatSocket.sendTyping("conversationId", true);

// Cleanup
unsubscribe();
chatSocket.disconnect();
```

---

## 🔐 Authentication

The API automatically includes the auth token from `AuthContext`:

1. User signs in → token stored
2. API requests include: `Authorization: Bearer {token}`
3. WebSocket connects with: `?token={token}`
4. Token refresh handled automatically by axios interceptor

---

## ⚠️ Important Notes

### API Endpoints
- Update `AUTH_API_URL` and `SOCIAL_API_URL` in `app.config.js`
- Default: `https://dev.social.growzone.co/api/v1`

### WebSocket URL
- Update in `src/lib/socket.ts`
- Default: `wss://dev.social.growzone.co/ws/chat`

### Error Handling
- API errors are caught and displayed to users
- Network errors trigger retry options
- WebSocket reconnects automatically (max 5 attempts)

### Data Persistence
- Messages loaded from API
- No local caching (yet)
- Pull-to-refresh available

---

## 🧪 Testing Backend Integration

### 1. Test with Mock Data (Current)
```bash
# Uses mock data from src/api/chat/mock-data.ts
# No backend required
npm run web
```

### 2. Test with Real API
```bash
# After replacing screen files
# Requires backend running
npm run web
```

### 3. Test WebSocket
```bash
# Open multiple devices/browsers
# Send messages between them
# Check real-time updates
```

---

## 📝 TODO: Implement in Backend

If you're building the backend, implement:

- [ ] `/chat/conversations` endpoint
- [ ] `/chat/conversations/{id}/messages` endpoint
- [ ] `/chat/messages` POST endpoint
- [ ] `/chat/upload` for media
- [ ] WebSocket server at `/ws/chat`
- [ ] Message delivery/read receipts
- [ ] Online status tracking
- [ ] Typing indicators
- [ ] Push notifications

---

## 🎯 Next Steps

1. **Set up backend endpoints** (use the specs above)
2. **Update WebSocket URL** in `src/lib/socket.ts`
3. **Replace screen files** to enable API
4. **Test with real backend**
5. **Implement media upload** (image/audio)
6. **Add push notifications**
7. **Implement message search**

---

## 🆘 Troubleshooting

### "401 Unauthorized"
- Check if user is signed in
- Verify token is valid
- Check API URL in config

### "WebSocket won't connect"
- Verify WebSocket URL
- Check token format
- Ensure backend supports WebSocket

### "Messages not real-time"
- Check WebSocket connection status
- Verify message format matches backend
- Check browser console for errors

### "Images not uploading"
- Implement `/chat/upload` endpoint
- Check file size limits
- Verify multipart/form-data support

---

## 📚 Resources

- React Native WebSocket: https://reactnative.dev/docs/network
- Axios Interceptors: https://axios-http.com/docs/interceptors
- React Hooks: https://react.dev/reference/react

---

**Status: ✅ Backend Integration Ready**

All code is complete. Just update URLs and enable the API screens!
