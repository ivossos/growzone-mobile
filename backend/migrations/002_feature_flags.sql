-- Migration: Feature Flags System
-- Description: Control features remotely without app updates
-- Date: 2025-10-27

-- =====================================================
-- 1. Create feature_flags table
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flags (
    id SERIAL PRIMARY KEY,

    -- Flag identification
    flag_key VARCHAR(100) UNIQUE NOT NULL,
    flag_name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Flag status
    is_enabled BOOLEAN NOT NULL DEFAULT false,

    -- Rollout configuration
    rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),

    -- User targeting (optional JSON configuration)
    -- Example: {"user_ids": [1, 2, 3], "exclude_user_ids": [4, 5]}
    targeting_rules JSONB DEFAULT '{}'::jsonb,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    -- Notes for team
    notes TEXT
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);

-- =====================================================
-- 2. Create feature_flag_audit_log table
-- =====================================================

CREATE TABLE IF NOT EXISTS feature_flag_audit_log (
    id SERIAL PRIMARY KEY,
    flag_key VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'enabled', 'disabled', 'created', 'updated', 'deleted'
    previous_value JSONB,
    new_value JSONB,
    changed_by VARCHAR(100),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Index for audit queries
CREATE INDEX IF NOT EXISTS idx_feature_flag_audit_flag_key ON feature_flag_audit_log(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flag_audit_changed_at ON feature_flag_audit_log(changed_at DESC);

-- =====================================================
-- 3. Insert default feature flags
-- =====================================================

INSERT INTO feature_flags (flag_key, flag_name, description, is_enabled, rollout_percentage, created_by, notes)
VALUES
    (
        'chat_enabled',
        'Chat Feature',
        'Enable or disable the entire chat feature including conversations, messages, and WebSocket',
        true,
        100,
        'system',
        'Main toggle for chat feature. Set to false to disable chat for all users.'
    ),
    (
        'chat_websocket_enabled',
        'Chat WebSocket',
        'Enable real-time messaging via WebSocket. If disabled, falls back to polling.',
        true,
        100,
        'system',
        'Can disable WebSocket if having connectivity issues, app will poll for messages instead.'
    ),
    (
        'chat_media_upload_enabled',
        'Chat Media Upload',
        'Allow users to upload images/videos in chat',
        true,
        100,
        'system',
        'Disable if having S3 storage issues or want to reduce costs temporarily.'
    ),
    (
        'chat_voice_messages_enabled',
        'Chat Voice Messages',
        'Enable voice message recording and sending',
        true,
        100,
        'system',
        'Voice messages feature toggle.'
    ),
    (
        'stories_enabled',
        'Stories (Weestory)',
        'Enable stories feature',
        true,
        100,
        'system',
        'Main toggle for stories/weestory feature.'
    ),
    (
        'ai_assistant_enabled',
        'AI Assistant (@growbot)',
        'Enable AI chatbot assistant in conversations',
        false,
        0,
        'system',
        'Disabled by default. Enable when @growbot AI assistant is ready.'
    )
ON CONFLICT (flag_key) DO NOTHING;

-- =====================================================
-- 4. Create helper functions
-- =====================================================

-- Function to check if a feature is enabled for a specific user
CREATE OR REPLACE FUNCTION is_feature_enabled(
    p_flag_key VARCHAR(100),
    p_user_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_flag RECORD;
    v_random_value INTEGER;
BEGIN
    -- Get the feature flag
    SELECT * INTO v_flag
    FROM feature_flags
    WHERE flag_key = p_flag_key;

    -- If flag doesn't exist, return false
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- If flag is disabled globally, return false
    IF NOT v_flag.is_enabled THEN
        RETURN false;
    END IF;

    -- Check user-specific targeting rules
    IF p_user_id IS NOT NULL AND v_flag.targeting_rules IS NOT NULL THEN
        -- Check if user is in included list
        IF v_flag.targeting_rules ? 'user_ids' THEN
            IF NOT (v_flag.targeting_rules->'user_ids' @> to_jsonb(p_user_id)) THEN
                RETURN false;
            END IF;
        END IF;

        -- Check if user is in excluded list
        IF v_flag.targeting_rules ? 'exclude_user_ids' THEN
            IF v_flag.targeting_rules->'exclude_user_ids' @> to_jsonb(p_user_id) THEN
                RETURN false;
            END IF;
        END IF;
    END IF;

    -- Check rollout percentage (deterministic based on user_id if provided)
    IF v_flag.rollout_percentage < 100 THEN
        IF p_user_id IS NOT NULL THEN
            -- Deterministic: same user always gets same result
            v_random_value := (p_user_id % 100);
        ELSE
            -- Random for anonymous users
            v_random_value := floor(random() * 100);
        END IF;

        IF v_random_value >= v_flag.rollout_percentage THEN
            RETURN false;
        END IF;
    END IF;

    RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get all enabled features for a user
CREATE OR REPLACE FUNCTION get_enabled_features(p_user_id INTEGER DEFAULT NULL)
RETURNS TABLE(flag_key VARCHAR, flag_name VARCHAR, description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ff.flag_key,
        ff.flag_name,
        ff.description
    FROM feature_flags ff
    WHERE is_feature_enabled(ff.flag_key, p_user_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to log feature flag changes
CREATE OR REPLACE FUNCTION log_feature_flag_change()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO feature_flag_audit_log (
            flag_key,
            action,
            previous_value,
            new_value,
            changed_by
        ) VALUES (
            NEW.flag_key,
            CASE
                WHEN OLD.is_enabled = false AND NEW.is_enabled = true THEN 'enabled'
                WHEN OLD.is_enabled = true AND NEW.is_enabled = false THEN 'disabled'
                ELSE 'updated'
            END,
            row_to_json(OLD),
            row_to_json(NEW),
            NEW.updated_by
        );
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO feature_flag_audit_log (
            flag_key,
            action,
            new_value,
            changed_by
        ) VALUES (
            NEW.flag_key,
            'created',
            row_to_json(NEW),
            NEW.created_by
        );
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO feature_flag_audit_log (
            flag_key,
            action,
            previous_value,
            changed_by
        ) VALUES (
            OLD.flag_key,
            'deleted',
            row_to_json(OLD),
            OLD.updated_by
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS trg_feature_flag_audit ON feature_flags;
CREATE TRIGGER trg_feature_flag_audit
    AFTER INSERT OR UPDATE OR DELETE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION log_feature_flag_change();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feature_flag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_feature_flag_updated_at ON feature_flags;
CREATE TRIGGER trg_feature_flag_updated_at
    BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_feature_flag_timestamp();

-- =====================================================
-- 5. Grant permissions
-- =====================================================

GRANT SELECT ON feature_flags TO PUBLIC;
GRANT SELECT ON feature_flag_audit_log TO PUBLIC;
GRANT EXECUTE ON FUNCTION is_feature_enabled(VARCHAR, INTEGER) TO PUBLIC;
GRANT EXECUTE ON FUNCTION get_enabled_features(INTEGER) TO PUBLIC;

-- =====================================================
-- 6. Verification queries
-- =====================================================

-- List all feature flags
-- SELECT * FROM feature_flags ORDER BY flag_key;

-- Check if chat is enabled
-- SELECT is_feature_enabled('chat_enabled');

-- Check if chat is enabled for user 123
-- SELECT is_feature_enabled('chat_enabled', 123);

-- Get all enabled features for user 123
-- SELECT * FROM get_enabled_features(123);

-- View audit log
-- SELECT * FROM feature_flag_audit_log ORDER BY changed_at DESC LIMIT 10;

-- =====================================================
-- USAGE EXAMPLES
-- =====================================================

-- Enable a feature for everyone:
-- UPDATE feature_flags SET is_enabled = true WHERE flag_key = 'chat_enabled';

-- Disable a feature for everyone:
-- UPDATE feature_flags SET is_enabled = false WHERE flag_key = 'chat_enabled';

-- Enable for 50% of users (gradual rollout):
-- UPDATE feature_flags SET is_enabled = true, rollout_percentage = 50 WHERE flag_key = 'chat_enabled';

-- Enable only for specific users:
-- UPDATE feature_flags
-- SET is_enabled = true,
--     targeting_rules = '{"user_ids": [1, 2, 3, 100, 500]}'::jsonb
-- WHERE flag_key = 'ai_assistant_enabled';

-- Exclude specific users:
-- UPDATE feature_flags
-- SET is_enabled = true,
--     targeting_rules = '{"exclude_user_ids": [666, 999]}'::jsonb
-- WHERE flag_key = 'chat_enabled';

COMMIT;
