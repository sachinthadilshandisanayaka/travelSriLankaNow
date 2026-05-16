-- ============================================================
-- V5: Multi-location events, flexible pricing, customer auth
-- ============================================================

-- 1. Event Locations (ordered stops/waypoints per event)
CREATE TABLE IF NOT EXISTS event_locations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    location_ref_id BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    visit_order INTEGER NOT NULL DEFAULT 0,
    duration_here VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_event_locations_event ON event_locations(event_id);

-- 2. Event Pricing (multi-currency, flexible pricing types)
CREATE TABLE IF NOT EXISTS event_pricing (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    currency_code VARCHAR(10) NOT NULL DEFAULT 'USD',
    amount DECIMAL(14,2) NOT NULL,
    pricing_type VARCHAR(30) NOT NULL DEFAULT 'PER_PERSON',
    group_size INTEGER,
    label VARCHAR(100),
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT event_pricing_type_check
        CHECK (pricing_type IN ('PER_PERSON','GROUP','FULL_EVENT'))
);
CREATE INDEX IF NOT EXISTS idx_event_pricing_event ON event_pricing(event_id);

-- 3. Extend master_data type check constraint to include CURRENCY
ALTER TABLE master_data DROP CONSTRAINT IF EXISTS master_data_type_check;
ALTER TABLE master_data ADD CONSTRAINT master_data_type_check
    CHECK (type IN ('EVENT_CATEGORY','LOCATION_CATEGORY','PLACE_TYPE','REGION',
                    'PRICE_RANGE','GALLERY_CATEGORY','GALLERY_TYPE','CURRENCY'));

-- Seed currencies into master_data
INSERT INTO master_data (type, code, display_name, description, sort_order, is_active, icon, color, created_at)
VALUES
    ('CURRENCY', 'USD', 'US Dollar',          'United States Dollar',   1, TRUE, '$',   '#22c55e', NOW()),
    ('CURRENCY', 'LKR', 'Sri Lankan Rupee',   'Sri Lankan Rupee',       2, TRUE, 'Rs.', '#f59e0b', NOW()),
    ('CURRENCY', 'EUR', 'Euro',               'Euro',                   3, TRUE, '€',   '#3b82f6', NOW()),
    ('CURRENCY', 'GBP', 'British Pound',      'British Pound Sterling', 4, TRUE, '£',   '#8b5cf6', NOW()),
    ('CURRENCY', 'AUD', 'Australian Dollar',  'Australian Dollar',      5, TRUE, 'A$',  '#06b6d4', NOW()),
    ('CURRENCY', 'INR', 'Indian Rupee',       'Indian Rupee',           6, TRUE, '₹',   '#f97316', NOW())
ON CONFLICT (type, code) DO NOTHING;

-- 4. Customer profile extensions on users table
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS google_id VARCHAR(200),
    ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL;

-- 5. Booking enhancements
ALTER TABLE event_bookings
    ADD COLUMN IF NOT EXISTS customer_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS booking_reference VARCHAR(30),
    ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) NOT NULL DEFAULT 'UNPAID';

CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_reference ON event_bookings(booking_reference) WHERE booking_reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON event_bookings(customer_id);

-- Allow bookings without a specific event date
ALTER TABLE event_bookings ALTER COLUMN event_date_id DROP NOT NULL;

-- Backfill booking references for existing bookings
UPDATE event_bookings
SET booking_reference = CONCAT('TSL-', TO_CHAR(booking_date, 'YYYYMM'), '-', LPAD(id::TEXT, 4, '0'))
WHERE booking_reference IS NULL;
