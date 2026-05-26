-- Add slug column to events
ALTER TABLE events ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
UPDATE events
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
-- Resolve any collisions by appending the id
UPDATE events e1
SET slug = e1.slug || '-' || e1.id
WHERE EXISTS (
    SELECT 1 FROM events e2
    WHERE e2.slug = e1.slug AND e2.id < e1.id
);
ALTER TABLE events ALTER COLUMN slug SET NOT NULL;
ALTER TABLE events ADD CONSTRAINT events_slug_unique UNIQUE (slug);

-- Add slug column to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
UPDATE locations
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
UPDATE locations l1
SET slug = l1.slug || '-' || l1.id
WHERE EXISTS (
    SELECT 1 FROM locations l2
    WHERE l2.slug = l1.slug AND l2.id < l1.id
);
ALTER TABLE locations ALTER COLUMN slug SET NOT NULL;
ALTER TABLE locations ADD CONSTRAINT locations_slug_unique UNIQUE (slug);

-- Add slug column to places
ALTER TABLE places ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
UPDATE places
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
UPDATE places p1
SET slug = p1.slug || '-' || p1.id
WHERE EXISTS (
    SELECT 1 FROM places p2
    WHERE p2.slug = p1.slug AND p2.id < p1.id
);
ALTER TABLE places ALTER COLUMN slug SET NOT NULL;
ALTER TABLE places ADD CONSTRAINT places_slug_unique UNIQUE (slug);

-- Add slug column to gallery_items
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
UPDATE gallery_items
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'))
WHERE slug IS NULL;
UPDATE gallery_items g1
SET slug = g1.slug || '-' || g1.id
WHERE EXISTS (
    SELECT 1 FROM gallery_items g2
    WHERE g2.slug = g1.slug AND g2.id < g1.id
);
ALTER TABLE gallery_items ALTER COLUMN slug SET NOT NULL;
ALTER TABLE gallery_items ADD CONSTRAINT gallery_items_slug_unique UNIQUE (slug);
