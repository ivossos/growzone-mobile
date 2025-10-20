-- ============================================================================
-- GROWZONE CHAT - Initial Migration
-- Database: PostgreSQL 14+
-- Description: Tables for 1-to-1 chat with messages, media, and status tracking
-- ============================================================================

-- ============================================================================
-- TABLE: conversations
-- Stores 1-to-1 chat conversations between users
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Participants (ordered: participant1_id < participant2_id)
    participant1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    participant2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Timestamps
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

    -- Constraints
    CONSTRAINT different_participants CHECK (participant1_id != participant2_id),
    CONSTRAINT ordered_participants CHECK (participant1_id < participant2_id)
);

COMMENT ON TABLE conversations IS '1-to-1 chat conversations between users';
COMMENT ON COLUMN conversations.participant1_id IS 'User with lower ID (ordered)';
COMMENT ON COLUMN conversations.participant2_id IS 'User with higher ID (ordered)';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of most recent message';

-- Unique index: Only one conversation per pair
CREATE UNIQUE INDEX idx_conversation_participants
ON conversations(participant1_id, participant2_id);

-- Index: Fast lookup for user's conversations
CREATE INDEX idx_conversation_p1_updated
ON conversations(participant1_id, updated_at DESC)
WHERE participant1_deleted_at IS NULL;

CREATE INDEX idx_conversation_p2_updated
ON conversations(participant2_id, updated_at DESC)
WHERE participant2_deleted_at IS NULL;

-- ============================================================================
-- TABLE: messages
-- Stores all messages (text, images, videos, audio)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Sender and recipient
    sender_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Content type and data
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('text', 'image', 'video', 'audio')),
    text_content TEXT,
    media_url TEXT,
    media_thumbnail_url TEXT,
    audio_duration INTEGER, -- Duration in seconds (for audio messages)

    -- Reply feature (optional)
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,

    -- Status tracking
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,

    -- Soft delete (per user)
    sender_deleted_at TIMESTAMP WITH TIME ZONE,
    recipient_deleted_at TIMESTAMP WITH TIME ZONE,

    -- Ensure content is valid based on type
    CONSTRAINT valid_content CHECK (
        (content_type = 'text' AND text_content IS NOT NULL) OR
        (content_type != 'text' AND media_url IS NOT NULL)
    )
);

COMMENT ON TABLE messages IS 'All messages (text, image, video, audio)';
COMMENT ON COLUMN messages.content_type IS 'Type: text, image, video, audio';
COMMENT ON COLUMN messages.reply_to_id IS 'Optional reference to replied message';
COMMENT ON COLUMN messages.audio_duration IS 'Duration in seconds for audio messages';

-- Index: Get messages for a conversation (most recent first)
CREATE INDEX idx_messages_conversation_created
ON messages(conversation_id, created_at DESC);

-- Index: Get all messages sent by a user
CREATE INDEX idx_messages_sender
ON messages(sender_id, created_at DESC);

-- Index: Fast lookup of unread messages for a user
CREATE INDEX idx_messages_recipient_unread
ON messages(recipient_id, read_at)
WHERE read_at IS NULL AND recipient_deleted_at IS NULL;

-- Index: Efficient count of unread messages per conversation
CREATE INDEX idx_messages_conversation_unread
ON messages(conversation_id, read_at)
WHERE read_at IS NULL;

-- ============================================================================
-- TRIGGER: Auto-update conversation timestamp on new message
-- ============================================================================
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

CREATE TRIGGER trigger_update_conversation_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_timestamp();

COMMENT ON FUNCTION update_conversation_timestamp() IS 'Auto-updates conversation.updated_at when new message is inserted';

-- ============================================================================
-- TABLE: typing_indicators (Optional - can use Redis instead)
-- Tracks who is typing in each conversation
-- ============================================================================
CREATE TABLE IF NOT EXISTS typing_indicators (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    PRIMARY KEY (conversation_id, user_id)
);

COMMENT ON TABLE typing_indicators IS 'Temporary indicators of who is typing (can use Redis instead)';

-- Index: Clean up expired typing indicators
CREATE INDEX idx_typing_expires ON typing_indicators(expires_at);

-- ============================================================================
-- FUNCTION: Get or create conversation between two users
-- ============================================================================
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    user1_id INTEGER,
    user2_id INTEGER
) RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    p1_id INTEGER;
    p2_id INTEGER;
BEGIN
    -- Ensure ordering (participant1_id < participant2_id)
    IF user1_id < user2_id THEN
        p1_id := user1_id;
        p2_id := user2_id;
    ELSE
        p1_id := user2_id;
        p2_id := user1_id;
    END IF;

    -- Try to get existing conversation
    SELECT id INTO conversation_id
    FROM conversations
    WHERE participant1_id = p1_id AND participant2_id = p2_id;

    -- Create if not exists
    IF conversation_id IS NULL THEN
        INSERT INTO conversations (participant1_id, participant2_id)
        VALUES (p1_id, p2_id)
        RETURNING id INTO conversation_id;
    END IF;

    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_or_create_conversation IS 'Gets existing or creates new conversation between two users';

-- ============================================================================
-- SAMPLE DATA (for testing - remove in production)
-- ============================================================================

-- Uncomment to insert sample data
/*
-- Assuming users table has IDs 1, 2, 3

-- Create conversation
INSERT INTO conversations (id, participant1_id, participant2_id, created_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 1, 2, NOW() - INTERVAL '2 days'),
    ('00000000-0000-0000-0000-000000000002', 1, 3, NOW() - INTERVAL '1 day');

-- Create messages
INSERT INTO messages (conversation_id, sender_id, recipient_id, content_type, text_content, created_at)
VALUES
    ('00000000-0000-0000-0000-000000000001', 1, 2, 'text', 'Olá! Como vai?', NOW() - INTERVAL '2 days'),
    ('00000000-0000-0000-0000-000000000001', 2, 1, 'text', 'Tudo bem! E você?', NOW() - INTERVAL '2 days' + INTERVAL '1 hour'),
    ('00000000-0000-0000-0000-000000000001', 1, 2, 'text', 'Tudo ótimo! 🌱', NOW() - INTERVAL '1 day');
*/

-- ============================================================================
-- VERIFICATION QUERIES (Run after migration to verify)
-- ============================================================================

-- Verify tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('conversations', 'messages', 'typing_indicators');

-- Verify indexes
SELECT indexname FROM pg_indexes
WHERE tablename IN ('conversations', 'messages')
ORDER BY tablename, indexname;

-- Verify functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name IN ('update_conversation_timestamp', 'get_or_create_conversation');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
