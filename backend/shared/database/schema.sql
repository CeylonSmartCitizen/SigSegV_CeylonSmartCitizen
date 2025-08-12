-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for citizen authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nic_number VARCHAR(12) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'en',
    profile_image_url TEXT,
    date_of_birth DATE,
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Government departments that provide services
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    name_si VARCHAR(255), -- Sinhala translation
    name_ta VARCHAR(255), -- Tamil translation
    description TEXT,
    contact_number VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    working_hours JSONB, -- Store as {"monday": "9-5", "tuesday": "9-5"}
    location_coordinates POINT, -- GPS coordinates
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Services offered by departments
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_si VARCHAR(255),
    name_ta VARCHAR(255),
    description TEXT,
    description_si TEXT,
    description_ta TEXT,
    required_documents JSONB, -- Array of required document types
    estimated_duration_minutes INTEGER DEFAULT 30,
    fee_amount DECIMAL(10, 2) DEFAULT 0.00,
    online_available BOOLEAN DEFAULT false,
    category VARCHAR(100), -- "identity", "business", "property", etc.
    priority_level INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
    max_daily_appointments INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Government officers who serve citizens
CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    officer_id VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    designation VARCHAR(255),
    email VARCHAR(255),
    contact_number VARCHAR(20),
    specializations TEXT[], -- Array of service categories they handle
    working_schedule JSONB, -- Weekly schedule with time slots
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Citizen appointments with government services
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    officer_id UUID REFERENCES officers(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, in-progress, completed, cancelled
    token_number VARCHAR(20) UNIQUE,
    estimated_wait_time INTEGER, -- in minutes
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    citizen_notes TEXT,
    officer_notes TEXT,
    priority_score INTEGER DEFAULT 0,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily queue management for each department/service
CREATE TABLE queue_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    session_date DATE NOT NULL,
    max_capacity INTEGER DEFAULT 50,
    current_position INTEGER DEFAULT 0,
    total_served INTEGER DEFAULT 0,
    average_service_time INTEGER, -- in minutes
    status VARCHAR(50) DEFAULT 'active', -- active, paused, closed
    session_start_time TIME DEFAULT '09:00:00',
    session_end_time TIME DEFAULT '17:00:00',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, service_id, session_date)
);

-- Individual entries in the queue
CREATE TABLE queue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    queue_session_id UUID NOT NULL REFERENCES queue_sessions(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    status VARCHAR(50) DEFAULT 'waiting', -- waiting, called, serving, completed, skipped
    called_at TIMESTAMP,
    served_at TIMESTAMP,
    completed_at TIMESTAMP,
    estimated_wait_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document uploads and management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    document_type VARCHAR(100) NOT NULL, -- "nic", "birth_certificate", "business_reg", etc.
    original_filename VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    ocr_text TEXT, -- Extracted text from OCR
    ocr_confidence DECIMAL(5, 4), -- OCR accuracy score (0.0000 to 1.0000)
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    verified_by UUID REFERENCES officers(id),
    verified_at TIMESTAMP,
    expiry_date DATE, -- For documents that expire
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI chatbot conversation history
CREATE TABLE ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    intent VARCHAR(100), -- "appointment_booking", "document_help", "general_inquiry"
    confidence_score DECIMAL(5, 4),
    language VARCHAR(10), -- "en", "si", "ta"
    context_data JSONB, -- Store conversation context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System notifications to users
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- "appointment_reminder", "queue_update", "document_status"
    channel VARCHAR(50) DEFAULT 'app', -- "app", "sms", "email"
    priority VARCHAR(20) DEFAULT 'medium', -- "low", "medium", "high", "urgent"
    sent_at TIMESTAMP,
    read_at TIMESTAMP,
    action_url TEXT, -- Deep link for mobile app
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System audit logs for security and tracking
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL, -- "login", "appointment_created", "document_uploaded"
    entity_type VARCHAR(100), -- "user", "appointment", "document"
    entity_id UUID,
    old_values JSONB, -- Previous state for updates
    new_values JSONB, -- New state for updates
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_nic ON users(nic_number);
CREATE INDEX idx_appointments_user_date ON appointments(user_id, appointment_date);
CREATE INDEX idx_appointments_service_date ON appointments(service_id, appointment_date);
CREATE INDEX idx_queue_entries_session_position ON queue_entries(queue_session_id, position);
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action, created_at);

-- Add some trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
