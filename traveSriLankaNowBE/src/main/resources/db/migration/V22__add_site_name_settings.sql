INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at)
VALUES
  ('GENERAL', 'site_name',    'Site Name',    'Travel Sri Lanka Now',     'globe', 1, true, NOW(), NOW()),
  ('GENERAL', 'site_tagline', 'Site Tagline', 'Explore Beautiful Sri Lanka', 'info', 2, true, NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;
