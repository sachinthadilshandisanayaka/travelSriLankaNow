-- ============================================================
-- Initial Data for Travel Sri Lanka Now
-- This script runs ONLY ONCE when the database is first created.
-- PostgreSQL skips it if the database volume already has data.
-- ============================================================

-- Master Data: Event Categories
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('EVENT_CATEGORY', 'cultural', 'Cultural', 1, true, '#8B5CF6', NOW(), NOW()),
('EVENT_CATEGORY', 'adventure', 'Adventure', 2, true, '#F59E0B', NOW(), NOW()),
('EVENT_CATEGORY', 'food', 'Food', 3, true, '#EF4444', NOW(), NOW()),
('EVENT_CATEGORY', 'festival', 'Festival', 4, true, '#EC4899', NOW(), NOW()),
('EVENT_CATEGORY', 'tour', 'Tour', 5, true, '#3B82F6', NOW(), NOW());

-- Master Data: Location Categories
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('LOCATION_CATEGORY', 'beach', 'Beach', 1, true, '#06B6D4', NOW(), NOW()),
('LOCATION_CATEGORY', 'mountain', 'Mountain', 2, true, '#10B981', NOW(), NOW()),
('LOCATION_CATEGORY', 'cultural', 'Cultural', 3, true, '#8B5CF6', NOW(), NOW()),
('LOCATION_CATEGORY', 'wildlife', 'Wildlife', 4, true, '#F59E0B', NOW(), NOW()),
('LOCATION_CATEGORY', 'city', 'City', 5, true, '#6366F1', NOW(), NOW());

-- Master Data: Regions
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('REGION', 'north', 'North', 1, true, '#3B82F6', NOW(), NOW()),
('REGION', 'south', 'South', 2, true, '#10B981', NOW(), NOW()),
('REGION', 'east', 'East', 3, true, '#F59E0B', NOW(), NOW()),
('REGION', 'west', 'West', 4, true, '#EF4444', NOW(), NOW()),
('REGION', 'central', 'Central', 5, true, '#8B5CF6', NOW(), NOW());

-- Master Data: Place Types
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('PLACE_TYPE', 'hotel', 'Hotel', 1, true, '#3B82F6', NOW(), NOW()),
('PLACE_TYPE', 'restaurant', 'Restaurant', 2, true, '#F59E0B', NOW(), NOW()),
('PLACE_TYPE', 'cafe', 'Cafe', 3, true, '#06B6D4', NOW(), NOW()),
('PLACE_TYPE', 'guesthouse', 'Guesthouse', 4, true, '#14B8A6', NOW(), NOW()),
('PLACE_TYPE', 'resort', 'Resort', 5, true, '#8B5CF6', NOW(), NOW());

-- Master Data: Price Ranges
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('PRICE_RANGE', '$', 'Budget ($)', 1, true, '#10B981', NOW(), NOW()),
('PRICE_RANGE', '$$', 'Moderate ($$)', 2, true, '#3B82F6', NOW(), NOW()),
('PRICE_RANGE', '$$$', 'Expensive ($$$)', 3, true, '#F59E0B', NOW(), NOW()),
('PRICE_RANGE', '$$$$', 'Luxury ($$$$)', 4, true, '#EF4444', NOW(), NOW());

-- Master Data: Gallery Categories
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('GALLERY_CATEGORY', 'beach', 'Beach', 1, true, '#06B6D4', NOW(), NOW()),
('GALLERY_CATEGORY', 'mountain', 'Mountain', 2, true, '#10B981', NOW(), NOW()),
('GALLERY_CATEGORY', 'cultural', 'Cultural', 3, true, '#8B5CF6', NOW(), NOW()),
('GALLERY_CATEGORY', 'wildlife', 'Wildlife', 4, true, '#F59E0B', NOW(), NOW()),
('GALLERY_CATEGORY', 'food', 'Food', 5, true, '#EF4444', NOW(), NOW()),
('GALLERY_CATEGORY', 'people', 'People', 6, true, '#EC4899', NOW(), NOW()),
('GALLERY_CATEGORY', 'architecture', 'Architecture', 7, true, '#6366F1', NOW(), NOW());

-- Master Data: Gallery Types
INSERT INTO master_data (type, code, display_name, sort_order, is_active, color, created_at, updated_at) VALUES
('GALLERY_TYPE', 'image', 'Image', 1, true, '#3B82F6', NOW(), NOW()),
('GALLERY_TYPE', 'video', 'Video', 2, true, '#EF4444', NOW(), NOW());

-- Site Settings: Contact Info
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('CONTACT_EMAIL', 'contact_email', 'Email', 'info@travelsrilankanow.com', 'email', 1, true, NOW(), NOW()),
('CONTACT_PHONE', 'contact_phone', 'Phone', '+94 11 234 5678', 'phone', 1, true, NOW(), NOW()),
('CONTACT_ADDRESS', 'contact_address', 'Address', 'Colombo, Sri Lanka', 'location', 1, true, NOW(), NOW());

-- Site Settings: Social Media
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('SOCIAL_MEDIA', 'social_facebook', 'Facebook', 'https://facebook.com/travelsrilankanow', 'facebook', 1, true, NOW(), NOW()),
('SOCIAL_MEDIA', 'social_instagram', 'Instagram', 'https://instagram.com/travelsrilankanow', 'instagram', 2, true, NOW(), NOW()),
('SOCIAL_MEDIA', 'social_twitter', 'Twitter', 'https://twitter.com/travelsrilankanow', 'twitter', 3, true, NOW(), NOW()),
('SOCIAL_MEDIA', 'social_youtube', 'YouTube', 'https://youtube.com/travelsrilankanow', 'youtube', 4, true, NOW(), NOW());

-- Site Settings: Business Hours
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('BUSINESS_HOURS', 'hours_weekday', 'Weekdays', 'Mon - Fri: 9:00 AM - 6:00 PM', 'clock', 1, true, NOW(), NOW()),
('BUSINESS_HOURS', 'hours_weekend', 'Weekends', 'Sat - Sun: 10:00 AM - 4:00 PM', 'clock', 2, true, NOW(), NOW());

-- Site Settings: General
INSERT INTO site_settings (category, setting_key, label, value, icon, sort_order, is_active, created_at, updated_at) VALUES
('GENERAL', 'site_name', 'Site Name', 'Travel Sri Lanka Now', NULL, 1, true, NOW(), NOW()),
('GENERAL', 'site_tagline', 'Tagline', 'Discover the Pearl of the Indian Ocean', NULL, 2, true, NOW(), NOW());

-- Homepage Sections
INSERT INTO homepage_sections (section_type, title, subtitle, display_order, is_active, config, created_at, updated_at) VALUES
('HERO_SLIDER', 'Hero Slider', 'Stunning visuals of Sri Lanka', 1, true, '{"autoPlay":true,"displayDuration":5000}', NOW(), NOW()),
('FEATURED_LOCATIONS', 'Featured Locations', 'Discover amazing destinations across Sri Lanka', 2, true, '{"itemsCount":6,"showViewAll":true}', NOW(), NOW()),
('UPCOMING_EVENTS', 'Upcoming Events', 'Don''t miss these exciting events', 3, true, '{"itemsCount":6,"showViewAll":true}', NOW(), NOW()),
('PLACES', 'Where to Stay', 'Find the perfect place for your journey', 4, true, '{"itemsCount":6,"showViewAll":true}', NOW(), NOW()),
('SOCIAL_MEDIA', 'Follow Us', 'Stay connected on social media', 5, true, '{"itemsCount":8,"showViewAll":false}', NOW(), NOW());
