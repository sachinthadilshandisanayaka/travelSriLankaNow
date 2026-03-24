-- Migration: Add article support columns to more_section_items
-- Reason: New article content feature for more section items

ALTER TABLE more_section_items ADD COLUMN IF NOT EXISTS content_type varchar(20) DEFAULT 'simple' NOT NULL;
ALTER TABLE more_section_items ADD COLUMN IF NOT EXISTS article_content TEXT;
