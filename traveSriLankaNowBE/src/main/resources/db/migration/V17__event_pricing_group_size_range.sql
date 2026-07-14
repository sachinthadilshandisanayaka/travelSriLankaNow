-- Replace single groupSize with min/max range for GROUP pricing
ALTER TABLE event_pricing ADD COLUMN IF NOT EXISTS group_size_min INTEGER;
ALTER TABLE event_pricing ADD COLUMN IF NOT EXISTS group_size_max INTEGER;

-- Migrate existing groupSize → group_size_min (treat old value as the minimum)
UPDATE event_pricing SET group_size_min = group_size WHERE group_size IS NOT NULL;
