-- Allow PACKAGES as a valid page_header_backgrounds.page_type

ALTER TABLE page_header_backgrounds DROP CONSTRAINT IF EXISTS page_header_backgrounds_page_type_check;

ALTER TABLE page_header_backgrounds ADD CONSTRAINT page_header_backgrounds_page_type_check
  CHECK (page_type IN ('LOCATIONS','EVENTS','GALLERY','PLACES','PACKAGES'));
