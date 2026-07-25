-- subtitle was left at the default varchar(255) while every other free-text
-- field on this entity (description, config) is TEXT, so anything over 255
-- chars failed with a raw "value too long" DB error surfaced to the admin as
-- a misleading generic 409 "already exists".
ALTER TABLE homepage_sections ALTER COLUMN subtitle TYPE TEXT;
