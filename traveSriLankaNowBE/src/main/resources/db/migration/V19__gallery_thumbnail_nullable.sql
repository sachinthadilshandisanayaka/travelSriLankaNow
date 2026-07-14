-- thumbnail_url is no longer required — gallery uses the main url directly.
-- V1 intended this but the column remained NOT NULL on some DB instances.
ALTER TABLE gallery_items ALTER COLUMN thumbnail_url DROP NOT NULL;
