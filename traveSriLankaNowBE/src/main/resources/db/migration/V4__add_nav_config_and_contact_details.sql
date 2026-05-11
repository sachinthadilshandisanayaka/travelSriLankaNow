-- Nav Config table for dynamic navigation bar management
CREATE TABLE IF NOT EXISTS nav_config (
    id BIGSERIAL PRIMARY KEY,
    route_path VARCHAR(255) NOT NULL,
    label_key VARCHAR(100) NOT NULL,
    label_override VARCHAR(100),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    is_fixed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed default nav links matching current navbar
INSERT INTO nav_config (route_path, label_key, label_override, display_order, is_visible, is_fixed) VALUES
    ('/',          'nav.home',      NULL, 1, TRUE, TRUE),
    ('/locations', 'nav.locations', NULL, 2, TRUE, FALSE),
    ('/events',    'nav.events',    NULL, 3, TRUE, FALSE),
    ('/gallery',   'nav.gallery',   NULL, 4, TRUE, FALSE),
    ('/places',    'nav.places',    NULL, 5, TRUE, FALSE);

-- Contact Details table — polymorphic, attaches to any entity
CREATE TABLE IF NOT EXISTS contact_details (
    id BIGSERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    contact_type VARCHAR(30) NOT NULL,
    value VARCHAR(500) NOT NULL,
    label VARCHAR(100),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT contact_details_contact_type_check
        CHECK (contact_type IN (
            'PHONE','EMAIL','WHATSAPP','TELEGRAM','VIBER','WECHAT','LINE',
            'WEBSITE','FACEBOOK','INSTAGRAM','YOUTUBE','TWITTER','TIKTOK','LINKEDIN'
        )),
    CONSTRAINT contact_details_entity_type_check
        CHECK (entity_type IN ('LOCATION','EVENT','PLACE','MORE_SECTION_ITEM'))
);

CREATE INDEX IF NOT EXISTS idx_contact_details_entity ON contact_details (entity_type, entity_id);
