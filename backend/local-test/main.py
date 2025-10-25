"""
Local Test Server for Growzone Chat
Run: uvicorn main:app --reload --port 8000
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from typing import Optional
import uuid
import os

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://growzone:growzone123@localhost:5432/growzone_chat_test"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ============================================================================
# MOCK MODELS (minimal for testing)
# ============================================================================

class User(Base):
    """Mock User model - create a few test users"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    name = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    participant1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    participant2_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_message_at = Column(DateTime)

    participant1_pinned = Column(Boolean, default=False)
    participant1_muted = Column(Boolean, default=False)
    participant1_archived = Column(Boolean, default=False)
    participant1_deleted_at = Column(DateTime)

    participant2_pinned = Column(Boolean, default=False)
    participant2_muted = Column(Boolean, default=False)
    participant2_archived = Column(Boolean, default=False)
    participant2_deleted_at = Column(DateTime)

    messages = relationship("Message", back_populates="conversation")


class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    content_type = Column(String(20), nullable=False)
    text_content = Column(Text)
    media_url = Column(Text)
    media_thumbnail_url = Column(Text)
    audio_duration = Column(Integer)

    reply_to_id = Column(UUID(as_uuid=True), ForeignKey("messages.id"))

    created_at = Column(DateTime, default=datetime.utcnow)
    sent_at = Column(DateTime)
    delivered_at = Column(DateTime)
    read_at = Column(DateTime)

    sender_deleted_at = Column(DateTime)
    recipient_deleted_at = Column(DateTime)

    conversation = relationship("Conversation", back_populates="messages")


# ============================================================================
# FastAPI App
# ============================================================================

app = FastAPI(
    title="Growzone Chat Local Test",
    description="Local test server for chat features",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Dependencies
# ============================================================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class MockUser:
    """Mock authenticated user for testing"""
    def __init__(self, id: int, username: str):
        self.id = id
        self.username = username
        self.name = username


def get_current_user() -> MockUser:
    """Mock authentication - returns test user
    In real app, this would verify JWT token
    For testing: always return user ID 1
    """
    return MockUser(id=1, username="testuser1")


# ============================================================================
# Startup: Create tables and seed data
# ============================================================================

@app.on_event("startup")
def startup():
    """Create tables and seed test data"""
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Create test users if they don't exist
        if db.query(User).count() == 0:
            users = [
                User(id=1, username="testuser1", email="test1@growzone.co", name="Test User 1"),
                User(id=2, username="testuser2", email="test2@growzone.co", name="Test User 2"),
                User(id=3, username="testuser3", email="test3@growzone.co", name="Test User 3"),
            ]
            db.add_all(users)
            db.commit()
            print("✅ Created 3 test users (IDs: 1, 2, 3)")
    finally:
        db.close()


# ============================================================================
# Health Check
# ============================================================================

@app.get("/")
def root():
    return {
        "message": "Growzone Chat Local Test Server",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "chat_api": "/api/v1/chat/conversations"
        },
        "test_users": [
            {"id": 1, "username": "testuser1"},
            {"id": 2, "username": "testuser2"},
            {"id": 3, "username": "testuser3"}
        ]
    }


@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}


# ============================================================================
# Simple Chat Endpoints (minimal for testing)
# ============================================================================

from pydantic import BaseModel
from typing import List

class SendMessageRequest(BaseModel):
    recipient_id: int
    content_type: str = "text"
    text_content: Optional[str] = None


@app.get("/api/v1/chat/conversations")
def get_conversations(
    current_user: MockUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all conversations for current user"""
    conversations = db.query(Conversation).filter(
        (Conversation.participant1_id == current_user.id) |
        (Conversation.participant2_id == current_user.id)
    ).all()

    return {
        "data": [
            {
                "id": str(conv.id),
                "participant1_id": conv.participant1_id,
                "participant2_id": conv.participant2_id,
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
            }
            for conv in conversations
        ],
        "total": len(conversations)
    }


@app.post("/api/v1/chat/messages")
def send_message(
    payload: SendMessageRequest,
    current_user: MockUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a message"""
    # Get or create conversation
    p1_id = min(current_user.id, payload.recipient_id)
    p2_id = max(current_user.id, payload.recipient_id)

    conversation = db.query(Conversation).filter(
        Conversation.participant1_id == p1_id,
        Conversation.participant2_id == p2_id
    ).first()

    if not conversation:
        conversation = Conversation(
            participant1_id=p1_id,
            participant2_id=p2_id
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Create message
    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        recipient_id=payload.recipient_id,
        content_type=payload.content_type,
        text_content=payload.text_content,
        sent_at=datetime.utcnow()
    )
    db.add(message)

    # Update conversation
    conversation.updated_at = datetime.utcnow()
    conversation.last_message_at = datetime.utcnow()

    db.commit()
    db.refresh(message)

    return {
        "id": str(message.id),
        "conversation_id": str(conversation.id),
        "sender_id": message.sender_id,
        "recipient_id": message.recipient_id,
        "content_type": message.content_type,
        "text_content": message.text_content,
        "created_at": message.created_at.isoformat() if message.created_at else None
    }


@app.get("/api/v1/chat/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    current_user: MockUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get messages for a conversation"""
    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.desc()).limit(50).all()

    return {
        "data": [
            {
                "id": str(msg.id),
                "conversation_id": str(msg.conversation_id),
                "sender_id": msg.sender_id,
                "recipient_id": msg.recipient_id,
                "content_type": msg.content_type,
                "text_content": msg.text_content,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
                "read_at": msg.read_at.isoformat() if msg.read_at else None,
            }
            for msg in messages
        ],
        "total": len(messages)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
