# 💬 Growzone Chat Backend

Backend completo para chat real-time com FastAPI + PostgreSQL + AWS Lambda WebSocket.

---

## 📁 Estrutura

```
backend/
├── migrations/           # SQL migrations para PostgreSQL
│   └── 001_chat_initial.sql
├── api/                  # FastAPI endpoints
│   ├── models/
│   │   └── chat.py      # Pydantic schemas
│   └── routers/
│       └── chat.py      # REST API routes
├── lambda/              # WebSocket Lambda functions
│   ├── connect.py       # Connection handler
│   ├── disconnect.py    # Disconnection handler
│   ├── send_message.py  # Message handler
│   ├── serverless.yml   # Serverless config
│   └── requirements.txt # Python dependencies
├── DEPLOYMENT_GUIDE.md  # Guia completo de deployment
└── README.md            # Este arquivo
```

---

## 🚀 Quick Start

### 1. Database Setup

```bash
# Conectar ao RDS PostgreSQL
psql -h your-rds-endpoint.region.rds.amazonaws.com -U admin -d growzone_db

# Executar migration
\i backend/migrations/001_chat_initial.sql
```

### 2. FastAPI Integration

No seu Social API existente, adicione:

```python
from backend.api.routers import chat

app.include_router(chat.router, prefix="/api/v1")
```

### 3. WebSocket Deploy

```bash
cd backend/lambda
serverless deploy --stage production
```

Salve a URL WebSocket retornada: `wss://abc123.execute-api.us-east-1.amazonaws.com/production`

### 4. Frontend Config

Atualize `app.json`:
```json
{
  "expo": {
    "extra": {
      "CHAT_API_URL": "https://dev.social.growzone.co/api/v1/chat",
      "CHAT_WS_URL": "wss://abc123.execute-api.us-east-1.amazonaws.com/production"
    }
  }
}
```

---

## 📚 Documentação Completa

Veja [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) para guia passo-a-passo completo.

---

## 🔌 Endpoints REST API

### Conversations
```http
GET    /api/v1/chat/conversations          # List conversations
POST   /api/v1/chat/conversations          # Create conversation
GET    /api/v1/chat/conversations/:id      # Get conversation
PATCH  /api/v1/chat/conversations/:id      # Update (pin/mute)
DELETE /api/v1/chat/conversations/:id      # Delete conversation
```

### Messages
```http
GET    /api/v1/chat/conversations/:id/messages  # List messages
POST   /api/v1/chat/messages                    # Send message
POST   /api/v1/chat/messages/read               # Mark as read
DELETE /api/v1/chat/messages/:id                # Delete message
GET    /api/v1/chat/unread-count                # Get unread count
```

### Media
```http
POST   /api/v1/chat/upload                      # Upload media
```

---

## ⚡ WebSocket Events

### Client → Server

```json
// Send message
{
  "action": "sendMessage",
  "data": {
    "recipientId": 123,
    "contentType": "text",
    "textContent": "Hello!"
  }
}

// Typing indicator
{
  "action": "typing",
  "data": {
    "conversationId": "uuid",
    "recipientId": 123,
    "isTyping": true
  }
}

// Mark as read
{
  "action": "markRead",
  "data": {
    "messageIds": ["uuid1", "uuid2"],
    "senderId": 123
  }
}
```

### Server → Client

```json
// New message received
{
  "type": "newMessage",
  "data": {
    "id": "uuid",
    "conversationId": "uuid",
    "senderId": 123,
    "textContent": "Hello!",
    "createdAt": "2025-10-20T..."
  }
}

// Message status update
{
  "type": "messageStatus",
  "data": {
    "messageIds": ["uuid"],
    "status": "read",
    "readAt": "2025-10-20T..."
  }
}

// Someone is typing
{
  "type": "typing",
  "data": {
    "conversationId": "uuid",
    "userId": 123,
    "isTyping": true
  }
}
```

---

## 🗄️ Database Schema

### conversations
- id (UUID, PK)
- participant1_id (INT, FK users)
- participant2_id (INT, FK users)
- created_at, updated_at, last_message_at
- Settings per user: pinned, muted, archived, deleted_at

### messages
- id (UUID, PK)
- conversation_id (UUID, FK conversations)
- sender_id, recipient_id (INT, FK users)
- content_type (text/image/video/audio)
- text_content, media_url, audio_duration
- reply_to_id (UUID, FK messages)
- Status: created_at, sent_at, delivered_at, read_at
- Soft delete: sender_deleted_at, recipient_deleted_at

### typing_indicators (optional)
- conversation_id, user_id
- started_at, expires_at

---

## 🔒 Segurança

- ✅ JWT authentication em todos os endpoints
- ✅ Authorization checks (user só acessa próprias conversas)
- ✅ S3 pre-signed URLs para media (expiram em 1 hora)
- ✅ Rate limiting (configurar API Gateway)
- ✅ Soft deletes (mensagens não são deletadas permanentemente)

---

## 💰 Custos Estimados

**1000 usuários ativos/dia:**
- RDS PostgreSQL: $30/mês
- Lambda WebSocket: $5/mês
- API Gateway: $3.50/mês
- DynamoDB: $2/mês
- S3: $0.25/mês
- **Total: ~$45/mês**

---

## 📊 Monitoring

### CloudWatch Logs
```bash
# Ver logs das Lambdas
serverless logs -f connect --tail
serverless logs -f sendMessage --tail

# Ver conexões ativas
aws dynamodb scan --table-name growzone-chat-websocket-connections-production
```

### Métricas Importantes
- Lambda invocations
- Lambda errors
- DynamoDB read/write units
- RDS CPU/connections
- WebSocket connection count

---

## 🧪 Testing

### Testar REST API
```bash
curl -X GET https://dev.social.growzone.co/api/v1/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Testar WebSocket
```bash
npm install -g wscat

wscat -c "wss://abc123.execute-api.us-east-1.amazonaws.com/production?token=YOUR_TOKEN"
> {"action": "ping"}
< {"type": "pong"}
```

---

## 🐛 Troubleshooting

### Lambda não conecta ao RDS
**Solução:** Adicionar Lambda à mesma VPC que RDS, configurar Security Group

### CORS error no S3
**Solução:** Aplicar configuração CORS no bucket

### WebSocket disconnect imediato
**Solução:** Verificar JWT token válido, JWT_SECRET correto

---

## 📝 TODO

- [ ] Pedir acesso ao RDS PostgreSQL
- [ ] Executar migrations
- [ ] Integrar chat router no FastAPI
- [ ] Deploy WebSocket (serverless deploy)
- [ ] Atualizar frontend com URLs reais
- [ ] Testar E2E

---

## 📞 Próximas Funcionalidades

- Voice/Video calls (Agora.io)
- Group chat
- Message reactions
- Message search
- End-to-end encryption
- Message editing
- Auto-delete messages

---

**Criado:** 20 de Outubro, 2025
**Tech Stack:** FastAPI + PostgreSQL + AWS Lambda + API Gateway WebSocket
**Documentação completa:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
