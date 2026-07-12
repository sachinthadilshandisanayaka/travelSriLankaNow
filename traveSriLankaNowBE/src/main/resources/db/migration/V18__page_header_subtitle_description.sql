ALTER TABLE page_header_backgrounds ADD COLUMN IF NOT EXISTS subtitle    VARCHAR(255);
ALTER TABLE page_header_backgrounds ADD COLUMN IF NOT EXISTS description TEXT;

-- Seed the existing active records with the hardcoded values from the Angular page components
UPDATE page_header_backgrounds SET
  title       = 'Explore Locations',
  subtitle    = 'Discover Sri Lanka',
  description = 'Discover the beauty and diversity of Sri Lanka''s most breathtaking destinations'
WHERE page_type = 'LOCATIONS';

UPDATE page_header_backgrounds SET
  title       = 'Events & Festivals',
  subtitle    = 'Experience Sri Lanka',
  description = 'Immerse yourself in the vibrant culture and traditions of Sri Lanka through its colorful events'
WHERE page_type = 'EVENTS';

UPDATE page_header_backgrounds SET
  title       = 'Photo Gallery',
  subtitle    = 'Capture The Moment',
  description = 'Explore the beauty of Sri Lanka through stunning photos and videos'
WHERE page_type = 'GALLERY';

UPDATE page_header_backgrounds SET
  title       = 'Hotels & Restaurants',
  subtitle    = 'Stay & Dine',
  description = 'Find the perfect place to stay and enjoy authentic Sri Lankan cuisine'
WHERE page_type = 'PLACES';
