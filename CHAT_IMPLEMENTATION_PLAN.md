# 🚀 Chat Implementation Plan - Growzone

**Using Existing AWS Production Infrastructure**

Last Updated: 20 de Outubro, 2025

---

## 📋 Current Infrastructure

You already have:
- ✅ AWS Production Account
- ✅ Auth API: `https://dev.auth.growzone.co/api/v1`
- ✅ Social API: `https://dev.social.growzone.co/api/v1`
- ✅ PostgreSQL RDS (assumed for auth/social)
- ✅ User authentication system

---

## 🎯 Implementation Strategy

### Option A: **Use Existing Social API Backend** (RECOMMENDED)
**Add chat endpoints to your existing `social.growzone.co` service**

**Pros:**
- ✅ Reuse existing RDS PostgreSQL instance
- ✅ Reuse existing authentication
- ✅ No new infrastructure needed
- ✅ Cheaper (no additional RDS costs)
- ✅ Faster to deploy

**Cons:**
- ⚠️ Chat and social share same database
- ⚠️ Need to ensure proper scaling

**Architecture:**
```
Mobile App
    ↓
https://dev.social.growzone.co/api/v1/chat/*
    ↓
Existing Backend (FastAPI/Express/Django?)
    ↓
Existing PostgreSQL RDS
```

### Option B: **Separate Chat Service**
**Create new `chat.growzone.co` microservice**

**Pros:**
- ✅ Isolated chat infrastructure
- ✅ Independent scaling
- ✅ Better for future growth

**Cons:**
- ❌ More expensive (new RDS instance)
- ❌ More complex deployment
- ❌ Need to share auth between services

---

## 🏆 **Recommendation: Option A - Extend Social API**

For your current scale (1K-10K users), extending the social API is the best choice.

---

## 📝 Step-by-Step Implementation

### Phase 1: Database Migration (Day 1-2)

#### Step 1.1: Create Migration File

```sql
-- migrations/chat_001_initial.sql

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE,

    -- Participant 1 settings
    participant1_pinned BOOLEAN DEFAULT FALSE,
    participant1_muted BOOLEAN DEFAULT FALSE,
    participant1_archived BOOLEAN DEFAULT FALSE,
    participant1_deleted_at TIMESTAMP WITH TIME ZONE,

    -- Participant 2 settings
    participant2_pinned BOOLEAN DEFAULT FALSE,
    participant2_muted BOOLEAN DEFAULT FALSE,
    participant2_archived BOOLEAN DEFAULT FALSE,
    participant2_deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT different_participants CHECK (participant1_id != participant2_id),
    CONSTRAINT ordered_participants CHECK (participant1_id < participant2_id)
);

-- Indexes for conversations
CREATE UNIQUE INDEX idx_conversation_participants
ON conversations(participant1_id, participant2_id);

CREATE INDEX idx_conversation_p1_updated
ON conversations(participant1_id, updated_at DESC)
WHERE participant1_deleted_at IS NULL;

CREATE INDEX idx_conversation_p2_updated
ON conversations(participant2_id, updated_at DESC)
WHERE participant2_deleted_at IS NULL;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'audio')),
    text_content TEXT,
    media_url TEXT,
    media_thumbnail_url TEXT,
    audio_duration INTEGER, -- seconds

    -- Reply feature
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Status tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Soft delete
    sender_deleted_at TIMESTAMP WITH TIME ZONE,
    recipient_deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_content CHECK (
        (content_type = 'text' AND text_content IS NOT NULL) OR
        (content_type != 'text' AND media_url IS NOT NULL)
    )
);

-- Indexes for messages
CREATE INDEX idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_messages_sender
ON messages(sender_id, created_at DESC);

CREATE INDEX idx_messages_recipient_unread
ON messages(recipient_id, read_at)
WHERE read_at IS NULL AND recipient_deleted_at IS NULL;

-- Function to update conversation timestamp
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        updated_at = NOW(),
        last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update conversation on new message
CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

-- Indexes for performance
CREATE INDEX idx_messages_conversation_unread
ON messages(conversation_id, read_at)
WHERE read_at IS NULL;
```

#### Step 1.2: Run Migration

```bash
# Connect to your RDS instance
psql -h your-rds-instance.region.rds.amazonaws.com \
     -U postgres \
     -d growzone_db \
     -f migrations/chat_001_initial.sql

# Or using your existing migration tool
# Alembic (Python):
alembic revision --autogenerate -m "Add chat tables"
alembic upgrade head

# Prisma (Node.js):
npx prisma migrate dev --name add-chat-tables

# TypeORM (Node.js):
npm run migration:run
```

---

### Phase 2: Backend API Endpoints (Day 3-5)

#### Step 2.1: Add Chat Routes

**If using FastAPI (Python):**
```python
# app/routers/chat.py

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from uuid import UUID
from datetime import datetime

router = APIRouter(prefix="/chat", tags=["chat"])

# Get conversations
@router.get("/conversations")
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for current user"""
    conversations = db.query(Conversation).filter(
        or_(
            and_(
                Conversation.participant1_id == current_user.id,
                Conversation.participant1_deleted_at == None
            ),
            and_(
                Conversation.participant2_id == current_user.id,
                Conversation.participant2_deleted_at == None
            )
        )
    ).order_by(Conversation.updated_at.desc()).all()

    return {"data": conversations}

# Get messages
@router.get("/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: UUID,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages for a conversation"""
    # Verify user is participant
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        or_(
            Conversation.participant1_id == current_user.id,
            Conversation.participant2_id == current_user.id
        )
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id,
        or_(
            and_(
                Message.sender_id == current_user.id,
                Message.sender_deleted_at == None
            ),
            and_(
                Message.recipient_id == current_user.id,
                Message.recipient_deleted_at == None
            )
        )
    ).order_by(Message.created_at.desc()).limit(limit).offset(offset).all()

    return {"data": messages}

# Send message
@router.post("/messages")
async def send_message(
    payload: SendMessagePayload,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a new message"""
    # Get or create conversation
    conversation = get_or_create_conversation(
        db,
        current_user.id,
        payload.recipient_id
    )

    # Create message
    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        recipient_id=payload.recipient_id,
        content_type=payload.content_type,
        text_content=payload.text_content,
        media_url=payload.media_url,
        reply_to_id=payload.reply_to_id
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    # Send WebSocket notification (if connected)
    await send_websocket_notification(payload.recipient_id, {
        "type": "newMessage",
        "data": message.to_dict()
    })

    return {"data": message}

# Mark as read
@router.post("/conversations/{conversation_id}/read")
async def mark_as_read(
    conversation_id: UUID,
    message_ids: List[UUID],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark messages as read"""
    db.query(Message).filter(
        Message.id.in_(message_ids),
        Message.conversation_id == conversation_id,
        Message.recipient_id == current_user.id
    ).update({"read_at": datetime.utcnow()})

    db.commit()

    return {"success": True}

# Upload media
@router.post("/upload")
async def upload_media(
    file: UploadFile,
    current_user: User = Depends(get_current_user)
):
    """Upload media to S3"""
    # Upload to S3
    file_key = f"chat/{current_user.id}/{uuid4()}/{file.filename}"
    s3_client.upload_fileobj(file.file, BUCKET_NAME, file_key)

    # Generate URL
    url = f"https://{BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{file_key}"

    return {"data": {"url": url}}
```

**If using Express (Node.js):**
```typescript
// routes/chat.ts

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { ChatController } from '../controllers/chat';

const router = Router();
const chatController = new ChatController();

// All routes require authentication
router.use(authMiddleware);

router.get('/conversations', chatController.getConversations);
router.post('/conversations', chatController.createConversation);
router.get('/conversations/:id/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.post('/conversations/:id/read', chatController.markAsRead);
router.post('/upload', chatController.uploadMedia);

export default router;
```

#### Step 2.2: Add to Main App

```python
# main.py (FastAPI)
from app.routers import chat

app.include_router(chat.router, prefix="/api/v1")
```

```typescript
// app.ts (Express)
import chatRoutes from './routes/chat';

app.use('/api/v1/chat', chatRoutes);
```

---

### Phase 3: WebSocket Setup (Day 6-8)

#### Step 3.1: Create API Gateway WebSocket

```bash
# Use AWS Console or CLI
aws apigatewayv2 create-api \
  --name growzone-chat-ws \
  --protocol-type WEBSOCKET \
  --route-selection-expression '$request.body.action'
```

#### Step 3.2: Create Lambda Functions

**Connection Handler:**
```python
# lambda/connect.py

import json
import boto3

dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table('chat_connections')

def handler(event, context):
    connection_id = event['requestContext']['connectionId']

    # Get user from JWT token
    token = event['queryStringParameters'].get('token')
    user = verify_jwt(token)

    if not user:
        return {'statusCode': 401}

    # Store connection
    connections_table.put_item(Item={
        'connectionId': connection_id,
        'userId': user['id'],
        'connectedAt': datetime.utcnow().isoformat()
    })

    return {'statusCode': 200}
```

**Message Handler:**
```python
# lambda/send_message.py

def handler(event, context):
    connection_id = event['requestContext']['connectionId']
    body = json.loads(event['body'])
    action = body['action']

    if action == 'sendMessage':
        # Save to database
        message = save_message_to_db(body['data'])

        # Send to recipient via WebSocket
        recipient_connections = get_user_connections(message.recipient_id)
        for conn in recipient_connections:
            send_to_connection(conn['connectionId'], {
                'type': 'newMessage',
                'data': message
            })

    return {'statusCode': 200}
```

---

### Phase 4: Frontend Integration (Day 9-10)

#### Step 4.1: Update API Configuration

```typescript
// src/lib/chat-config.ts

export const CHAT_API_URL = process.env.CHAT_API_URL ||
  'https://dev.social.growzone.co/api/v1/chat';

export const CHAT_WS_URL = process.env.CHAT_WS_URL ||
  'wss://xxx.execute-api.us-east-1.amazonaws.com/production';
```

#### Step 4.2: Create WebSocket Hook

```typescript
// src/hooks/useWebSocket.ts

import { useEffect, useRef, useState } from 'react';
import { storageGetAuthToken } from '@/storage/storage-auth-token';

export function useWebSocket() {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    async function connect() {
      const { access_token } = await storageGetAuthToken();

      ws.current = new WebSocket(
        `${CHAT_WS_URL}?token=${access_token}`
      );

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleWebSocketMessage(message);
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connect, 3000);
      };
    }

    connect();

    return () => {
      ws.current?.close();
    };
  }, []);

  const sendMessage = (action: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ action, data }));
    }
  };

  return { isConnected, sendMessage };
}
```

#### Step 4.3: Update Chat API to Use Real Backend

```typescript
// src/api/chat/chat-api.ts

import { socialApi } from "@/lib/axios";
import { CHAT_API_URL } from "@/lib/chat-config";

// Update all functions to use real API
export async function getConversations(): Promise<Conversation[]> {
  const response = await socialApi.get(`/chat/conversations`);
  return response.data.data;
}

export async function getMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<Message[]> {
  const response = await socialApi.get(
    `/chat/conversations/${conversationId}/messages`,
    { params: { limit, offset } }
  );
  return response.data.data;
}

// ... rest of functions
```

---

### Phase 5: Testing (Day 11-12)

#### Step 5.1: Test REST API

```bash
# Get conversations
curl -X GET https://dev.social.growzone.co/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"

# Send message
curl -X POST https://dev.social.growzone.co/api/v1/chat/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipientId": "123",
    "contentType": "text",
    "textContent": "Hello!"
  }'
```

#### Step 5.2: Test WebSocket

```javascript
// Test in browser console
const ws = new WebSocket('wss://xxx.execute-api.us-east-1.amazonaws.com/production?token=YOUR_TOKEN');

ws.onopen = () => {
  ws.send(JSON.stringify({
    action: 'sendMessage',
    data: {
      recipientId: '123',
      contentType: 'text',
      textContent: 'Test message'
    }
  }));
};

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};
```

---

## 🚀 Quick Start Checklist

### Week 1: Backend Setup
- [ ] Access your AWS RDS PostgreSQL instance
- [ ] Run chat database migrations
- [ ] Add chat routes to existing social API
- [ ] Test endpoints with Postman/curl
- [ ] Deploy updated backend

### Week 2: WebSocket Setup
- [ ] Create API Gateway WebSocket
- [ ] Create DynamoDB table for connections
- [ ] Deploy Lambda functions (connect, disconnect, sendMessage)
- [ ] Test WebSocket connections
- [ ] Set up CloudWatch logs

### Week 3: Frontend Integration
- [ ] Update chat API to call real backend
- [ ] Implement WebSocket hook
- [ ] Remove mock data
- [ ] Add error handling and retry logic
- [ ] Test E2E chat flow

---

## 💡 Next Steps

1. **Confirm your backend tech stack** - What's your social API built with? (FastAPI/Express/Django/Laravel?)
2. **Get RDS connection details** - I'll help you run the migrations
3. **Start Phase 1** - Database migration first

**Ready to start? Which backend framework are you using?**
