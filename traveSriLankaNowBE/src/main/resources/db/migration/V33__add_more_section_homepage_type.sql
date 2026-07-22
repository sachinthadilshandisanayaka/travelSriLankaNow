-- Add MORE_SECTION to the homepage_sections section_type CHECK constraint.
-- The Java enum already contains MORE_SECTION but the DB constraint was never updated,
-- causing every INSERT with section_type = 'MORE_SECTION' to fail.

ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_type_check;

ALTER TABLE homepage_sections
    ADD CONSTRAINT homepage_sections_section_type_check
    CHECK (section_type IN (
        'HERO_SLIDER',
        'FEATURED_LOCATIONS',
        'UPCOMING_EVENTS',
        'PLACES',
        'SOCIAL_MEDIA',
        'IMAGE_GALLERY_SLIDER',
        'CUSTOM_CONTENT',
        'PACKAGES',
        'CUSTOMER_FEEDBACK',
        'SCROLL_CARDS',
        'MORE_SECTION'
    ));
