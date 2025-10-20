"""
Chat Models (Pydantic Schemas)
For use with FastAPI endpoints
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field


# ============================================================================
# ENUMS
# ============================================================================

class ContentType(str, Enum):
    """Message content types"""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"


# ============================================================================
# REQUEST SCHEMAS
# ============================================================================

class SendMessageRequest(BaseModel):
    """Request payload for sending a message"""
    recipient_id: int = Field(..., description="User ID of the recipient")
    content_type: ContentType
    text_content: Optional[str] = Field(None, max_length=5000)
    media_url: Optional[str] = None
    media_thumbnail_url: Optional[str] = None
    audio_duration: Optional[int] = Field(None, ge=0, le=300)  # Max 5 minutes
    reply_to_id: Optional[UUID] = None

    class Config:
        json_schema_extra = {
            "example": {
                "recipient_id": 123,
                "content_type": "text",
                "text_content": "Olá! Como vai?"
            }
        }


class MarkAsReadRequest(BaseModel):
    """Request payload for marking messages as read"""
    message_ids: List[UUID] = Field(..., min_length=1)

    class Config:
        json_schema_extra = {
            "example": {
                "message_ids": ["550e8400-e29b-41d4-a716-446655440000"]
            }
        }


class UpdateConversationRequest(BaseModel):
    """Request payload for updating conversation settings"""
    pinned: Optional[bool] = None
    muted: Optional[bool] = None
    archived: Optional[bool] = None

    class Config:
        json_schema_extra = {
            "example": {
                "pinned": True,
                "muted": False
            }
        }


class TypingIndicatorRequest(BaseModel):
    """Request payload for typing indicator"""
    conversation_id: UUID
    is_typing: bool

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "is_typing": True
            }
        }


# ============================================================================
# RESPONSE SCHEMAS
# ============================================================================

class UserInfo(BaseModel):
    """Basic user information for chat"""
    id: int
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    is_online: bool = False
    last_seen: Optional[datetime] = None

    class Config:
        from_attributes = True


class MessageResponse(BaseModel):
    """Response schema for a message"""
    id: UUID
    conversation_id: UUID
    sender_id: int
    recipient_id: int
    content_type: ContentType
    text_content: Optional[str] = None
    media_url: Optional[str] = None
    media_thumbnail_url: Optional[str] = None
    audio_duration: Optional[int] = None
    reply_to_id: Optional[UUID] = None
    created_at: datetime
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None

    # Optional: Include sender info
    sender: Optional[UserInfo] = None

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Response schema for a conversation"""
    id: UUID
    participant1_id: int
    participant2_id: int
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime] = None

    # User-specific settings
    is_pinned: bool = False
    is_muted: bool = False
    is_archived: bool = False

    # Last message preview
    last_message: Optional[MessageResponse] = None

    # Other participant info
    other_user: Optional[UserInfo] = None

    # Unread count
    unread_count: int = 0

    class Config:
        from_attributes = True


class ConversationsListResponse(BaseModel):
    """Response schema for list of conversations"""
    data: List[ConversationResponse]
    total: int
    page: int = 1
    page_size: int = 20


class MessagesListResponse(BaseModel):
    """Response schema for list of messages"""
    data: List[MessageResponse]
    total: int
    page: int = 1
    page_size: int = 50
    has_more: bool = False


class UnreadCountResponse(BaseModel):
    """Response schema for unread message count"""
    total_unread: int
    conversations_with_unread: int


class UploadResponse(BaseModel):
    """Response schema for media upload"""
    url: str
    thumbnail_url: Optional[str] = None
    file_size: int
    mime_type: str

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://growzone-chat.s3.amazonaws.com/media/123/image.jpg",
                "thumbnail_url": "https://growzone-chat.s3.amazonaws.com/media/123/thumb.jpg",
                "file_size": 1024000,
                "mime_type": "image/jpeg"
            }
        }


# ============================================================================
# WEBSOCKET SCHEMAS
# ============================================================================

class WebSocketAction(str, Enum):
    """WebSocket action types"""
    SEND_MESSAGE = "sendMessage"
    TYPING = "typing"
    MARK_READ = "markRead"
    PING = "ping"


class WebSocketEvent(str, Enum):
    """WebSocket event types (server -> client)"""
    NEW_MESSAGE = "newMessage"
    MESSAGE_STATUS = "messageStatus"
    TYPING = "typing"
    USER_ONLINE = "userOnline"
    USER_OFFLINE = "userOffline"
    PONG = "pong"


class WebSocketMessage(BaseModel):
    """WebSocket message format"""
    action: WebSocketAction
    data: dict


class WebSocketEventPayload(BaseModel):
    """WebSocket event payload (server -> client)"""
    type: WebSocketEvent
    data: dict


# ============================================================================
# DATABASE MODELS (SQLAlchemy - for reference)
# ============================================================================

"""
Example SQLAlchemy models (adapt to your existing models):

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

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

    # Relationships
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

    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id])
    recipient = relationship("User", foreign_keys=[recipient_id])
"""
