-- Dynamic booking form field definitions
CREATE TABLE booking_form_fields (
    id            BIGSERIAL PRIMARY KEY,
    field_key     VARCHAR(100) NOT NULL UNIQUE,
    label         VARCHAR(200) NOT NULL,
    field_type    VARCHAR(50)  NOT NULL,   -- TEXT | TEXTAREA | DROPDOWN | CHECKBOX_GROUP | DATE | NUMBER
    placeholder   VARCHAR(200),
    required      BOOLEAN      NOT NULL DEFAULT FALSE,
    options       TEXT,                    -- JSON array e.g. ["Option A","Option B"]
    display_order INT          NOT NULL DEFAULT 0,
    active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Store custom field answers alongside each booking
ALTER TABLE event_bookings ADD COLUMN IF NOT EXISTS custom_fields TEXT;
