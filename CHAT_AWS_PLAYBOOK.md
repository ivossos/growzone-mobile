# 🚀 Chat Database Integration - AWS Playbook

**Growzone Mobile - Chat Backend Architecture for AWS**

Last Updated: 20 de Outubro, 2025

---

## 📋 Executive Summary

**Current State:**
- ✅ Frontend chat UI complete
- ✅ TypeScript interfaces defined
- ✅ Mock data working
- ❌ No backend persistence
- ❌ No real-time messaging

**Goal:** Build production-ready chat backend on AWS with real-time capabilities

---

## 🏗️ Architecture Overview

### Option A: **PostgreSQL + WebSocket (RECOMMENDED)**
**Best for:** Your existing stack (you already use PostgreSQL for auth/social)

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App                          │
│            (React Native + Expo)                        │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               │ HTTP/REST            │ WebSocket
               │                      │
┌──────────────▼──────────────────────▼───────────────────┐
│            AWS Application Load Balancer                │
│         (HTTPS Termination + Routing)                   │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
    ┌──────────▼────────┐  ┌─────────▼────────────┐
    │   ECS Fargate     │  │  API Gateway         │
    │  (REST API)       │  │  (WebSocket)         │
    │  FastAPI/Express  │  │                      │
    └───────┬───────────┘  └──────────┬───────────┘
            │                         │
            │                    ┌────▼──────┐
            │                    │  Lambda   │
            │                    │  (WS)     │
            │                    └────┬──────┘
            │                         │
    ┌───────▼─────────────────────────▼───────────┐
    │         Amazon RDS PostgreSQL               │
    │         (Multi-AZ for HA)                   │
    │                                             │
    │  Tables:                                    │
    │  - conversations                            │
    │  - messages                                 │
    │  - message_statuses                         │
    │  - typing_indicators                        │
    └───────────────────────────────────────────┬─┘
                                                │
                    ┌───────────────────────────▼─┐
                    │     Amazon S3              │
                    │  (Media Storage)           │
                    │  - Images                  │
                    │  - Videos                  │
                    │  - Audio files             │
                    └────────────────────────────┘
```

### Option B: **DynamoDB + AppSync**
**Best for:** Serverless-first, extreme scale (1M+ users)

```
┌─────────────────────────────────────────────────────────┐
│                     Mobile App                          │
└──────────────┬──────────────────────────────────────────┘
               │
               │ GraphQL + Real-time Subscriptions
               │
┌──────────────▼──────────────────────────────────────────┐
│                  AWS AppSync                            │
│       (Managed GraphQL + Real-time)                     │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────▼────────────┐
    │     DynamoDB          │
    │  (NoSQL Database)     │
    │                       │
    │  Tables:              │
    │  - Conversations      │
    │  - Messages           │
    │  Indexes:             │
    │  - UserConversations  │
    │  - ConversationMsgs   │
    └───────────────────────┘
```

---

## 🎯 Recommendation: **PostgreSQL + WebSocket**

### Why PostgreSQL over DynamoDB?

✅ **Consistency with Existing Stack**
- You already use PostgreSQL for auth/social
- Reuse existing database instance
- Same ORM/queries patterns
- Lower operational complexity

✅ **Cost-Effective for Your Scale**
- DynamoDB costs more at moderate scale
- RDS reserved instances = predictable costs
- One database to manage

✅ **ACID Transactions**
- Guaranteed message ordering
- Prevent duplicate messages
- Atomic conversation + message creation

✅ **Complex Queries**
- Search messages by content
- Filter conversations
- Analytics and reporting

❌ **When NOT to use PostgreSQL:**
- If you expect 10M+ messages/day
- If you need multi-region active-active
- If budget is unlimited

---

## 📊 Database Schema (PostgreSQL)

### Table: `conversations`
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant1_id INTEGER NOT NULL REFERENCES users(id),
    participant2_id INTEGER NOT NULL REFERENCES users(id),
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

CREATE UNIQUE INDEX idx_conversation_participants
ON conversations(participant1_id, participant2_id);

CREATE INDEX idx_conversation_p1_updated
ON conversations(participant1_id, updated_at DESC);

CREATE INDEX idx_conversation_p2_updated
ON conversations(participant2_id, updated_at DESC);
```

### Table: `messages`
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),

    -- Content
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'audio', 'file')),
    text_content TEXT,
    media_url TEXT,
    audio_duration INTEGER, -- seconds

    -- Reply feature
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Status tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
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

CREATE INDEX idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);

CREATE INDEX idx_messages_sender
ON messages(sender_id, created_at DESC);

CREATE INDEX idx_messages_recipient_unread
ON messages(recipient_id, read_at) WHERE read_at IS NULL;
```

### Table: `typing_indicators` (Optional - can use Redis instead)
```sql
CREATE TABLE typing_indicators (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_typing_expires ON typing_indicators(expires_at);
```

---

## 🔄 Real-Time Strategy

### Approach 1: **API Gateway WebSocket + Lambda** (RECOMMENDED)

**Pros:**
- Serverless (pay per message)
- Scales automatically
- Easy to manage

**Cons:**
- 10-minute connection limit (need reconnect)
- Cold starts on Lambda

**Architecture:**
```
Client → API Gateway (WebSocket) → Lambda → RDS PostgreSQL
                                 ↓
                           DynamoDB (Connections Table)
```

**Connection Management:**
```sql
-- Store in DynamoDB for fast lookup
Table: ws_connections
- connectionId (PK)
- userId (GSI)
- connectedAt
- lastPingAt
```

### Approach 2: **ECS Fargate with Socket.io**

**Pros:**
- No connection time limits
- Lower latency
- More control

**Cons:**
- More expensive (always running)
- Need to manage scaling

**Architecture:**
```
Client → ALB → ECS Fargate (Node.js + Socket.io) → RDS PostgreSQL
                                                  ↓
                                            Redis ElastiCache
```

---

## 📝 API Endpoints Design

### REST API (for persistence)

```typescript
// Base URL: https://api.growzone.co/v1/chat

// Conversations
GET    /chat/conversations              // List all conversations
POST   /chat/conversations              // Create new conversation
GET    /chat/conversations/:id          // Get conversation details
PATCH  /chat/conversations/:id          // Update (pin/mute/archive)
DELETE /chat/conversations/:id          // Delete conversation

// Messages
GET    /chat/conversations/:id/messages // List messages (paginated)
POST   /chat/messages                   // Send message
GET    /chat/messages/:id               // Get message
DELETE /chat/messages/:id               // Delete message
POST   /chat/messages/:id/read          // Mark as read

// Bulk operations
POST   /chat/messages/read              // Mark multiple as read

// Media
POST   /chat/upload                     // Upload media (returns S3 URL)
```

### WebSocket Events

```typescript
// Client → Server
{
  "action": "sendMessage",
  "data": {
    "conversationId": "uuid",
    "contentType": "text",
    "textContent": "Hello!",
    "replyToId": "uuid" // optional
  }
}

{
  "action": "typing",
  "data": {
    "conversationId": "uuid",
    "isTyping": true
  }
}

{
  "action": "markRead",
  "data": {
    "messageIds": ["uuid1", "uuid2"]
  }
}

// Server → Client
{
  "type": "newMessage",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "sender": { ... },
    "textContent": "Hello!",
    "createdAt": "2025-10-20T..."
  }
}

{
  "type": "messageStatus",
  "data": {
    "messageId": "uuid",
    "status": "delivered" | "read"
  }
}

{
  "type": "typing",
  "data": {
    "conversationId": "uuid",
    "userId": 123,
    "isTyping": true
  }
}

{
  "type": "userOnline",
  "data": {
    "userId": 123,
    "online": true,
    "lastSeen": "2025-10-20T..."
  }
}
```

---

## 💰 Cost Estimation (AWS)

### Small Scale (1000 active users, 10K messages/day)

**PostgreSQL (RDS)**
- db.t4g.micro (Multi-AZ): $30/month
- 20GB storage: $5/month
- **Total: $35/month**

**WebSocket (API Gateway + Lambda)**
- 1M messages/month: $3.50
- Lambda execution: $5/month
- **Total: $8.50/month**

**S3 (Media Storage)**
- 10GB storage: $0.23/month
- Data transfer: $5/month
- **Total: $5.23/month**

**CloudWatch Logs:** $5/month

**Grand Total: ~$54/month**

### Medium Scale (10K active users, 100K messages/day)

**PostgreSQL (RDS)**
- db.t4g.small (Multi-AZ): $60/month
- 50GB storage: $12/month
- **Total: $72/month**

**WebSocket:** $35/month
**S3:** $15/month
**CloudWatch:** $10/month

**Grand Total: ~$132/month**

---

## 🚀 Implementation Phases

### Phase 1: Database Setup (Week 1)
- [x] Choose PostgreSQL
- [ ] Create RDS instance
- [ ] Run migrations (create tables)
- [ ] Set up connection pooling
- [ ] Configure backups

### Phase 2: REST API (Week 2)
- [ ] Implement conversation CRUD
- [ ] Implement message CRUD
- [ ] Add pagination
- [ ] Add media upload to S3
- [ ] Write API tests

### Phase 3: WebSocket (Week 3)
- [ ] Set up API Gateway WebSocket
- [ ] Implement connection management
- [ ] Implement real-time message delivery
- [ ] Add typing indicators
- [ ] Add online status

### Phase 4: Frontend Integration (Week 4)
- [ ] Connect to real API
- [ ] Replace mock data
- [ ] Implement retry logic
- [ ] Add offline support
- [ ] E2E testing

### Phase 5: Production Hardening (Week 5)
- [ ] Set up monitoring (CloudWatch)
- [ ] Add error tracking (Sentry)
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation

---

## 🔒 Security Considerations

### Authentication
```typescript
// JWT token validation in Lambda
const token = event.headers.Authorization;
const user = await verifyToken(token);
if (!user) return { statusCode: 401 };
```

### Authorization
```typescript
// Ensure user can only access their conversations
const conversation = await getConversation(conversationId);
if (conversation.participant1_id !== userId &&
    conversation.participant2_id !== userId) {
  return { statusCode: 403 };
}
```

### Data Protection
- Encrypt at rest (RDS encryption enabled)
- Encrypt in transit (TLS 1.3)
- Media URLs with pre-signed S3 links (expire in 1 hour)
- Rate limiting (prevent spam)

---

## 📈 Scaling Strategy

### When to Scale Up:

**Database:**
- 1K users: db.t4g.micro
- 10K users: db.t4g.small
- 100K users: db.m6g.large
- 1M+ users: Aurora PostgreSQL with read replicas

**WebSocket:**
- API Gateway scales automatically
- Lambda concurrent executions: 1000 default (request increase)

**Caching:**
- Add Redis ElastiCache for:
  - Connection state
  - Typing indicators
  - Online status
  - Recent messages

---

## 🧪 Testing Strategy

### Unit Tests
- Message creation
- Conversation logic
- Status updates

### Integration Tests
- REST API endpoints
- WebSocket connections
- Database queries

### Load Tests
```bash
# Use Artillery or k6
artillery run chat-load-test.yml

scenarios:
  - duration: 60
    arrivalRate: 100  # 100 users/sec
    name: "Send messages"
```

### E2E Tests
- User A sends message → User B receives
- Message status updates
- Typing indicators
- Offline message delivery

---

## 🚨 Monitoring & Alerts

### Key Metrics

**Database:**
- Connection count
- Query latency (p95, p99)
- CPU utilization
- Storage usage

**WebSocket:**
- Active connections
- Message delivery latency
- Failed deliveries
- Connection errors

**Application:**
- API response time
- Error rate
- Lambda cold starts
- S3 upload failures

### Alerts
```yaml
- Database CPU > 80% for 5 min → Page on-call
- Message delivery latency > 500ms → Slack alert
- Error rate > 1% → Slack alert
- WebSocket connections > 10K → Email alert
```

---

## 🎬 Quick Start Guide

### Step 1: Create RDS Instance
```bash
aws rds create-db-instance \
  --db-instance-identifier growzone-chat-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password [SECURE_PASSWORD] \
  --allocated-storage 20 \
  --multi-az
```

### Step 2: Run Migrations
```bash
# Using Prisma or TypeORM
npx prisma migrate deploy

# Or raw SQL
psql -h growzone-chat-db.xxx.rds.amazonaws.com \
     -U admin -d postgres -f migrations/001_initial.sql
```

### Step 3: Deploy Lambda Functions
```bash
# Using Serverless Framework
serverless deploy --stage production

# Or AWS SAM
sam build && sam deploy --guided
```

### Step 4: Update Frontend
```typescript
// src/lib/chat-config.ts
export const CHAT_API_URL = process.env.CHAT_API_URL;
export const CHAT_WS_URL = process.env.CHAT_WS_URL;
```

---

## 📚 Resources

### AWS Documentation
- [RDS PostgreSQL](https://docs.aws.amazon.com/rds/latest/userguide/CHAP_PostgreSQL.html)
- [API Gateway WebSocket](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-websocket-api.html)
- [Lambda Functions](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)

### Libraries
- **Backend:** FastAPI (Python) or Express (Node.js)
- **ORM:** Prisma or TypeORM
- **WebSocket:** ws (Node.js) or websockets (Python)
- **Testing:** Jest + Artillery

### Example Projects
- [AWS Chat App Sample](https://github.com/aws-samples/serverless-chat-app)
- [Socket.io + PostgreSQL](https://github.com/socketio/socket.io-postgres-adapter)

---

## ❓ FAQ

**Q: Should I use AppSync instead?**
A: Only if you want pure serverless and GraphQL. PostgreSQL + REST is simpler for your stack.

**Q: How do I handle message delivery to offline users?**
A: Store messages in DB. When user reconnects, fetch missed messages via REST API.

**Q: What about message encryption?**
A: Implement E2E encryption client-side. AWS KMS for server-side encryption at rest.

**Q: How do I prevent duplicate messages?**
A: Use idempotency keys. Client sends UUID with each message.

**Q: Can I use the same RDS instance for chat and social data?**
A: Yes! Create separate database/schema. Share infrastructure, isolate data.

---

## ✅ Next Steps

1. Review this playbook
2. Confirm PostgreSQL approach
3. Set up AWS account/credentials
4. Create development RDS instance
5. Start Phase 1 implementation

**Questions? Let's discuss before we start building!**
