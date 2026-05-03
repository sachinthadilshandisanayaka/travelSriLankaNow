-- Drop unique constraint on section_type to allow multiple CUSTOM_CONTENT sections
DO $$
DECLARE con_name text;
BEGIN
    SELECT tc.constraint_name INTO con_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'homepage_sections'
      AND tc.constraint_type = 'UNIQUE'
      AND ccu.column_name = 'section_type'
    LIMIT 1;
    IF con_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE homepage_sections DROP CONSTRAINT ' || quote_ident(con_name);
    END IF;
END $$;

-- Drop old check constraint and add new one including IMAGE_GALLERY_SLIDER and CUSTOM_CONTENT
ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_type_check;

ALTER TABLE homepage_sections ADD CONSTRAINT homepage_sections_section_type_check
  CHECK (section_type IN (
    'HERO_SLIDER','FEATURED_LOCATIONS','UPCOMING_EVENTS','PLACES','SOCIAL_MEDIA',
    'IMAGE_GALLERY_SLIDER','CUSTOM_CONTENT'
  ));

-- Insert IMAGE_GALLERY_SLIDER section if not exists
INSERT INTO homepage_sections (section_type, title, subtitle, display_order, is_active, config, created_at, updated_at)
SELECT 'IMAGE_GALLERY_SLIDER', 'Photo Gallery', 'Beautiful moments captured across Sri Lanka', 6, false,
       '{"images":[],"speed":30,"pauseOnHover":true}', NOW(), NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM homepage_sections WHERE section_type = 'IMAGE_GALLERY_SLIDER'
);
