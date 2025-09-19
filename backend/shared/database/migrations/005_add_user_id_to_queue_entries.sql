-- Migration: Add user_id field to queue_entries for service-based queuing
-- This allows users to join queues without appointments while still tracking who is in queue

-- Add user_id field to queue_entries table
ALTER TABLE queue_entries 
ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for efficient user queue lookups
CREATE INDEX idx_queue_entries_user ON queue_entries(user_id);

-- Update existing entries to extract user_id from appointments where possible
UPDATE queue_entries 
SET user_id = a.user_id 
FROM appointments a 
WHERE queue_entries.appointment_id = a.id 
AND queue_entries.user_id IS NULL;
