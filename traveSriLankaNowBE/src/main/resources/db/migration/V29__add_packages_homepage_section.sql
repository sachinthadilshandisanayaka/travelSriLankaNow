-- Allow PACKAGES as a valid homepage_sections.section_type

ALTER TABLE homepage_sections DROP CONSTRAINT IF EXISTS homepage_sections_section_type_check;

ALTER TABLE homepage_sections ADD CONSTRAINT homepage_sections_section_type_check
  CHECK (section_type IN (
    'HERO_SLIDER','FEATURED_LOCATIONS','UPCOMING_EVENTS','PLACES','SOCIAL_MEDIA',
    'IMAGE_GALLERY_SLIDER','CUSTOM_CONTENT','PACKAGES'
  ));
