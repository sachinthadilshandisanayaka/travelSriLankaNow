-- Add SEO-friendly slug to more_section_items
ALTER TABLE more_section_items ADD COLUMN slug VARCHAR(255);

-- Generate initial slugs from titles: lowercase, non-alphanumeric → hyphens,
-- strip leading/trailing hyphens. Duplicates get -id appended (first match stays clean).
WITH base_slugs AS (
    SELECT id,
           COALESCE(
               NULLIF(
                   REGEXP_REPLACE(LOWER(TRIM(title)), '[^a-z0-9]+', '-', 'g'),
                   ''
               ),
               'item'
           ) AS base_slug
    FROM more_section_items
),
ranked AS (
    SELECT id,
           TRIM(BOTH '-' FROM base_slug) AS base_slug,
           ROW_NUMBER() OVER (PARTITION BY TRIM(BOTH '-' FROM base_slug) ORDER BY id) AS rn
    FROM base_slugs
)
UPDATE more_section_items
SET slug = CASE
    WHEN r.rn = 1 THEN r.base_slug
    ELSE r.base_slug || '-' || more_section_items.id
END
FROM ranked r
WHERE more_section_items.id = r.id;

-- Safety net for any remaining NULLs
UPDATE more_section_items SET slug = 'item-' || id WHERE slug IS NULL OR slug = '';

ALTER TABLE more_section_items ALTER COLUMN slug SET NOT NULL;
ALTER TABLE more_section_items ADD CONSTRAINT uq_more_section_items_slug UNIQUE (slug);
