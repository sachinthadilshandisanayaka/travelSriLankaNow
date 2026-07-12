INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at)
VALUES ('GENERAL', 'logo_url', 'Site Logo', 'assets/images/Logo_without_bg.png', 'image', 0, true, NOW(), NOW())
ON CONFLICT (setting_key) DO NOTHING;
