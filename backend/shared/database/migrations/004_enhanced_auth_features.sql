-- Additional tables for enhanced authentication features
-- Run this after the main schema.sql

-- User sessions table for active session management
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_jti VARCHAR(255) UNIQUE NOT NULL, -- JWT ID for token tracking
    device_info TEXT,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token_jti ON user_sessions(token_jti);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Two-factor authentication table
CREATE TABLE IF NOT EXISTS user_two_factor (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    secret_key VARCHAR(255) NOT NULL,
    backup_codes TEXT, -- JSON array of backup codes
    is_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    disabled_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data export requests log for audit
CREATE TABLE IF NOT EXISTS user_data_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    file_size_bytes INTEGER,
    download_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Account deactivation requests
CREATE TABLE IF NOT EXISTS user_deactivation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    processed_by UUID, -- admin user who processed the request
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected, completed
    ip_address INET,
    user_agent TEXT
);

-- Rate limiting tracking table (enhanced)
CREATE TABLE IF NOT EXISTS user_rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET,
    action_type VARCHAR(100) NOT NULL, -- login, register, password_reset, etc.
    attempts_count INTEGER DEFAULT 1,
    first_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_at TIMESTAMP,
    is_blocked BOOLEAN DEFAULT false,
    blocked_until TIMESTAMP
);

-- Password reset requests table
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reset_token VARCHAR(255) UNIQUE NOT NULL,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired
    ip_address INET,
    user_agent TEXT
);

-- Add reset token fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Indexes for rate limiting performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON user_rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_address ON user_rate_limits(ip_address);
CREATE INDEX IF NOT EXISTS idx_rate_limits_action_type ON user_rate_limits(action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON user_rate_limits(last_attempt_at);

-- Indexes for password reset performance
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_requests(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_user_id ON password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires_at ON password_reset_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_two_factor_updated_at 
    BEFORE UPDATE ON user_two_factor 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired sessions automatically
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions 
    WHERE expires_at <= CURRENT_TIMESTAMP OR is_active = false;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old export requests
CREATE OR REPLACE FUNCTION cleanup_expired_exports()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_data_exports 
    WHERE expires_at <= CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired password reset requests
CREATE OR REPLACE FUNCTION cleanup_expired_password_resets()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
    deleted_count INTEGER;
BEGIN
    -- Mark expired requests as expired
    UPDATE password_reset_requests 
    SET status = 'expired' 
    WHERE expires_at <= CURRENT_TIMESTAMP AND status = 'pending';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Clear expired reset tokens from users table
    UPDATE users 
    SET reset_token = NULL, reset_token_expires = NULL 
    WHERE reset_token_expires <= CURRENT_TIMESTAMP;
    
    -- Delete old password reset requests (older than 30 days)
    DELETE FROM password_reset_requests 
    WHERE requested_at <= CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN updated_count + deleted_count;
END;
$$ LANGUAGE plpgsql;
