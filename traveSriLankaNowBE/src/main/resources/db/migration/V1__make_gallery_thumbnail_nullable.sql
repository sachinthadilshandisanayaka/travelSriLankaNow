-- Migration: Make gallery thumbnail_url nullable
-- Reason: Thumbnail upload removed from admin UI. Gallery now uses main image (url) directly.

ALTER TABLE gallery_items ALTER COLUMN thumbnail_url DROP NOT NULL;
