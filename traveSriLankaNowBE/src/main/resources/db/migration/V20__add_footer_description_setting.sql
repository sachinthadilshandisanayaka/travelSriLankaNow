INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at)
VALUES (
  'GENERAL',
  'footer_description',
  'Footer Description',
  'Discover the pearl of the Indian Ocean. Explore pristine beaches, ancient temples, lush tea plantations, and vibrant wildlife.',
  'info',
  3,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (setting_key) DO NOTHING;
