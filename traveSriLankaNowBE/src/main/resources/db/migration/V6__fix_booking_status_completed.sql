-- Hibernate generated the check constraint without 'completed'.
-- Drop and recreate with all four valid statuses.
ALTER TABLE event_bookings DROP CONSTRAINT IF EXISTS event_bookings_status_check;
ALTER TABLE event_bookings ADD CONSTRAINT event_bookings_status_check
    CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
