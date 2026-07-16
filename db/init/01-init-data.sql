-- ============================================================
-- Initial Data for Travel Sri Lanka Now
-- This script runs ONLY ONCE when the database is first created.
-- PostgreSQL skips it if the database volume already has data.
-- ============================================================

-- Create tables (Hibernate will manage them later, but we need them for initial data)
CREATE TABLE IF NOT EXISTS master_data (
    id BIGSERIAL PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    code VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    sort_order INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    color VARCHAR(255),
    icon VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    UNIQUE (type, code)
);

CREATE TABLE IF NOT EXISTS site_settings (
    id BIGSERIAL PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    setting_key VARCHAR(255) NOT NULL UNIQUE,
    label VARCHAR(255) NOT NULL,
    value TEXT,
    icon VARCHAR(255),
    sort_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homepage_sections (
    id BIGSERIAL PRIMARY KEY,
    section_type VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    config TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Master Data: Event Categories
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('EVENT_CATEGORY', 'cultural', 'Cultural', 1, true, '#8B5CF6', NOW(), NOW()),
('EVENT_CATEGORY', 'adventure', 'Adventure', 2, true, '#F59E0B', NOW(), NOW()),
('EVENT_CATEGORY', 'food', 'Food', 3, true, '#EF4444', NOW(), NOW()),
('EVENT_CATEGORY', 'festival', 'Festival', 4, true, '#EC4899', NOW(), NOW()),
('EVENT_CATEGORY', 'tour', 'Tour', 5, true, '#3B82F6', NOW(), NOW());

-- Master Data: Location Categories
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('LOCATION_CATEGORY', 'beach', 'Beach', 1, true, '#06B6D4', NOW(), NOW()),
('LOCATION_CATEGORY', 'mountain', 'Mountain', 2, true, '#10B981', NOW(), NOW()),
('LOCATION_CATEGORY', 'cultural', 'Cultural', 3, true, '#8B5CF6', NOW(), NOW()),
('LOCATION_CATEGORY', 'wildlife', 'Wildlife', 4, true, '#F59E0B', NOW(), NOW()),
('LOCATION_CATEGORY', 'city', 'City', 5, true, '#6366F1', NOW(), NOW());

-- Master Data: Regions
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('REGION', 'north', 'North', 1, true, '#3B82F6', NOW(), NOW()),
('REGION', 'south', 'South', 2, true, '#10B981', NOW(), NOW()),
('REGION', 'east', 'East', 3, true, '#F59E0B', NOW(), NOW()),
('REGION', 'west', 'West', 4, true, '#EF4444', NOW(), NOW()),
('REGION', 'central', 'Central', 5, true, '#8B5CF6', NOW(), NOW());

-- Master Data: Place Types
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('PLACE_TYPE', 'hotel', 'Hotel', 1, true, '#3B82F6', NOW(), NOW()),
('PLACE_TYPE', 'restaurant', 'Restaurant', 2, true, '#F59E0B', NOW(), NOW()),
('PLACE_TYPE', 'cafe', 'Cafe', 3, true, '#06B6D4', NOW(), NOW()),
('PLACE_TYPE', 'guesthouse', 'Guesthouse', 4, true, '#14B8A6', NOW(), NOW()),
('PLACE_TYPE', 'resort', 'Resort', 5, true, '#8B5CF6', NOW(), NOW());

-- Master Data: Price Ranges
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('PRICE_RANGE', '$', 'Budget ($)', 1, true, '#10B981', NOW(), NOW()),
('PRICE_RANGE', '$$', 'Moderate ($$)', 2, true, '#3B82F6', NOW(), NOW()),
('PRICE_RANGE', '$$$', 'Expensive ($$$)', 3, true, '#F59E0B', NOW(), NOW()),
('PRICE_RANGE', '$$$$', 'Luxury ($$$$)', 4, true, '#EF4444', NOW(), NOW());

-- Master Data: Gallery Categories
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('GALLERY_CATEGORY', 'beach', 'Beach', 1, true, '#06B6D4', NOW(), NOW()),
('GALLERY_CATEGORY', 'mountain', 'Mountain', 2, true, '#10B981', NOW(), NOW()),
('GALLERY_CATEGORY', 'cultural', 'Cultural', 3, true, '#8B5CF6', NOW(), NOW()),
('GALLERY_CATEGORY', 'wildlife', 'Wildlife', 4, true, '#F59E0B', NOW(), NOW()),
('GALLERY_CATEGORY', 'food', 'Food', 5, true, '#EF4444', NOW(), NOW()),
('GALLERY_CATEGORY', 'people', 'People', 6, true, '#EC4899', NOW(), NOW()),
('GALLERY_CATEGORY', 'architecture', 'Architecture', 7, true, '#6366F1', NOW(), NOW());

-- Master Data: Gallery Types
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('GALLERY_TYPE', 'image', 'Image', 1, true, '#3B82F6', NOW(), NOW()),
('GALLERY_TYPE', 'video', 'Video', 2, true, '#EF4444', NOW(), NOW());

-- Site Settings: Contact Info
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('CONTACT_EMAIL', 'contact_email', 'Email', 'info@travelsrilankanow.com', 'email', 1, true, NOW(), NOW()),
('CONTACT_PHONE', 'contact_phone', 'Phone', '+94 11 234 5678', 'phone', 1, true, NOW(), NOW()),
('CONTACT_ADDRESS', 'contact_address', 'Address', 'Colombo, Sri Lanka', 'location', 1, true, NOW(), NOW());

-- Site Settings: Social Media
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('SOCIAL_MEDIA', 'social_facebook', 'Facebook', 'https://facebook.com/travelsrilankanow', 'facebook', 1, true, NOW(), NOW()),
('SOCIAL_MEDIA', 'social_instagram', 'Instagram', 'https://instagram.com/travelsrilankanow', 'instagram', 2, true, NOW(), NOW()),
('SOCIAL_MEDIA', 'social_twitter', 'Twitter', 'https://twitter.com/travelsrilankanow', 'twitter', 3, true, NOW(), NOW()),
('SOCIAL_MEDIA', 'social_youtube', 'YouTube', 'https://youtube.com/travelsrilankanow', 'youtube', 4, true, NOW(), NOW());

-- Site Settings: Business Hours
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('BUSINESS_HOURS', 'hours_weekday', 'Weekdays', 'Mon - Fri: 9:00 AM - 6:00 PM', 'clock', 1, true, NOW(), NOW()),
('BUSINESS_HOURS', 'hours_weekend', 'Weekends', 'Sat - Sun: 10:00 AM - 4:00 PM', 'clock', 2, true, NOW(), NOW());

-- Site Settings: General
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('GENERAL', 'site_name', 'Site Name', 'Travel Sri Lanka Now', NULL, 1, true, NOW(), NOW()),
('GENERAL', 'site_tagline', 'Tagline', 'Discover the Pearl of the Indian Ocean', NULL, 2, true, NOW(), NOW());

-- Homepage Sections
INSERT INTO homepage_sections (section_type, title, subtitle, display_order, is_active, config, created_at, updated_at) VALUES
('HERO_SLIDER', 'Hero Slider', 'Stunning visuals of Sri Lanka', 1, true, '{"autoPlay":true,"displayDuration":5000}', NOW(), NOW()),
('FEATURED_LOCATIONS', 'Featured Locations', 'Discover amazing destinations across Sri Lanka', 2, true, '{"itemsCount":6,"showViewAll":true}', NOW(), NOW()),
('UPCOMING_EVENTS', 'Upcoming Events', 'Don''t miss these exciting events', 3, true, '{"itemsCount":6,"showViewAll":true}', NOW(), NOW()),
('PLACES', 'Where to Stay', 'Find the perfect place for your journey', 4, true, '{"itemsCount":6,"showViewAll":true}', NOW(), NOW()),
('SOCIAL_MEDIA', 'Follow Us', 'Stay connected on social media', 5, true, '{"itemsCount":8,"showViewAll":false}', NOW(), NOW());

-- Site Settings: Additional keys (logo, footer, floating social)
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('GENERAL', 'logo_url',                'Site Logo',               'assets/images/Logo_without_bg.png', 'image', 0,  true, NOW(), NOW()),
('GENERAL', 'footer_description',      'Footer Description',      'Discover the pearl of the Indian Ocean. Explore pristine beaches, ancient temples, lush tea plantations, and vibrant wildlife.', 'info', 3, true, NOW(), NOW()),
('GENERAL', 'floating_social_buttons', 'Floating Social Buttons', '[]', 'share', 10, true, NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;

-- ── RBAC: Permissions ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS permissions (
    id            BIGSERIAL PRIMARY KEY,
    function_code VARCHAR(50)  NOT NULL,
    action        VARCHAR(20)  NOT NULL,
    description   VARCHAR(200),
    CONSTRAINT uq_perm UNIQUE (function_code, action)
);

CREATE TABLE IF NOT EXISTS admin_roles (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(50)  UNIQUE NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_system_role BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_role_permissions (
    role_id       BIGINT NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

INSERT INTO permissions (function_code, action, description) VALUES
('DASHBOARD','VIEW','View dashboard overview'),
('LOCATIONS','VIEW','View locations'),('LOCATIONS','CREATE','Create locations'),('LOCATIONS','UPDATE','Edit locations'),('LOCATIONS','DELETE','Delete locations'),
('EVENTS','VIEW','View events'),('EVENTS','CREATE','Create events'),('EVENTS','UPDATE','Edit events'),('EVENTS','DELETE','Delete events'),
('PLACES','VIEW','View places'),('PLACES','CREATE','Create places'),('PLACES','UPDATE','Edit places'),('PLACES','DELETE','Delete places'),
('GALLERY','VIEW','View gallery'),('GALLERY','CREATE','Upload gallery items'),('GALLERY','UPDATE','Edit gallery items'),('GALLERY','DELETE','Delete gallery items'),
('HERO_SLIDES','VIEW','View hero slides'),('HERO_SLIDES','CREATE','Create hero slides'),('HERO_SLIDES','UPDATE','Edit / reorder hero slides'),('HERO_SLIDES','DELETE','Delete hero slides'),
('PAGE_HEADERS','VIEW','View page header backgrounds'),('PAGE_HEADERS','CREATE','Create page header backgrounds'),('PAGE_HEADERS','UPDATE','Edit page header backgrounds'),('PAGE_HEADERS','DELETE','Delete page header backgrounds'),
('HOMEPAGE_SECTIONS','VIEW','View homepage sections'),('HOMEPAGE_SECTIONS','CREATE','Create homepage sections'),('HOMEPAGE_SECTIONS','UPDATE','Edit / reorder homepage sections'),('HOMEPAGE_SECTIONS','DELETE','Delete homepage sections'),
('MORE_SECTIONS','VIEW','View custom CMS sections'),('MORE_SECTIONS','CREATE','Create custom CMS sections'),('MORE_SECTIONS','UPDATE','Edit custom CMS sections'),('MORE_SECTIONS','DELETE','Delete custom CMS sections'),
('NAV_CONFIG','VIEW','View navigation config'),('NAV_CONFIG','UPDATE','Edit navigation config'),
('SOCIAL_MEDIA','VIEW','View social media content'),('SOCIAL_MEDIA','CREATE','Create social media content'),('SOCIAL_MEDIA','UPDATE','Edit social media content'),('SOCIAL_MEDIA','DELETE','Delete social media content'),
('SITE_SETTINGS','VIEW','View site settings'),('SITE_SETTINGS','CREATE','Create site settings'),('SITE_SETTINGS','UPDATE','Edit site settings'),('SITE_SETTINGS','DELETE','Delete site settings'),
('CONTACT_DETAILS','VIEW','View contact details'),('CONTACT_DETAILS','CREATE','Create contact details'),('CONTACT_DETAILS','UPDATE','Edit contact details'),('CONTACT_DETAILS','DELETE','Delete contact details'),
('MASTER_DATA','VIEW','View master data'),('MASTER_DATA','CREATE','Create master data entries'),('MASTER_DATA','UPDATE','Edit master data entries'),('MASTER_DATA','DELETE','Delete master data entries'),
('ENTITY_FIELDS','VIEW','View entity field configs'),('ENTITY_FIELDS','UPDATE','Edit entity field configs'),
('MEDIA','VIEW','View media library'),('MEDIA','CREATE','Upload media'),('MEDIA','UPDATE','Edit media metadata'),('MEDIA','DELETE','Delete media'),
('BOOKINGS','VIEW','View bookings'),('BOOKINGS','UPDATE','Update booking status'),('BOOKINGS','EXPORT','Export booking data'),
('BOOKING_SETTINGS','VIEW','View booking settings'),('BOOKING_SETTINGS','CREATE','Create booking settings'),('BOOKING_SETTINGS','UPDATE','Edit booking settings'),('BOOKING_SETTINGS','DELETE','Delete booking settings'),
('USER_MANAGEMENT','VIEW','View admin users'),('USER_MANAGEMENT','CREATE','Create admin users'),('USER_MANAGEMENT','UPDATE','Edit admin users'),('USER_MANAGEMENT','DELETE','Delete / deactivate admin users'),
('ROLE_MANAGEMENT','VIEW','View roles'),('ROLE_MANAGEMENT','CREATE','Create custom roles'),('ROLE_MANAGEMENT','UPDATE','Edit roles and permissions'),('ROLE_MANAGEMENT','DELETE','Delete custom roles')
ON CONFLICT (function_code, action) DO NOTHING;

INSERT INTO admin_roles (code, name, description, is_system_role) VALUES
('SUPER_ADMIN',       'Super Administrator', 'Full unrestricted access to all features',           TRUE),
('CONTENT_MANAGER',   'Content Manager',     'Manage all site content',                            TRUE),
('BOOKING_MANAGER',   'Booking Manager',     'Manage bookings and booking configuration',          TRUE),
('MASTER_DATA_ADMIN', 'Master Data Admin',   'Manage master data and entity field configs',        TRUE),
('MEDIA_MANAGER',     'Media Manager',       'Manage the media library',                           TRUE),
('READONLY_VIEWER',   'Read-Only Viewer',    'View access to all features, no modifications',      TRUE)
ON CONFLICT (code) DO NOTHING;

-- SUPER_ADMIN gets all permissions
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM admin_roles r, permissions p WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- Default navigation bar items
CREATE TABLE IF NOT EXISTS nav_config (
    id BIGSERIAL PRIMARY KEY,
    route_path VARCHAR(255) NOT NULL UNIQUE,
    label_key VARCHAR(100) NOT NULL,
    label_override VARCHAR(100),
    display_order INTEGER NOT NULL DEFAULT 0,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    is_fixed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO nav_config (route_path, label_key, label_override, display_order, is_visible, is_fixed) VALUES
    ('/',          'nav.home',      NULL, 1, TRUE, TRUE),
    ('/locations', 'nav.locations', NULL, 2, TRUE, FALSE),
    ('/events',    'nav.events',    NULL, 3, TRUE, FALSE),
    ('/gallery',   'nav.gallery',   NULL, 4, TRUE, FALSE),
    ('/places',    'nav.places',    NULL, 5, TRUE, FALSE)
ON CONFLICT (route_path) DO NOTHING;

-- Booking Types (referenced as FK by event_bookings.booking_type)
CREATE TABLE IF NOT EXISTS bk_types (
    id          BIGSERIAL    PRIMARY KEY,
    code        VARCHAR(50)  UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(20)  NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO bk_types (code, name, description, entity_type, is_active) VALUES
    ('EVENT', 'Event Booking', 'Booking for an event or activity',   'EVENT', TRUE),
    ('PLACE', 'Place Booking', 'Booking / reservation for a place',  'PLACE', TRUE)
ON CONFLICT (code) DO NOTHING;
