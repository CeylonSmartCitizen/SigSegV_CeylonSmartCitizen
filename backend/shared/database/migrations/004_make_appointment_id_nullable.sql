-- Migration: Make appointment_id nullable in queue_entries to support service-based queuing
-- This allows users to join queues without having a pre-booked appointment

-- Remove the NOT NULL constraint from appointment_id
ALTER TABLE queue_entries 
ALTER COLUMN appointment_id DROP NOT NULL;

-- Add a check constraint to ensure either appointment_id exists OR we have a service-based queue
-- For now, we'll just make it nullable and handle the logic in the application layer
