-- Migration script to remove enum check constraints after changing to String types
-- Run this script once against your database to remove the old constraints

-- Drop check constraints from gallery_items table
ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS gallery_items_category_check;
ALTER TABLE gallery_items DROP CONSTRAINT IF EXISTS gallery_items_type_check;

-- Drop check constraints from events table
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_category_check;

-- Drop check constraints from locations table
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_category_check;
ALTER TABLE locations DROP CONSTRAINT IF EXISTS locations_region_check;

-- Drop check constraints from places table
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_type_check;
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_region_check;
ALTER TABLE places DROP CONSTRAINT IF EXISTS places_price_range_check;

-- Note: After running this script, the application will accept any string values
-- for these columns, which will be managed by the master data system.
