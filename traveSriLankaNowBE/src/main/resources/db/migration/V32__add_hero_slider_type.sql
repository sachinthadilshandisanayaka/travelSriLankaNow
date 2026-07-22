ALTER TABLE hero_slides
    ADD COLUMN IF NOT EXISTS slider_type VARCHAR(30) DEFAULT 'standard';
