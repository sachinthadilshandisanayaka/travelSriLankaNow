-- Widen booking_type column so it can hold any bk_types.code (currently VARCHAR(10) set in V7)
ALTER TABLE event_bookings ALTER COLUMN booking_type TYPE VARCHAR(50);

-- Add proper foreign key from event_bookings.booking_type → bk_types.code
-- This turns the plain string column into a true entity relationship
ALTER TABLE event_bookings
    ADD CONSTRAINT fk_event_bookings_booking_type
    FOREIGN KEY (booking_type) REFERENCES bk_types(code);
