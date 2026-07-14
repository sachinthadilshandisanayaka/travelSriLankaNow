ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS title_style   TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS subtitle_style TEXT;
ALTER TABLE hero_slides ADD COLUMN IF NOT EXISTS content_align  VARCHAR(10) NOT NULL DEFAULT 'center';
