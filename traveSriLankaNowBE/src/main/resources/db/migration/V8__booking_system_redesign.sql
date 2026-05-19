-- V8: Booking System Redesign
-- Master table for booking statuses (admin-configurable)
CREATE TABLE IF NOT EXISTS bk_statuses (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_terminal BOOLEAN NOT NULL DEFAULT FALSE,
    allows_edit BOOLEAN NOT NULL DEFAULT FALSE,
    allows_cancel BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(20),
    icon VARCHAR(50)
);

-- Master table for booking types (EVENT / PLACE, extendable by admin)
CREATE TABLE IF NOT EXISTS bk_types (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Rule-based conditions governing edit/cancel eligibility per booking type
CREATE TABLE IF NOT EXISTS bk_conditions (
    id BIGSERIAL PRIMARY KEY,
    booking_type_code VARCHAR(50) NOT NULL REFERENCES bk_types(code),
    condition_type VARCHAR(100) NOT NULL,
    condition_value TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Terms & Conditions per booking type (versioned)
CREATE TABLE IF NOT EXISTS bk_terms (
    id BIGSERIAL PRIMARY KEY,
    booking_type_code VARCHAR(50) NOT NULL REFERENCES bk_types(code),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE
);

-- Availability configuration per booking type / entity
CREATE TABLE IF NOT EXISTS bk_availability_config (
    id BIGSERIAL PRIMARY KEY,
    booking_type_code VARCHAR(50) NOT NULL REFERENCES bk_types(code),
    entity_id BIGINT,
    allow_multiple_per_date BOOLEAN NOT NULL DEFAULT TRUE,
    max_bookings_per_date INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Audit log: every booking state change is recorded here
CREATE TABLE IF NOT EXISTS bk_audit_log (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES event_bookings(id),
    action VARCHAR(100) NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by VARCHAR(100),
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    change_reason TEXT,
    booking_snapshot TEXT
);

-- Add audit fields, optimistic-lock version, and proper requested_date to event_bookings
ALTER TABLE event_bookings
    ADD COLUMN IF NOT EXISTS created_date TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_date TIMESTAMP DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100),
    ADD COLUMN IF NOT EXISTS requested_date DATE,
    ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;

-- Seed default booking statuses
INSERT INTO bk_statuses (code, name, description, is_active, is_terminal, allows_edit, allows_cancel, display_order, color, icon)
VALUES
    ('pending',   'Pending',   'Booking awaiting admin review',  TRUE, FALSE, TRUE,  TRUE,  1, '#F59E0B', 'clock'),
    ('confirmed', 'Confirmed', 'Booking confirmed by admin',     TRUE, FALSE, TRUE,  TRUE,  2, '#10B981', 'check-circle'),
    ('completed', 'Completed', 'Booking has been completed',     TRUE, TRUE,  FALSE, FALSE, 3, '#6366F1', 'star'),
    ('cancelled', 'Cancelled', 'Booking was cancelled',          TRUE, TRUE,  FALSE, FALSE, 4, '#EF4444', 'x-circle')
ON CONFLICT (code) DO NOTHING;

-- Seed default booking types
INSERT INTO bk_types (code, name, description, entity_type, is_active)
VALUES
    ('EVENT', 'Event Booking', 'Booking for an event or activity', 'EVENT', TRUE),
    ('PLACE', 'Place Booking', 'Booking / reservation for a place', 'PLACE', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Seed default cancellation & edit conditions
INSERT INTO bk_conditions (booking_type_code, condition_type, condition_value, description, is_active)
VALUES
    ('EVENT', 'CANCEL_WITHIN_DAYS',      '3', 'Free cancellation allowed within 3 days of booking date',  TRUE),
    ('EVENT', 'CANCEL_BEFORE_EVENT_DAYS','1', 'Cancellation must be made at least 1 day before the event', TRUE),
    ('EVENT', 'EDIT_WITHIN_DAYS',        '3', 'Editing allowed within 3 days of booking date',             TRUE),
    ('PLACE', 'CANCEL_WITHIN_DAYS',      '7', 'Free cancellation allowed within 7 days of booking date',  TRUE),
    ('PLACE', 'CANCEL_BEFORE_EVENT_DAYS','2', 'Cancellation must be made at least 2 days before the visit',TRUE),
    ('PLACE', 'EDIT_WITHIN_DAYS',        '7', 'Editing allowed within 7 days of booking date',             TRUE);

-- Seed default Terms & Conditions for each booking type
INSERT INTO bk_terms (booking_type_code, title, content, version, is_active, effective_from)
VALUES
    ('EVENT', 'Event Booking Terms & Conditions',
     'By booking an event through Travel Sri Lanka Now, you agree to the following terms:

1. BOOKING CONFIRMATION
   Your booking is confirmed upon receipt of confirmation email. Full payment may be required to secure your spot.

2. CANCELLATION POLICY
   - Free cancellation within 3 days of booking date
   - Cancellations must be made at least 24 hours before the event
   - Late cancellations may incur a cancellation fee

3. MODIFICATIONS
   - Bookings may be edited within 3 days of the original booking date
   - Changes are subject to availability

4. RESPONSIBILITY
   Travel Sri Lanka Now acts as an intermediary. We are not liable for changes made by event organizers.

5. PARTICIPANT CONDUCT
   All participants are expected to follow the rules set by the event organizer.',
     1, TRUE, CURRENT_DATE),
    ('PLACE', 'Place Reservation Terms & Conditions',
     'By making a reservation through Travel Sri Lanka Now, you agree to the following terms:

1. RESERVATION CONFIRMATION
   Your reservation is confirmed upon receipt of confirmation email.

2. CANCELLATION POLICY
   - Free cancellation within 7 days of booking date
   - Cancellations must be made at least 2 days before your visit date
   - Late cancellations may incur a fee

3. MODIFICATIONS
   - Reservations may be modified within 7 days of the original booking date
   - Changes are subject to availability

4. CHECK-IN / CHECK-OUT
   Please adhere to the check-in and check-out times specified by the property.

5. VISITOR CONDUCT
   All visitors must comply with the rules and regulations of the property.',
     1, TRUE, CURRENT_DATE);
