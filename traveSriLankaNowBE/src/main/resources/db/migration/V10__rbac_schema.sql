-- V10: RBAC - Roles, Permissions, and Admin Role assignments

-- 1. Granular permissions (function × action pairs)
CREATE TABLE IF NOT EXISTS permissions (
    id          BIGSERIAL PRIMARY KEY,
    function_code VARCHAR(50)  NOT NULL,
    action        VARCHAR(20)  NOT NULL,
    description   VARCHAR(200),
    CONSTRAINT uq_perm UNIQUE (function_code, action)
);

-- 2. Named admin roles
CREATE TABLE IF NOT EXISTS admin_roles (
    id             BIGSERIAL PRIMARY KEY,
    code           VARCHAR(50)  UNIQUE NOT NULL,
    name           VARCHAR(100) NOT NULL,
    description    TEXT,
    is_system_role BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at     TIMESTAMP             DEFAULT CURRENT_TIMESTAMP
);

-- 3. Many-to-many join: role ↔ permissions
CREATE TABLE IF NOT EXISTS admin_role_permissions (
    role_id       BIGINT NOT NULL REFERENCES admin_roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 4. Link admin users to their admin role
ALTER TABLE users ADD COLUMN IF NOT EXISTS admin_role_id BIGINT REFERENCES admin_roles(id);

-- ============================================================
-- SEED: All 72 permissions
-- ============================================================
INSERT INTO permissions (function_code, action, description) VALUES
-- Dashboard
('DASHBOARD','VIEW','View dashboard overview'),
-- Locations
('LOCATIONS','VIEW','View locations'),
('LOCATIONS','CREATE','Create locations'),
('LOCATIONS','UPDATE','Edit locations'),
('LOCATIONS','DELETE','Delete locations'),
-- Events
('EVENTS','VIEW','View events'),
('EVENTS','CREATE','Create events'),
('EVENTS','UPDATE','Edit events'),
('EVENTS','DELETE','Delete events'),
-- Places
('PLACES','VIEW','View places'),
('PLACES','CREATE','Create places'),
('PLACES','UPDATE','Edit places'),
('PLACES','DELETE','Delete places'),
-- Gallery
('GALLERY','VIEW','View gallery'),
('GALLERY','CREATE','Upload gallery items'),
('GALLERY','UPDATE','Edit gallery items'),
('GALLERY','DELETE','Delete gallery items'),
-- Hero Slides
('HERO_SLIDES','VIEW','View hero slides'),
('HERO_SLIDES','CREATE','Create hero slides'),
('HERO_SLIDES','UPDATE','Edit / reorder hero slides'),
('HERO_SLIDES','DELETE','Delete hero slides'),
-- Page Headers
('PAGE_HEADERS','VIEW','View page header backgrounds'),
('PAGE_HEADERS','CREATE','Create page header backgrounds'),
('PAGE_HEADERS','UPDATE','Edit page header backgrounds'),
('PAGE_HEADERS','DELETE','Delete page header backgrounds'),
-- Homepage Sections
('HOMEPAGE_SECTIONS','VIEW','View homepage sections'),
('HOMEPAGE_SECTIONS','CREATE','Create homepage sections'),
('HOMEPAGE_SECTIONS','UPDATE','Edit / reorder homepage sections'),
('HOMEPAGE_SECTIONS','DELETE','Delete homepage sections'),
-- More Sections (CMS)
('MORE_SECTIONS','VIEW','View custom CMS sections'),
('MORE_SECTIONS','CREATE','Create custom CMS sections'),
('MORE_SECTIONS','UPDATE','Edit custom CMS sections'),
('MORE_SECTIONS','DELETE','Delete custom CMS sections'),
-- Nav Config
('NAV_CONFIG','VIEW','View navigation config'),
('NAV_CONFIG','UPDATE','Edit navigation config'),
-- Social Media
('SOCIAL_MEDIA','VIEW','View social media content'),
('SOCIAL_MEDIA','CREATE','Create social media content'),
('SOCIAL_MEDIA','UPDATE','Edit social media content'),
('SOCIAL_MEDIA','DELETE','Delete social media content'),
-- Site Settings
('SITE_SETTINGS','VIEW','View site settings'),
('SITE_SETTINGS','CREATE','Create site settings'),
('SITE_SETTINGS','UPDATE','Edit site settings'),
('SITE_SETTINGS','DELETE','Delete site settings'),
-- Contact Details
('CONTACT_DETAILS','VIEW','View contact details'),
('CONTACT_DETAILS','CREATE','Create contact details'),
('CONTACT_DETAILS','UPDATE','Edit contact details'),
('CONTACT_DETAILS','DELETE','Delete contact details'),
-- Master Data
('MASTER_DATA','VIEW','View master data'),
('MASTER_DATA','CREATE','Create master data entries'),
('MASTER_DATA','UPDATE','Edit master data entries'),
('MASTER_DATA','DELETE','Delete master data entries'),
-- Entity Fields
('ENTITY_FIELDS','VIEW','View entity field configs'),
('ENTITY_FIELDS','UPDATE','Edit entity field configs'),
-- Media
('MEDIA','VIEW','View media library'),
('MEDIA','CREATE','Upload media'),
('MEDIA','UPDATE','Edit media metadata'),
('MEDIA','DELETE','Delete media'),
-- Bookings
('BOOKINGS','VIEW','View bookings'),
('BOOKINGS','UPDATE','Update booking status'),
('BOOKINGS','EXPORT','Export booking data'),
-- Booking Settings
('BOOKING_SETTINGS','VIEW','View booking settings'),
('BOOKING_SETTINGS','CREATE','Create booking settings'),
('BOOKING_SETTINGS','UPDATE','Edit booking settings'),
('BOOKING_SETTINGS','DELETE','Delete booking settings'),
-- User Management (admin users)
('USER_MANAGEMENT','VIEW','View admin users'),
('USER_MANAGEMENT','CREATE','Create admin users'),
('USER_MANAGEMENT','UPDATE','Edit admin users'),
('USER_MANAGEMENT','DELETE','Delete / deactivate admin users'),
-- Role Management
('ROLE_MANAGEMENT','VIEW','View roles'),
('ROLE_MANAGEMENT','CREATE','Create custom roles'),
('ROLE_MANAGEMENT','UPDATE','Edit roles and permissions'),
('ROLE_MANAGEMENT','DELETE','Delete custom roles')
ON CONFLICT (function_code, action) DO NOTHING;

-- ============================================================
-- SEED: Default roles
-- ============================================================
INSERT INTO admin_roles (code, name, description, is_system_role) VALUES
('SUPER_ADMIN',      'Super Administrator', 'Full unrestricted access to all features', TRUE),
('CONTENT_MANAGER',  'Content Manager',     'Manage all site content: events, places, gallery, CMS sections, etc.', TRUE),
('BOOKING_MANAGER',  'Booking Manager',     'Manage bookings and booking configuration', TRUE),
('MASTER_DATA_ADMIN','Master Data Admin',   'Manage master data and entity field configs', TRUE),
('MEDIA_MANAGER',    'Media Manager',       'Manage the media library', TRUE),
('READONLY_VIEWER',  'Read-Only Viewer',    'View access to all features, no modifications', TRUE)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- SEED: Assign permissions to SUPER_ADMIN (all permissions)
-- ============================================================
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r, permissions p
WHERE r.code = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: CONTENT_MANAGER permissions
-- ============================================================
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN permissions p ON p.function_code IN (
    'DASHBOARD','LOCATIONS','EVENTS','PLACES','GALLERY',
    'HERO_SLIDES','PAGE_HEADERS','HOMEPAGE_SECTIONS','MORE_SECTIONS',
    'NAV_CONFIG','SOCIAL_MEDIA','SITE_SETTINGS','CONTACT_DETAILS',
    'MEDIA','ENTITY_FIELDS'
)
WHERE r.code = 'CONTENT_MANAGER'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: BOOKING_MANAGER permissions
-- ============================================================
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN permissions p ON (
    (p.function_code = 'DASHBOARD'         AND p.action = 'VIEW') OR
    (p.function_code = 'BOOKINGS')                                 OR
    (p.function_code = 'BOOKING_SETTINGS')                        OR
    (p.function_code = 'LOCATIONS'         AND p.action = 'VIEW') OR
    (p.function_code = 'EVENTS'            AND p.action = 'VIEW') OR
    (p.function_code = 'PLACES'            AND p.action = 'VIEW') OR
    (p.function_code = 'MASTER_DATA'       AND p.action = 'VIEW')
)
WHERE r.code = 'BOOKING_MANAGER'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: MASTER_DATA_ADMIN permissions
-- ============================================================
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN permissions p ON (
    (p.function_code = 'DASHBOARD'         AND p.action = 'VIEW') OR
    (p.function_code = 'MASTER_DATA')                             OR
    (p.function_code = 'ENTITY_FIELDS')                           OR
    (p.function_code = 'BOOKING_SETTINGS')
)
WHERE r.code = 'MASTER_DATA_ADMIN'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: MEDIA_MANAGER permissions
-- ============================================================
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN permissions p ON (
    (p.function_code = 'DASHBOARD' AND p.action = 'VIEW') OR
    (p.function_code = 'MEDIA')
)
WHERE r.code = 'MEDIA_MANAGER'
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: READONLY_VIEWER permissions (VIEW only on everything)
-- ============================================================
INSERT INTO admin_role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM admin_roles r
JOIN permissions p ON p.action = 'VIEW'
WHERE r.code = 'READONLY_VIEWER'
ON CONFLICT DO NOTHING;
