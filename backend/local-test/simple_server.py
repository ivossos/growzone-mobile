"""
Super Simple Chat Test Server - NO DATABASE NEEDED
Run: python3 simple_server.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

app = FastAPI(title="Growzone Chat Simple Test")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (resets when server restarts)
conversations_db = []
messages_db = []

# Test users
TEST_USERS = [
    {"id": 1, "username": "testuser1", "name": "Test User 1"},
    {"id": 2, "username": "testuser2", "name": "Test User 2"},
    {"id": 3, "username": "testuser3", "name": "Test User 3"},
]


class SendMessageRequest(BaseModel):
    recipient_id: int
    content_type: str = "text"
    text_content: Optional[str] = None


@app.get("/")
def root():
    return {
        "message": "🚀 Growzone Chat Simple Test Server",
        "status": "running",
        "database": "in-memory (no PostgreSQL needed)",
        "endpoints": {
            "docs": "http://localhost:8000/docs",
            "conversations": "http://localhost:8000/api/v1/chat/conversations",
            "send_message": "POST http://localhost:8000/api/v1/chat/messages"
        },
        "test_users": TEST_USERS,
        "stats": {
            "conversations": len(conversations_db),
            "messages": len(messages_db)
        }
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "database": "in-memory",
        "conversations": len(conversations_db),
        "messages": len(messages_db)
    }


@app.get("/api/v1/chat/conversations")
def get_conversations():
    """Get all conversations (mock - always for user 1)"""
    user_conversations = [
        conv for conv in conversations_db
        if 1 in [conv["participant1_id"], conv["participant2_id"]]
    ]

    return {
        "data": user_conversations,
        "total": len(user_conversations)
    }


@app.post("/api/v1/chat/messages")
def send_message(payload: SendMessageRequest):
    """Send a message (mock - always from user 1)"""
    sender_id = 1  # Mock: always user 1
    recipient_id = payload.recipient_id

    # Get or create conversation
    p1_id = min(sender_id, recipient_id)
    p2_id = max(sender_id, recipient_id)

    conversation = next(
        (c for c in conversations_db
         if c["participant1_id"] == p1_id and c["participant2_id"] == p2_id),
        None
    )

    if not conversation:
        conversation = {
            "id": str(uuid.uuid4()),
            "participant1_id": p1_id,
            "participant2_id": p2_id,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        conversations_db.append(conversation)

    # Create message
    message = {
        "id": str(uuid.uuid4()),
        "conversation_id": conversation["id"],
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "content_type": payload.content_type,
        "text_content": payload.text_content,
        "created_at": datetime.utcnow().isoformat(),
        "read_at": None
    }
    messages_db.append(message)

    # Update conversation
    conversation["updated_at"] = datetime.utcnow().isoformat()

    return message


@app.get("/api/v1/chat/conversations/{conversation_id}/messages")
def get_messages(conversation_id: str):
    """Get messages for a conversation"""
    messages = [
        msg for msg in messages_db
        if msg["conversation_id"] == conversation_id
    ]

    # Sort by created_at (newest first)
    messages.sort(key=lambda x: x["created_at"], reverse=True)

    return {
        "data": messages[:50],  # Limit to 50
        "total": len(messages)
    }


@app.post("/api/v1/chat/conversations/{conversation_id}/typing")
def send_typing_indicator(conversation_id: str, is_typing: bool = True):
    """Send typing indicator (mock - just return OK)"""
    return {
        "conversation_id": conversation_id,
        "is_typing": is_typing,
        "message": "Typing indicator received (mock)"
    }


@app.delete("/api/v1/reset")
def reset_database():
    """Reset all data (for testing)"""
    conversations_db.clear()
    messages_db.clear()
    return {
        "message": "Database reset successfully",
        "conversations": 0,
        "messages": 0
    }


if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Growzone Chat Simple Test Server")
    print("="*60)
    print("\n📍 Server starting at: http://localhost:8000")
    print("📖 API Docs at: http://localhost:8000/docs")
    print("\n✅ No database needed - all data in memory")
    print("⚠️  Data will be lost when server stops\n")
    print("="*60 + "\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)
