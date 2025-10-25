# 🧪 Growzone Chat - Local Test Environment

Quick local setup to test chat features without AWS deployment.

---

## 🚀 Quick Start (5 minutes)

### Step 1: Start Database

```bash
cd backend/local-test

# Start PostgreSQL with Docker
docker-compose up -d

# Check it's running
docker-compose ps

# Output should show:
# growzone-chat-db    Up    5432->5432
```

### Step 2: Install Python Dependencies

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Run FastAPI Server

```bash
# Start server
uvicorn main:app --reload --port 8000

# Output:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# ✅ Created 3 test users (IDs: 1, 2, 3)
```

### Step 4: Test the API

Open browser: **http://localhost:8000**

You'll see:
```json
{
  "message": "Growzone Chat Local Test Server",
  "status": "running",
  "test_users": [
    {"id": 1, "username": "testuser1"},
    {"id": 2, "username": "testuser2"},
    {"id": 3, "username": "testuser3"}
  ]
}
```

---

## 📖 API Documentation

Open: **http://localhost:8000/docs**

Interactive Swagger UI to test all endpoints.

---

## 🧪 Manual Testing

### 1. Send a Message

```bash
curl -X POST http://localhost:8000/api/v1/chat/messages \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": 2,
    "content_type": "text",
    "text_content": "Hello from User 1!"
  }'
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "conversation_id": "660e8400-e29b-41d4-a716-446655440001",
  "sender_id": 1,
  "recipient_id": 2,
  "content_type": "text",
  "text_content": "Hello from User 1!",
  "created_at": "2025-10-21T10:30:00"
}
```

### 2. Get Conversations

```bash
curl http://localhost:8000/api/v1/chat/conversations
```

**Response:**
```json
{
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "participant1_id": 1,
      "participant2_id": 2,
      "created_at": "2025-10-21T10:30:00",
      "updated_at": "2025-10-21T10:30:00"
    }
  ],
  "total": 1
}
```

### 3. Get Messages

```bash
# Use the conversation_id from step 2
curl http://localhost:8000/api/v1/chat/conversations/660e8400-e29b-41d4-a716-446655440001/messages
```

---

## 🔍 Database Access

### Via psql (Command Line)

```bash
# Connect to database
psql -h localhost -U growzone -d growzone_chat_test

# Password: growzone123

# List tables
\dt

# Query conversations
SELECT * FROM conversations;

# Query messages
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10;
```

### Via pgAdmin (Web UI)

1. Open: **http://localhost:5050**
2. Login:
   - Email: `admin@growzone.co`
   - Password: `admin123`
3. Add Server:
   - Host: `postgres` (or `host.docker.internal` on Mac)
   - Port: `5432`
   - User: `growzone`
   - Password: `growzone123`
   - Database: `growzone_chat_test`

---

## 🧹 Cleanup

### Stop Services

```bash
# Stop containers
docker-compose down

# Stop and remove volumes (delete all data)
docker-compose down -v
```

### Deactivate Python Environment

```bash
deactivate
```

---

## 🔧 Troubleshooting

### Database connection refused

```bash
# Check Docker is running
docker ps

# Restart containers
docker-compose restart
```

### Port 5432 already in use

If you have PostgreSQL installed locally:

```bash
# Stop local PostgreSQL
brew services stop postgresql@14

# Or change port in docker-compose.yml
ports:
  - "5433:5432"  # Use port 5433 instead

# Then update DATABASE_URL in main.py
DATABASE_URL = "postgresql://growzone:growzone123@localhost:5433/growzone_chat_test"
```

### Python dependencies error

```bash
# Upgrade pip
pip install --upgrade pip

# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## 📱 Connect Mobile App to Local Server

### Option 1: Using localhost (iOS Simulator)

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "CHAT_API_URL": "http://localhost:8000/api/v1/chat"
    }
  }
}
```

Run app:
```bash
npm run web:dev
# or
npx expo start
```

### Option 2: Using your machine's IP (Real Device)

Find your IP:
```bash
# Mac
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'

# Output: 192.168.1.100
```

Update `app.json`:
```json
{
  "expo": {
    "extra": {
      "CHAT_API_URL": "http://192.168.1.100:8000/api/v1/chat"
    }
  }
}
```

---

## ✅ Test Checklist

- [ ] Database starts successfully
- [ ] FastAPI server starts
- [ ] Can access http://localhost:8000
- [ ] Can send message via curl
- [ ] Can get conversations
- [ ] Can get messages
- [ ] Can access API docs at /docs
- [ ] Mobile app connects (optional)

---

## 🎯 What This Tests

✅ Database schema (tables, indexes, triggers)
✅ REST API endpoints
✅ Message sending/receiving
✅ Conversation creation
✅ User authentication (mocked)

❌ Not tested locally:
- WebSocket real-time messaging (needs Lambda)
- S3 media upload (needs AWS)
- Production authentication (uses mock)

---

## 📚 Next Steps

Once local testing works:

1. **Get AWS Access** - Contact infrastructure team
2. **Deploy to AWS** - Follow `DEPLOYMENT_AWS_COMPLETE.md`
3. **Connect Real Auth** - Replace mock authentication
4. **Add WebSocket** - Deploy Lambda functions
5. **Add S3 Upload** - Configure media storage

---

**Created:** 2025-10-21
**Purpose:** Local development and testing
**No AWS Required:** Perfect for offline development
