-- Add blacklisted tokens table for JWT token management
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id SERIAL PRIMARY KEY,
    token_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of the JWT token
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reason VARCHAR(50) DEFAULT 'logout' CHECK (reason IN ('logout', 'security', 'password_change', 'admin_action')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add global logout time to users table for mass token invalidation
ALTER TABLE users ADD COLUMN IF NOT EXISTS global_logout_time TIMESTAMP WITH TIME ZONE;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_hash ON blacklisted_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_user_id ON blacklisted_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_blacklisted_tokens_expires_at ON blacklisted_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_global_logout_time ON users(global_logout_time) WHERE global_logout_time IS NOT NULL;

-- Add failed login attempts tracking for enhanced rate limiting
CREATE TABLE IF NOT EXISTS failed_login_attempts (
    id SERIAL PRIMARY KEY,
    ip_address INET NOT NULL,
    email VARCHAR(255),
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for failed login attempts
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_time ON failed_login_attempts(attempt_time);

-- Add session management table for additional security
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Function to automatically clean up expired tokens (PostgreSQL function)
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM blacklisted_tokens WHERE expires_at <= NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Also clean up old failed login attempts (older than 24 hours)
    DELETE FROM failed_login_attempts WHERE attempt_time < NOW() - INTERVAL '24 hours';
    
    -- Clean up expired sessions
    UPDATE user_sessions SET is_active = FALSE WHERE expires_at <= NOW() AND is_active = TRUE;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update last_activity on user_sessions
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_activity = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE blacklisted_tokens IS 'Stores hashed JWT tokens that have been invalidated';
COMMENT ON TABLE failed_login_attempts IS 'Tracks failed login attempts for rate limiting and security monitoring';
COMMENT ON TABLE user_sessions IS 'Manages user sessions for additional security and tracking';
COMMENT ON COLUMN users.global_logout_time IS 'When user was globally logged out - invalidates all tokens issued before this time';

-- Grant permissions (adjust as needed for your database user)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON blacklisted_tokens TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON failed_login_attempts TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON user_sessions TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE blacklisted_tokens_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE failed_login_attempts_id_seq TO your_app_user;
-- GRANT USAGE, SELECT ON SEQUENCE user_sessions_id_seq TO your_app_user;
