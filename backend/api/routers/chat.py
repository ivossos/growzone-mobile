"""
Chat Router - FastAPI Endpoints
Add to your Social API: app.include_router(chat_router, prefix="/api/v1")
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
import boto3
from botocore.exceptions import ClientError
import os

from ..models.chat import (
    SendMessageRequest,
    MarkAsReadRequest,
    UpdateConversationRequest,
    MessageResponse,
    ConversationResponse,
    ConversationsListResponse,
    MessagesListResponse,
    UnreadCountResponse,
    UploadResponse,
    UserInfo,
    ContentType,
)

# Import your existing dependencies
# from ..dependencies import get_db, get_current_user
# from ..models import User, Conversation, Message


router = APIRouter(prefix="/chat", tags=["chat"])

# AWS S3 Configuration
S3_BUCKET = os.getenv("CHAT_S3_BUCKET", "growzone-chat-media")
S3_REGION = os.getenv("AWS_REGION", "us-east-1")
s3_client = boto3.client("s3", region_name=S3_REGION)


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def get_or_create_conversation(
    db: Session,
    user1_id: int,
    user2_id: int
) -> "Conversation":
    """Get existing conversation or create new one"""
    # Ensure ordering
    p1_id = min(user1_id, user2_id)
    p2_id = max(user1_id, user2_id)

    # Try to get existing
    conversation = db.query(Conversation).filter(
        Conversation.participant1_id == p1_id,
        Conversation.participant2_id == p2_id
    ).first()

    if conversation:
        return conversation

    # Create new
    conversation = Conversation(
        participant1_id=p1_id,
        participant2_id=p2_id
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_user_conversations_query(db: Session, user_id: int):
    """Get base query for user's conversations"""
    return db.query(Conversation).filter(
        or_(
            and_(
                Conversation.participant1_id == user_id,
                Conversation.participant1_deleted_at == None
            ),
            and_(
                Conversation.participant2_id == user_id,
                Conversation.participant2_deleted_at == None
            )
        )
    )


def get_other_user_id(conversation: "Conversation", current_user_id: int) -> int:
    """Get the other participant's ID"""
    if conversation.participant1_id == current_user_id:
        return conversation.participant2_id
    return conversation.participant1_id


def get_user_settings(conversation: "Conversation", user_id: int) -> dict:
    """Get user-specific settings for a conversation"""
    if conversation.participant1_id == user_id:
        return {
            "is_pinned": conversation.participant1_pinned,
            "is_muted": conversation.participant1_muted,
            "is_archived": conversation.participant1_archived,
        }
    return {
        "is_pinned": conversation.participant2_pinned,
        "is_muted": conversation.participant2_muted,
        "is_archived": conversation.participant2_archived,
    }


# ============================================================================
# CONVERSATIONS ENDPOINTS
# ============================================================================

@router.get("/conversations", response_model=ConversationsListResponse)
async def get_conversations(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all conversations for the current user

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    """
    if page_size > 100:
        page_size = 100

    offset = (page - 1) * page_size

    # Get conversations
    query = get_user_conversations_query(db, current_user.id)
    total = query.count()

    conversations = query.order_by(
        Conversation.updated_at.desc()
    ).offset(offset).limit(page_size).all()

    # Build response with additional data
    result = []
    for conv in conversations:
        # Get other user
        other_user_id = get_other_user_id(conv, current_user.id)
        other_user = db.query(User).filter(User.id == other_user_id).first()

        # Get last message
        last_message = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()

        # Count unread messages
        unread_count = db.query(Message).filter(
            Message.conversation_id == conv.id,
            Message.recipient_id == current_user.id,
            Message.read_at == None,
            Message.recipient_deleted_at == None
        ).count()

        # Get user settings
        settings = get_user_settings(conv, current_user.id)

        result.append(ConversationResponse(
            id=conv.id,
            participant1_id=conv.participant1_id,
            participant2_id=conv.participant2_id,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            last_message_at=conv.last_message_at,
            is_pinned=settings["is_pinned"],
            is_muted=settings["is_muted"],
            is_archived=settings["is_archived"],
            last_message=MessageResponse.from_orm(last_message) if last_message else None,
            other_user=UserInfo(
                id=other_user.id,
                username=other_user.username,
                name=other_user.name,
                avatar_url=other_user.image.image if other_user.image else None,
                is_online=False,  # TODO: Get from Redis/WebSocket
                last_seen=None,  # TODO: Get from users table
            ) if other_user else None,
            unread_count=unread_count
        ))

    return ConversationsListResponse(
        data=result,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post("/conversations", response_model=ConversationResponse)
async def create_conversation(
    recipient_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new conversation with a user

    - **recipient_id**: User ID to start conversation with
    """
    if recipient_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot create conversation with yourself"
        )

    # Check if recipient exists
    recipient = db.query(User).filter(User.id == recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )

    # Get or create conversation
    conversation = get_or_create_conversation(db, current_user.id, recipient_id)

    # Get user settings
    settings = get_user_settings(conversation, current_user.id)

    return ConversationResponse(
        id=conversation.id,
        participant1_id=conversation.participant1_id,
        participant2_id=conversation.participant2_id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message_at=conversation.last_message_at,
        is_pinned=settings["is_pinned"],
        is_muted=settings["is_muted"],
        is_archived=settings["is_archived"],
        other_user=UserInfo(
            id=recipient.id,
            username=recipient.username,
            name=recipient.name,
            avatar_url=recipient.image.image if recipient.image else None,
            is_online=False,
            last_seen=None,
        ),
        unread_count=0
    )


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific conversation"""
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check if user is participant
    if current_user.id not in [conversation.participant1_id, conversation.participant2_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )

    # Get other user
    other_user_id = get_other_user_id(conversation, current_user.id)
    other_user = db.query(User).filter(User.id == other_user_id).first()

    # Get user settings
    settings = get_user_settings(conversation, current_user.id)

    return ConversationResponse(
        id=conversation.id,
        participant1_id=conversation.participant1_id,
        participant2_id=conversation.participant2_id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message_at=conversation.last_message_at,
        is_pinned=settings["is_pinned"],
        is_muted=settings["is_muted"],
        is_archived=settings["is_archived"],
        other_user=UserInfo(
            id=other_user.id,
            username=other_user.username,
            name=other_user.name,
            avatar_url=other_user.image.image if other_user.image else None,
            is_online=False,
            last_seen=None,
        ) if other_user else None,
        unread_count=0  # TODO: Calculate
    )


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: UUID,
    payload: UpdateConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update conversation settings (pin, mute, archive)
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check if user is participant
    if current_user.id not in [conversation.participant1_id, conversation.participant2_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )

    # Update settings for current user
    is_participant1 = current_user.id == conversation.participant1_id

    if payload.pinned is not None:
        if is_participant1:
            conversation.participant1_pinned = payload.pinned
        else:
            conversation.participant2_pinned = payload.pinned

    if payload.muted is not None:
        if is_participant1:
            conversation.participant1_muted = payload.muted
        else:
            conversation.participant2_muted = payload.muted

    if payload.archived is not None:
        if is_participant1:
            conversation.participant1_archived = payload.archived
        else:
            conversation.participant2_archived = payload.archived

    db.commit()
    db.refresh(conversation)

    # Get updated settings
    settings = get_user_settings(conversation, current_user.id)

    # Get other user
    other_user_id = get_other_user_id(conversation, current_user.id)
    other_user = db.query(User).filter(User.id == other_user_id).first()

    return ConversationResponse(
        id=conversation.id,
        participant1_id=conversation.participant1_id,
        participant2_id=conversation.participant2_id,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        last_message_at=conversation.last_message_at,
        is_pinned=settings["is_pinned"],
        is_muted=settings["is_muted"],
        is_archived=settings["is_archived"],
        other_user=UserInfo(
            id=other_user.id,
            username=other_user.username,
            name=other_user.name,
            avatar_url=other_user.image.image if other_user.image else None,
            is_online=False,
            last_seen=None,
        ) if other_user else None,
        unread_count=0
    )


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete conversation (soft delete for current user)
    """
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    # Check if user is participant
    if current_user.id not in [conversation.participant1_id, conversation.participant2_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this conversation"
        )

    # Soft delete for current user
    if current_user.id == conversation.participant1_id:
        conversation.participant1_deleted_at = datetime.utcnow()
    else:
        conversation.participant2_deleted_at = datetime.utcnow()

    db.commit()


# ============================================================================
# MESSAGES ENDPOINTS
# ============================================================================

@router.get("/conversations/{conversation_id}/messages", response_model=MessagesListResponse)
async def get_messages(
    conversation_id: UUID,
    page: int = 1,
    page_size: int = 50,
    before_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messages for a conversation (paginated, newest first)

    - **page**: Page number
    - **page_size**: Messages per page (max: 100)
    - **before_id**: Get messages before this message ID (for infinite scroll)
    """
    if page_size > 100:
        page_size = 100

    # Verify conversation access
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    if current_user.id not in [conversation.participant1_id, conversation.participant2_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this conversation"
        )

    # Build query
    query = db.query(Message).filter(
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
    )

    # Handle cursor-based pagination
    if before_id:
        before_message = db.query(Message).filter(Message.id == before_id).first()
        if before_message:
            query = query.filter(Message.created_at < before_message.created_at)

    total = query.count()
    messages = query.order_by(Message.created_at.desc()).limit(page_size).all()

    # Check if there are more messages
    has_more = total > page_size

    return MessagesListResponse(
        data=[MessageResponse.from_orm(msg) for msg in messages],
        total=total,
        page=page,
        page_size=page_size,
        has_more=has_more
    )


@router.post("/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    payload: SendMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a new message
    """
    # Validate recipient
    if payload.recipient_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot send message to yourself"
        )

    recipient = db.query(User).filter(User.id == payload.recipient_id).first()
    if not recipient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipient not found"
        )

    # Get or create conversation
    conversation = get_or_create_conversation(db, current_user.id, payload.recipient_id)

    # Create message
    message = Message(
        conversation_id=conversation.id,
        sender_id=current_user.id,
        recipient_id=payload.recipient_id,
        content_type=payload.content_type.value,
        text_content=payload.text_content,
        media_url=payload.media_url,
        media_thumbnail_url=payload.media_thumbnail_url,
        audio_duration=payload.audio_duration,
        reply_to_id=payload.reply_to_id,
        sent_at=datetime.utcnow()
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    # TODO: Send WebSocket notification to recipient
    # await send_websocket_notification(payload.recipient_id, {
    #     "type": "newMessage",
    #     "data": MessageResponse.from_orm(message).dict()
    # })

    return MessageResponse.from_orm(message)


@router.post("/messages/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_messages_as_read(
    payload: MarkAsReadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark messages as read
    """
    # Update messages
    db.query(Message).filter(
        Message.id.in_(payload.message_ids),
        Message.recipient_id == current_user.id,
        Message.read_at == None
    ).update(
        {Message.read_at: datetime.utcnow()},
        synchronize_session=False
    )

    db.commit()

    # TODO: Send WebSocket notification to senders
    # for message_id in payload.message_ids:
    #     message = db.query(Message).filter(Message.id == message_id).first()
    #     if message:
    #         await send_websocket_notification(message.sender_id, {
    #             "type": "messageStatus",
    #             "data": {"messageId": str(message.id), "status": "read"}
    #         })


@router.delete("/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_message(
    message_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete message (soft delete for current user)
    """
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    # Can only delete own messages or messages sent to you
    if message.sender_id == current_user.id:
        message.sender_deleted_at = datetime.utcnow()
    elif message.recipient_id == current_user.id:
        message.recipient_deleted_at = datetime.utcnow()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this message"
        )

    db.commit()


@router.get("/unread-count", response_model=UnreadCountResponse)
async def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get total unread message count for current user
    """
    total_unread = db.query(Message).filter(
        Message.recipient_id == current_user.id,
        Message.read_at == None,
        Message.recipient_deleted_at == None
    ).count()

    # Count conversations with unread messages
    conversations_with_unread = db.query(
        func.count(func.distinct(Message.conversation_id))
    ).filter(
        Message.recipient_id == current_user.id,
        Message.read_at == None,
        Message.recipient_deleted_at == None
    ).scalar()

    return UnreadCountResponse(
        total_unread=total_unread,
        conversations_with_unread=conversations_with_unread or 0
    )


# ============================================================================
# MEDIA UPLOAD ENDPOINT
# ============================================================================

@router.post("/upload", response_model=UploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    """
    Upload media file (image/video/audio) to S3

    Returns S3 URL to use in send_message
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp",
                     "video/mp4", "video/quicktime", "audio/mpeg", "audio/m4a", "audio/wav"]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type {file.content_type} not allowed"
        )

    # Validate file size (max 10MB for images, 50MB for video/audio)
    max_size = 10 * 1024 * 1024 if file.content_type.startswith("image/") else 50 * 1024 * 1024

    file_content = await file.read()
    file_size = len(file_content)

    if file_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Max size: {max_size / (1024*1024)}MB"
        )

    # Generate unique filename
    import uuid
    from datetime import datetime
    file_ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_filename = f"chat/{current_user.id}/{datetime.utcnow().strftime('%Y/%m')}/{uuid.uuid4()}.{file_ext}"

    try:
        # Upload to S3
        s3_client.put_object(
            Bucket=S3_BUCKET,
            Key=unique_filename,
            Body=file_content,
            ContentType=file.content_type,
            Metadata={
                "user_id": str(current_user.id),
                "uploaded_at": datetime.utcnow().isoformat()
            }
        )

        # Generate URL
        url = f"https://{S3_BUCKET}.s3.{S3_REGION}.amazonaws.com/{unique_filename}"

        # TODO: Generate thumbnail for images/videos
        thumbnail_url = None

        return UploadResponse(
            url=url,
            thumbnail_url=thumbnail_url,
            file_size=file_size,
            mime_type=file.content_type
        )

    except ClientError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


# ============================================================================
# TYPING INDICATOR ENDPOINT (Optional - can use WebSocket instead)
# ============================================================================

@router.post("/typing", status_code=status.HTTP_204_NO_CONTENT)
async def send_typing_indicator(
    conversation_id: UUID,
    is_typing: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send typing indicator

    Usually handled via WebSocket, but can use REST as fallback
    """
    # Verify conversation access
    conversation = db.query(Conversation).filter(
        Conversation.id == conversation_id
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

    if current_user.id not in [conversation.participant1_id, conversation.participant2_id]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )

    # TODO: Broadcast via WebSocket
    # other_user_id = get_other_user_id(conversation, current_user.id)
    # await send_websocket_notification(other_user_id, {
    #     "type": "typing",
    #     "data": {
    #         "conversationId": str(conversation_id),
    #         "userId": current_user.id,
    #         "isTyping": is_typing
    #     }
    # })

    return None
