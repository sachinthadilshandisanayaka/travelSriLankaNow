-- Allow event_id to be null for place bookings
ALTER TABLE event_bookings ALTER COLUMN event_id DROP NOT NULL;

-- Add place_id for place bookings
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS place_id BIGINT;

-- Add booking_type to distinguish EVENT vs PLACE bookings
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS booking_type VARCHAR(10) NOT NULL DEFAULT 'EVENT';
