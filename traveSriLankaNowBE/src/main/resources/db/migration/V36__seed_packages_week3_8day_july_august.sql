-- V36__seed_packages_week3_8day_july_august.sql
-- Two 8-day July-August tour packages: Transportation & Accommodation, and Transportation Only


-- ═══════════════════════════════════════════════════════════════════════════════
-- PACKAGE 1: Transportation AND Accommodation
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  '8-Day Sri Lanka Grand Tour – Transportation & Accommodation (July–August)',
  '8-day-grand-tour-transport-accommodation-july-august',
  'Designed for the vibrant July–August season, this 8-day itinerary takes you from the untamed wilderness of Yala National Park to the misty highlands of Ella and Nuwara Eliya, the cultural heart of Kandy, the ancient wonders of Sigiriya, and the sun-kissed beaches of Pasikudah or Trincomalee. The tour seamlessly blends wildlife safaris, cultural immersion, scenic beauty, and coastal relaxation — showcasing Sri Lanka''s diverse treasures with expert guidance. All 4-star accommodation with breakfast and dinner is included throughout.',
  'An 8-day July–August tour covering Yala, Ella, Nuwara Eliya, Kandy, Sigiriya, and the beaches of Pasikudah or Trincomalee — with all 4-star accommodation, transport, and a chauffeur guide included.',
  'tour',
  'Sri Lanka',
  0.00,
  '8 Days / 7 Nights',
  6, 6, false, 1,
  '{"season":"July-August","packageType":"Transportation and Accommodation","validUntil":"2026-10-31","accommodations":[{"day":1,"location":"Yala","hotel":"Jetwing Yala / Cinnamon Wild","category":"4-star Safari Lodge or Deluxe"},{"day":2,"location":"Ella","hotel":"98 Acres Resort / Mountain Heavens","category":"Boutique Chalet or Deluxe Room"},{"day":3,"location":"Kandy","hotel":"The Grand Kandyan / Cinnamon Citadel","category":"4-star Superior Double/Twin"},{"day":4,"location":"Kandy","hotel":"The Grand Kandyan / Cinnamon Citadel","category":"4-star Superior Double/Twin"},{"day":5,"location":"Sigiriya","hotel":"Sigiriya Village Hotel / Aliya Resort & Spa","category":"4-star Superior Double/Twin"},{"day":6,"location":"Pasikudah or Trincomalee","hotel":"Jungle Beach Resort Trinco / Trinco Blu by Cinnamon","category":"4-star Superior Double/Twin"},{"day":7,"location":"Pasikudah or Trincomalee","hotel":"Jungle Beach Resort Trinco / Trinco Blu by Cinnamon","category":"4-star Superior Double/Twin"}],"entranceFees":["Yala National Park: USD 50 per person","Kandy Temple: USD 20 per person","Royal Botanical Gardens: USD 20 per person","Minneriya or Kaudulla: USD 30 per person","Sigiriya: USD 30 per person","Dambulla: USD 30 per person"],"cancellationPolicy":{"30+ days":"No charge","14-29 days":"30% of total booking value","7-13 days":"75% of total booking value","less than 7 days":"100% of total booking value"},"notes":["Day 8 accommodation in Colombo applies only if there is an overnight stay before departure; otherwise transfer to the airport","Room type: Double/Twin sharing (single room supplements apply if required)","All accommodations are subject to availability at the time of booking","Alternatives of the same category will be provided if suggested hotels are fully booked"]}'
) ON CONFLICT (slug) DO NOTHING;

-- Package 1 — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Accommodation with breakfast and dinner in double/twin rooms at listed 4-star hotels or equivalent',
  'Private luxury vehicle for all internal road travel as per the itinerary',
  'Assistance from an English-speaking chauffeur guide throughout the tour',
  'All applicable taxes and VAT',
  'Kandy city tour',
  '1 litre of bottled drinking water per person per day'
])
FROM packages WHERE slug = '8-day-grand-tour-transport-accommodation-july-august';

-- Package 1 — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 6 months validity',
  'Sri Lanka tourist visa (obtainable online before arrival)',
  'Comfortable walking shoes for safari and sightseeing',
  'Light clothing suitable for tropical and highland climates',
  'Modest attire for temple visits (shoulders and knees covered)',
  'Personal travel insurance is strongly recommended'
])
FROM packages WHERE slug = '8-day-grand-tour-transport-accommodation-july-august';

-- Package 1 — Pricing (amounts TBD; set to 0.00 as placeholder)
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 2, 2, 'Per Person – 2 Passengers (Private Car)', true,  1 FROM packages WHERE slug = '8-day-grand-tour-transport-accommodation-july-august';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 4, 4, 'Per Person – 4 Passengers (Toyota KDH Van)', false, 2 FROM packages WHERE slug = '8-day-grand-tour-transport-accommodation-july-august';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 6, 6, 'Per Person – 6 Passengers (Toyota KDH Van)', false, 3 FROM packages WHERE slug = '8-day-grand-tour-transport-accommodation-july-august';

-- Package 1 — Day-by-day itinerary locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Yala National Park (Thissamaharama)',
       'Arrival at Bandaranaike International Airport, Colombo. A chauffeur from Ruklak Tours escorts you on a scenic 5-hour drive (256 km) to Thissamaharama, the gateway to Yala National Park. Check into your 4-star safari lodge, unwind by the pool or take an evening stroll, preparing for the next day''s safari.',
       1, '1 Night',
       (SELECT id FROM locations WHERE slug = 'yala'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Ella',
       'Rise early for a thrilling 3–4 hour morning safari in Yala National Park — spot leopards, elephants, sloth bears, and crocodiles aboard a 4×4 jeep with an expert ranger. After a hearty breakfast, drive to Ella in the central highlands. Afternoon visits to Ravana Falls (25 m cascade), the iconic Nine Arches Bridge (1921 colonial marvel), and a 1-hour hike to Little Adam''s Peak for panoramic valley views.',
       2, '1 Night',
       (SELECT id FROM locations WHERE slug = 'ella'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Nuwara Eliya & Kandy',
       'Optional scenic train ride from Ella to Nanu Oya — one of the world''s most scenic rail journeys through emerald tea plantations, misty valleys, and waterfalls (book early for July–August). Visit a working tea factory in Nuwara Eliya ("Little England") and explore Gregory Lake. Continue by chauffeur to Kandy for check-in.',
       3, '2 Nights',
       (SELECT id FROM locations WHERE slug = 'nuwara-eliya'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Kandy',
       'After breakfast, visit the Temple of the Tooth Relic (UNESCO World Heritage Site, 16th century). Leisurely walk around Kandy Lake. Afternoon at Peradeniya Botanical Gardens (est. 1821) with its spice garden and orchid house. End the day with a traditional Kandyan cultural dance performance featuring colorful costumes and drumming.',
       4, '',
       (SELECT id FROM locations WHERE slug = 'kandy'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Sigiriya (via Dambulla)',
       'Post-breakfast drive to Sigiriya with a stop at Dambulla Cave Temple (UNESCO World Heritage Site, 2nd century BC) — five caves with over 150 Buddha statues and vibrant frescoes. Check into Sigiriya hotel. Optional afternoon safari at Minneriya or Kaudulla National Park (July–August peak) where up to 300 elephants congregate around ancient reservoirs.',
       5, '1 Night',
       (SELECT id FROM locations WHERE slug = 'sigiriya'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Pasikudah or Trincomalee',
       'Early morning climb of Sigiriya Rock Fortress (UNESCO World Heritage Site) — the 5th-century "Lion Rock" rising 200 m with frescoes of celestial maidens, polished mirror wall, and palace ruins at the summit. Then drive to your choice of Pasikudah (famous for its shallow turquoise bay and coral reef) or Trincomalee (Koneswaram Temple cliffside, golden Nilaveli Beach). Check into beachfront 4-star resort.',
       6, '2 Nights',
       (SELECT id FROM locations WHERE slug = 'pasikuda'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Airport Departure',
       'After a final breakfast by the sea, transfer to Bandaranaike International Airport — approximately 6.5–7 hours. Bid farewell to Sri Lanka''s diverse landscapes.',
       7, '',
       NULL,
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-accommodation-july-august';


-- ═══════════════════════════════════════════════════════════════════════════════
-- PACKAGE 2: Transportation Only
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  '8-Day Sri Lanka Grand Tour – Transportation Only (July–August)',
  '8-day-grand-tour-transport-only-july-august',
  'Designed for the vibrant July–August season, this 8-day itinerary takes you from the untamed wilderness of Yala National Park to the misty highlands of Ella and Nuwara Eliya, the cultural heart of Kandy, the ancient wonders of Sigiriya, and the sun-kissed beaches of Pasikudah or Trincomalee. The tour seamlessly blends wildlife safaris, cultural immersion, scenic beauty, and coastal relaxation — showcasing Sri Lanka''s diverse treasures with expert guidance. Guests arrange their own accommodation; the package covers a private luxury vehicle and English-speaking chauffeur guide throughout.',
  'An 8-day July–August tour covering Yala, Ella, Nuwara Eliya, Kandy, Sigiriya, and the beaches of Pasikudah or Trincomalee — with private transport and a chauffeur guide. Guests book their own accommodation.',
  'tour',
  'Sri Lanka',
  0.00,
  '8 Days / 7 Nights',
  6, 6, false, 2,
  '{"season":"July-August","packageType":"Transportation Only","validUntil":"2026-10-31","suggestedAccommodations":[{"day":1,"location":"Yala","hotel":"Jetwing Yala / Cinnamon Wild","category":"4-star Safari Lodge or Deluxe"},{"day":2,"location":"Ella","hotel":"98 Acres Resort / Mountain Heavens","category":"Boutique Chalet or Deluxe Room"},{"day":3,"location":"Kandy","hotel":"The Grand Kandyan / Cinnamon Citadel","category":"4-star Superior Double/Twin"},{"day":4,"location":"Kandy","hotel":"The Grand Kandyan / Cinnamon Citadel","category":"4-star Superior Double/Twin"},{"day":5,"location":"Sigiriya","hotel":"Sigiriya Village Hotel / Aliya Resort & Spa","category":"4-star Superior Double/Twin"},{"day":6,"location":"Pasikudah or Trincomalee","hotel":"Jungle Beach Resort Trinco / Trinco Blu by Cinnamon","category":"4-star Superior Double/Twin"},{"day":7,"location":"Pasikudah or Trincomalee","hotel":"Jungle Beach Resort Trinco / Trinco Blu by Cinnamon","category":"4-star Superior Double/Twin"}],"entranceFees":["Yala National Park: USD 50 per person","Kandy Temple: USD 20 per person","Royal Botanical Gardens: USD 20 per person","Minneriya or Kaudulla: USD 30 per person","Sigiriya: USD 30 per person","Dambulla: USD 30 per person"],"cancellationPolicy":{"30+ days":"No charge","14-29 days":"30% of total booking value","7-13 days":"75% of total booking value","less than 7 days":"100% of total booking value"}}'
) ON CONFLICT (slug) DO NOTHING;

-- Package 2 — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Private luxury vehicle for all internal road travel as per the itinerary',
  'Assistance from an English-speaking chauffeur guide throughout the tour',
  'All applicable taxes and VAT',
  '2 litres of bottled drinking water per person per day'
])
FROM packages WHERE slug = '8-day-grand-tour-transport-only-july-august';

-- Package 2 — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 6 months validity',
  'Sri Lanka tourist visa (obtainable online before arrival)',
  'Comfortable walking shoes for safari and sightseeing',
  'Light clothing suitable for tropical and highland climates',
  'Modest attire for temple visits (shoulders and knees covered)',
  'Personal travel insurance is strongly recommended'
])
FROM packages WHERE slug = '8-day-grand-tour-transport-only-july-august';

-- Package 2 — Pricing (amounts TBD; set to 0.00 as placeholder)
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 2, 2, 'Per Person – 2 Passengers (Private Car)',       true,  1 FROM packages WHERE slug = '8-day-grand-tour-transport-only-july-august';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 4, 4, 'Per Person – 4 Passengers (Toyota KDH Van)',   false, 2 FROM packages WHERE slug = '8-day-grand-tour-transport-only-july-august';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 6, 6, 'Per Person – 6 Passengers (Toyota KDH Van)',   false, 3 FROM packages WHERE slug = '8-day-grand-tour-transport-only-july-august';

-- Package 2 — Day-by-day itinerary locations (same route, no accommodation included)
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Yala National Park (Thissamaharama)',
       'Arrival at Bandaranaike International Airport, Colombo. A chauffeur from Ruklak Tours escorts you on a scenic 5-hour drive (256 km) to Thissamaharama, the gateway to Yala National Park. Check into your own-arranged accommodation, unwind, and prepare for the next day''s safari.',
       1, '1 Night',
       (SELECT id FROM locations WHERE slug = 'yala'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Ella',
       'Rise early for a thrilling 3–4 hour morning safari in Yala National Park — spot leopards, elephants, sloth bears, and crocodiles aboard a 4×4 jeep with an expert ranger. Drive to Ella in the central highlands. Afternoon visits to Ravana Falls, the Nine Arches Bridge, and a 1-hour hike to Little Adam''s Peak for panoramic valley views.',
       2, '1 Night',
       (SELECT id FROM locations WHERE slug = 'ella'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Nuwara Eliya & Kandy',
       'Optional scenic train ride from Ella to Nanu Oya — one of the world''s most scenic rail journeys through emerald tea plantations and misty valleys (book early for July–August). Visit a working tea factory in Nuwara Eliya and explore Gregory Lake. Continue by chauffeur to Kandy.',
       3, '2 Nights',
       (SELECT id FROM locations WHERE slug = 'nuwara-eliya'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Kandy',
       'After breakfast, visit the Temple of the Tooth Relic (UNESCO World Heritage Site). Leisurely walk around Kandy Lake. Afternoon at Peradeniya Botanical Gardens with its spice garden and orchid house. Evening traditional Kandyan cultural dance performance.',
       4, '',
       (SELECT id FROM locations WHERE slug = 'kandy'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Sigiriya (via Dambulla)',
       'Post-breakfast drive to Sigiriya with a stop at Dambulla Cave Temple (UNESCO, 2nd century BC) — five caves with over 150 Buddha statues and vibrant frescoes. Arrive Sigiriya. Optional afternoon safari at Minneriya or Kaudulla National Park where up to 300 elephants congregate during July–August.',
       5, '1 Night',
       (SELECT id FROM locations WHERE slug = 'sigiriya'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Pasikudah or Trincomalee',
       'Early morning climb of Sigiriya Rock Fortress (UNESCO World Heritage Site) — the 5th-century "Lion Rock" with frescoes of celestial maidens, polished mirror wall, and palace ruins offering panoramic views. Then drive to Pasikudah (shallow turquoise bay, coral reef) or Trincomalee (clifftop Koneswaram Temple, Nilaveli Beach). Check into your own-arranged beachfront accommodation.',
       6, '2 Nights',
       (SELECT id FROM locations WHERE slug = 'pasikuda'),
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id,
       'Airport Departure',
       'After a final breakfast by the sea, transfer to Bandaranaike International Airport — approximately 6.5–7 hours.',
       7, '',
       NULL,
       NOW()
FROM packages p WHERE p.slug = '8-day-grand-tour-transport-only-july-august';
