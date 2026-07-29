-- V38: Replace incorrect nomad / senior-citizens packages and add honeymoon package.
-- Child rows (package_locations, package_pricing, package_included, package_requirements)
-- are removed automatically via ON DELETE CASCADE from the FK relationships.

-- ─── Remove existing incorrect packages ──────────────────────────────────────
DELETE FROM package_locations    WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%nomad%' OR title ILIKE '%nomad%');
DELETE FROM package_pricing      WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%nomad%' OR title ILIKE '%nomad%');
DELETE FROM package_included     WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%nomad%' OR title ILIKE '%nomad%');
DELETE FROM package_requirements WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%nomad%' OR title ILIKE '%nomad%');
DELETE FROM packages WHERE slug ILIKE '%nomad%' OR title ILIKE '%nomad%';

DELETE FROM package_locations    WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%senior%' OR title ILIKE '%senior%');
DELETE FROM package_pricing      WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%senior%' OR title ILIKE '%senior%');
DELETE FROM package_included     WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%senior%' OR title ILIKE '%senior%');
DELETE FROM package_requirements WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%senior%' OR title ILIKE '%senior%');
DELETE FROM packages WHERE slug ILIKE '%senior%' OR title ILIKE '%senior%';

DELETE FROM package_locations    WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%honey%' OR slug ILIKE '%honeymoon%' OR title ILIKE '%honey%');
DELETE FROM package_pricing      WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%honey%' OR slug ILIKE '%honeymoon%' OR title ILIKE '%honey%');
DELETE FROM package_included     WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%honey%' OR slug ILIKE '%honeymoon%' OR title ILIKE '%honey%');
DELETE FROM package_requirements WHERE package_id IN (SELECT id FROM packages WHERE slug ILIKE '%honey%' OR slug ILIKE '%honeymoon%' OR title ILIKE '%honey%');
DELETE FROM packages WHERE slug ILIKE '%honey%' OR slug ILIKE '%honeymoon%' OR title ILIKE '%honey%';


-- ═══════════════════════════════════════════════════════════════════════════════
-- HONEYMOON PACKAGE 1 — Transportation & Accommodation (11 Days / 10 Nights)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  'Honeymoon Sri Lanka – Transportation & Accommodation (11 Days / 10 Nights)',
  'honeymoon-transport-accommodation-11days',
  '<h2>A Romantic Journey Through Sri Lanka</h2>
<p>Celebrate your love story across Sri Lanka''s most breathtaking landscapes — from ancient cultural kingdoms to misty highland bungalows and sun-kissed southern beaches. This carefully curated 11-day honeymoon itinerary blends history, romance, and luxury in perfect measure.</p>

<h3>Day 1 — Airport → Negombo</h3>
<p>Negombo is a laid-back coastal town close to Bandaranaike International Airport, making it a perfect first stop. Known for its colonial canals, Dutch-era churches, and sandy beach, Negombo boasts a rich Catholic heritage and bustling fish markets.</p>
<ul>
<li><strong>Best Places:</strong> Negombo Beach · St. Mary''s Church · Dutch Canal · Negombo Lagoon · Fish markets · Angurukaramulla Temple · Hamilton Canal · Dutch Fort remains</li>
<li><strong>Things to Do:</strong> Lagoon boat tour · Walk the Dutch Canal paths · Visit fish markets · Dine on fresh crab and prawns · Explore colonial churches · Cycle the old town · Relax at a beachfront café · Watch the sunset from the beach</li>
</ul>
<p><em>Overnight: Negombo</em></p>

<h3>Day 2 — Negombo → Sigiriya</h3>
<p>Sigiriya, the iconic rock fortress known as the "Lion Rock," is one of Sri Lanka''s greatest archaeological wonders and a UNESCO World Heritage Site. Built by King Kashyapa in the 5th century, this ancient palace complex is perched atop a 200-metre-high rock with panoramic views of surrounding jungle and water gardens. The nearby Pidurangala Rock offers a less-crowded but equally impressive climb.</p>
<ul>
<li><strong>Best Places:</strong> Sigiriya Rock Fortress · Frescoes and Mirror Wall · Lion''s Paw Terraces · Royal Water Gardens · Boulder Garden · Sigiriya Museum · Pidurangala Rock</li>
<li><strong>Things to Do:</strong> Climb Sigiriya Rock · Explore Sigiriya Museum · Village bullock cart ride · Traditional village lunch · Cycle rural trails · Birdwatching around the moats · Walk with elephants at the Elephant Care Relief Foundation</li>
</ul>
<p><em>Overnight: Habarana</em></p>

<h3>Day 3 — Sigiriya → Polonnaruwa</h3>
<p>Polonnaruwa is Sri Lanka''s best-preserved ancient city and a UNESCO World Heritage Site, serving as the capital during the 10th–12th centuries. The Gal Vihara statues carved into a single granite slab are a highlight. Wildlife like monkeys and birds are commonly seen around the ruins. Visit Minneriya National Park, internationally renowned for "The Gathering" — over 300 wild elephants converge around the ancient reservoir during the dry season.</p>
<ul>
<li><strong>Best Places:</strong> Gal Vihara Buddha Statues · Royal Palace Complex · Quadrangle (Vatadage, Thuparama) · Rankoth Vehera · Parakrama Samudra · Lankatilaka Image House</li>
<li><strong>Things to Do:</strong> Cycle through ancient ruins · Visit Gal Vihara · Watch monkeys · Boat ride near the reservoir · Romantic signature dining atop a treehouse or secluded hill · Watch "The Gathering" at Minneriya (June–Sept)</li>
</ul>
<p><em>Overnight: Polonnaruwa</em></p>

<h3>Day 4 — Polonnaruwa → Kandy</h3>
<p>Kandy is the cultural capital of Sri Lanka, surrounded by misty hills and centred around the sacred Temple of the Tooth Relic — one of the most important Buddhist pilgrimage sites in the world. The Esala Perahera, a grand procession held in July or August, is one of Asia''s most spectacular festivals.</p>
<ul>
<li><strong>Best Places:</strong> Temple of the Tooth Relic · Kandy Lake · Bahirawakanda Buddha Statue · Royal Botanical Gardens Peradeniya · Udawatta Kele Sanctuary · Tea Museum</li>
<li><strong>Things to Do:</strong> Visit the Temple of the Tooth · Boat ride around Kandy Lake · Kandyan dance performance · Picnic in Royal Botanical Gardens · Explore tea estates</li>
</ul>
<p>In the evening, attend a performance featuring traditional dances from the different regions of Sri Lanka. Enjoy a restful night in luxury after a romantic candlelit dinner for two.</p>
<p><em>Overnight: Kandy</em></p>

<h3>Day 5 — Kandy (Leisure)</h3>
<p>Walk around Kandy Lake and up Lake Drive for some spectacular views of the town. Take a short drive to the lush Royal Botanical Gardens of Peradeniya and enjoy a picnic lunch. Enjoy the evening at leisure.</p>
<p><em>Overnight: Kandy</em></p>

<h3>Day 6 — Kandy → Hatton</h3>
<p>Take the upcountry train to Hatton high in the mountains and enjoy breathtaking views along the way. Check into your luxury colonial bungalow surrounded by rolling tea plantations with views of Castlereigh Lake. You will be greeted by your personal butler who will attend to you throughout your stay, as well as the executive chef with whom you can plan your dining options. The chilly climate is perfect to stroll, or relax by the fireplace until dinner. In the afternoon, explore the beautiful valleys by bike or take a long walk beside the peaceful lake.</p>
<p><em>Overnight: Hatton</em></p>

<h3>Day 7 — Hatton → Haggala → Nuwara Eliya</h3>
<p>Known as "Little England," Nuwara Eliya is a charming highland town with colonial buildings, rose gardens, and cool mountain air. Nestled in Sri Lanka''s tea country, it is surrounded by lush plantations and beautiful waterfalls. The April season transforms the city into a festive paradise with flower shows, horse races, and street fairs.</p>
<ul>
<li><strong>Best Places:</strong> Gregory Lake · Hakgala Botanical Garden · Pedro Tea Estate · Lover''s Leap Waterfall · Seetha Amman Temple · Moon Plains · Victoria Park · Galway''s Land Bird Sanctuary</li>
<li><strong>Things to Do:</strong> Boat ride on Gregory Lake · Tour a tea factory · Walk through botanical gardens · Hike to Lover''s Leap · Ride ponies in Victoria Park · Attend the April Flower Festival</li>
</ul>
<p><em>Overnight: Nuwara Eliya</em></p>

<h3>Day 8 — Nuwara Eliya → Ella → Haputale</h3>
<p>Haputale is a scenic hill town nestled along the edge of a dramatic mountain ridge. Known for its cooler climate and endless views over the southern plains, it is less touristy than Ella but equally breathtaking. The region is dotted with tea plantations, misty forests, waterfalls, and colonial estates. The highlight is Lipton''s Seat, where Sir Thomas Lipton used to survey his tea empire.</p>
<ul>
<li><strong>Best Places:</strong> Lipton''s Seat · Dambatenne Tea Factory · St. Andrew''s Church · Adisham Bungalow · Thangamale Bird Sanctuary · Diyaluma Falls · Haputale mountain ridge viewpoint</li>
<li><strong>Things to Do:</strong> Hike to Lipton''s Seat · Visit a tea factory · Scenic train rides · Birdwatch in Thangamale Sanctuary · Meditate at forest monasteries · Relax at peaceful eco-lodges</li>
</ul>
<p><em>Overnight: Haputale</em></p>

<h3>Day 9 — Haputale → Bentota</h3>
<p>Early morning visit to Lipton''s Seat. Then journey south to Bentota — a favourite among honeymooners and water sports enthusiasts. Located just a few hours from Colombo, it features a pristine beach, a calm river lagoon, and plenty of luxury resorts. Bentota blends sun, sand, and heritage — with historic temples, river safaris, and peaceful gardens.</p>
<ul>
<li><strong>Best Places:</strong> Bentota Beach · Bentota River · Brief Garden (Bawa''s garden) · Kande Viharaya Temple · Cinnamon Island · Kosgoda Turtle Hatchery · Lunuganga Estate</li>
<li><strong>Things to Do:</strong> Jet ski or banana boat rides · River safari through mangroves · Visit turtle hatcheries · Spa resort · Cycling tour · Sunset at Bentota Beach · Try herbal body treatments</li>
</ul>
<p><em>Overnight: Bentota</em></p>

<h3>Day 10 — Bentota → Galle → Bentota</h3>
<p>Take a drive south along the coast to Galle — Sri Lanka''s oldest living city with a fusion of European and Arabic cultural and architectural influences. In the afternoon, explore Galle Fort with its cobbled streets and learn the history behind its ramparts. A hive of activity, arts, and culture, it is one of the few World Heritage-listed sites in which a bustling population continues to thrive — with alleys lined with restaurants, art galleries, and shops selling jewellery and antiques.</p>
<p><em>Overnight: Bentota</em></p>

<h3>Day 11 — Bentota → Airport</h3>
<p>Final breakfast by the beach before your comfortable transfer to Bandaranaike International Airport.</p>

<h3>Accommodation (4-Star, Subject to Availability)</h3>
<table>
<tr><th>Day</th><th>Location</th><th>Suggested Hotels</th><th>Category</th><th>Room Type</th></tr>
<tr><td>1</td><td>Negombo</td><td>Jetwing Blue / Heritance Negombo</td><td>4-star</td><td>Deluxe Double/Twin</td></tr>
<tr><td>2</td><td>Sigiriya</td><td>Sigiriya Village Hotel / Aliya Resort &amp; Spa</td><td>4-star</td><td>Superior Double/Twin</td></tr>
<tr><td>3</td><td>Polonnaruwa</td><td>4-star Property</td><td>4-star</td><td>Double/Twin</td></tr>
<tr><td>4–5</td><td>Kandy</td><td>The Grand Kandyan / Cinnamon Citadel</td><td>4-star</td><td>Superior Double/Twin</td></tr>
<tr><td>6</td><td>Hatton</td><td>4-star Colonial Bungalow</td><td>4-star</td><td>Double/Twin</td></tr>
<tr><td>7</td><td>Nuwara Eliya</td><td>The Grand Hotel / Araliya Green Hills</td><td>4-star</td><td>Premium Double/Twin</td></tr>
<tr><td>8</td><td>Haputale</td><td>4-star Property</td><td>4-star</td><td>Double/Twin</td></tr>
<tr><td>9–10</td><td>Bentota</td><td>Taj Exotica Bentota / Club Villa / Cinnamon Bey Beruwala</td><td>4-star</td><td>Superior Double/Twin</td></tr>
</table>

<h3>Entrance Fees (Per Person – Not Included)</h3>
<ul>
<li>Polonnaruwa: USD 20</li>
<li>Kandy Temple: USD 20</li>
<li>Royal Botanical Gardens: USD 20</li>
<li>Minneriya / Kaudulla: USD 30</li>
<li>Sigiriya: USD 30</li>
<li>Madu River: USD 30</li>
<li>Hakgala: USD 20</li>
<li>Ella: USD 30</li>
</ul>

<h3>Cancellation Policy</h3>
<ul>
<li>30+ days before arrival: No charge</li>
<li>14–29 days: 30% of total booking value</li>
<li>7–13 days: 75% of total booking value</li>
<li>Less than 7 days: 100% of total booking value</li>
</ul>

<p><em>Prices are valid until 31 October 2026. Prices may change due to fuel or tax adjustments.</em></p>',
  'An 11-day romantic honeymoon journey through Sri Lanka — colonial Negombo, ancient Sigiriya & Polonnaruwa, cultural Kandy, misty highlands of Hatton & Nuwara Eliya, scenic Haputale, and the pristine beaches of Bentota and Galle. 4-star accommodation with breakfast and dinner included.',
  'tour',
  'Sri Lanka',
  0.00,
  '11 Days / 10 Nights',
  2, 2, true, 10,
  '{"packageType":"Transportation and Accommodation","validUntil":"2026-10-31","targetAudience":"Honeymoon couples","cancellationPolicy":{"30+ days":"No charge","14-29 days":"30% of total booking value","7-13 days":"75% of total booking value","less than 7 days":"100% of total booking value"}}'
) ON CONFLICT (slug) DO NOTHING;

-- Honeymoon T&A — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Accommodation with breakfast and dinner in double/twin rooms at listed 4-star hotels or equivalent',
  'Private luxury vehicle for all internal road travel as per the itinerary',
  'Assistance from an English-speaking chauffeur guide',
  'All applicable taxes and VAT',
  'Visits to Galle Fort and Kandy city tour',
  '1 litre of bottled drinking water per person per day'
])
FROM packages WHERE slug = 'honeymoon-transport-accommodation-11days';

-- Honeymoon T&A — Exclusions (stored as requirements field)
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 6 months validity',
  'Sri Lanka tourist visa (ETA — obtainable online before arrival)',
  'Modest attire for temple visits (shoulders and knees covered)',
  'Comfortable walking shoes for sightseeing and nature walks',
  'Personal travel insurance strongly recommended'
])
FROM packages WHERE slug = 'honeymoon-transport-accommodation-11days';

-- Honeymoon T&A — Pricing
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 2, 2, 'Per Person – 2 Passengers (Private Car)', true, 1 FROM packages WHERE slug = 'honeymoon-transport-accommodation-11days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 4, 4, 'Per Person – 4 Passengers (Toyota KDH Van)', false, 2 FROM packages WHERE slug = 'honeymoon-transport-accommodation-11days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 6, 6, 'Per Person – 6 Passengers (Toyota KDH Van)', false, 3 FROM packages WHERE slug = 'honeymoon-transport-accommodation-11days';

-- Honeymoon T&A — Day-by-day locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Negombo', 'Arrival at Bandaranaike International Airport. Transfer to Negombo — a laid-back coastal town with colonial canals, Dutch-era churches, sandy beach, and rich Catholic heritage. Relax and prepare for the journey ahead.', 1, '1 Night', (SELECT id FROM locations WHERE slug = 'negombo' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Sigiriya', 'UNESCO World Heritage "Lion Rock" — 5th-century palace complex perched 200 m high with frescoes, Mirror Wall, royal water gardens, and panoramic jungle views. Optional walk with elephants at the Elephant Care Relief Foundation.', 2, '1 Night', (SELECT id FROM locations WHERE slug = 'sigiriya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Polonnaruwa', 'Sri Lanka''s best-preserved ancient capital (UNESCO). Cycle through royal palace ruins, Gal Vihara rock statues, and Parakrama Samudra reservoir. Optional romantic signature dining atop a treehouse. Visit Minneriya for "The Gathering" elephant spectacle (June–Sept).', 3, '1 Night', (SELECT id FROM locations WHERE slug = 'polonnaruwa' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Kandy', 'Sri Lanka''s cultural capital. Visit the sacred Temple of the Tooth Relic, stroll Kandy Lake, explore the Royal Botanical Gardens at Peradeniya, and enjoy an evening Kandyan cultural dance performance. Romantic candlelit dinner for two.', 4, '2 Nights', (SELECT id FROM locations WHERE slug = 'kandy' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Hatton', 'Upcountry train journey through tea plantations and misty valleys. Luxury colonial bungalow with personal butler, views of Castlereigh Lake, and afternoon valley walks or cycling beside the peaceful lake.', 5, '1 Night', (SELECT id FROM locations WHERE slug = 'hatton' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Nuwara Eliya', '"Little England" at 1,868 m elevation — colonial buildings, Gregory Lake, Hakgala Botanical Gardens, Pedro Tea Estate, and Lover''s Leap waterfall set among rolling tea estates.', 6, '1 Night', (SELECT id FROM locations WHERE slug = 'nuwara-eliya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Haputale', 'Dramatic mountain ridge town with endless views over the southern plains. Lipton''s Seat sunrise hike, Dambatenne Tea Factory, Adisham Bungalow monastery, Thangamale Bird Sanctuary, and Diyaluma Falls nearby.', 7, '1 Night', (SELECT id FROM locations WHERE slug = 'haputale' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Bentota', 'Sri Lanka''s premier honeymoon beach destination — pristine beach, calm river lagoon, and luxury resorts. River safari through mangroves, turtle hatchery, Brief Garden, water sports, and a sunset drive to historic Galle Fort on Day 10.', 8, '2 Nights', (SELECT id FROM locations WHERE slug = 'bentota' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';

INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Airport Departure', 'Final breakfast by the beach. Comfortable transfer to Bandaranaike International Airport.', 9, '', NULL, NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-accommodation-11days';


-- ═══════════════════════════════════════════════════════════════════════════════
-- HONEYMOON PACKAGE 2 — Transportation Only (11 Days / 10 Nights)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  'Honeymoon Sri Lanka – Transportation Only (11 Days / 10 Nights)',
  'honeymoon-transport-only-11days',
  '<h2>A Romantic Journey Through Sri Lanka</h2>
<p>Celebrate your love story across Sri Lanka''s most breathtaking landscapes — from ancient cultural kingdoms to misty highland bungalows and sun-kissed southern beaches. This carefully curated 11-day honeymoon itinerary blends history, romance, and luxury in perfect measure. Guests arrange their own accommodation; the package covers a private luxury vehicle and English-speaking chauffeur guide throughout.</p>

<h3>Day 1 — Airport → Negombo</h3>
<p>Negombo is a laid-back coastal town close to Bandaranaike International Airport. Known for its colonial canals, Dutch-era churches, and sandy beach, Negombo boasts rich Catholic heritage and bustling fish markets. Transfer to your own-arranged hotel to settle in.</p>

<h3>Day 2 — Negombo → Sigiriya</h3>
<p>UNESCO World Heritage "Lion Rock" — 5th-century palace complex perched 200 m high with frescoes, Mirror Wall, Royal Water Gardens, and panoramic jungle views. Optional visit to the Elephant Care Relief Foundation.</p>
<p><em>Overnight: Own-arranged accommodation, Habarana area</em></p>

<h3>Day 3 — Sigiriya → Polonnaruwa</h3>
<p>Sri Lanka''s best-preserved ancient capital. Cycle through royal palace ruins, Gal Vihara rock statues, and Parakrama Samudra reservoir. Visit Minneriya National Park for the famous elephant gathering.</p>

<h3>Day 4 — Polonnaruwa → Kandy</h3>
<p>Cultural capital of Sri Lanka. Temple of the Tooth Relic, Kandy Lake walk, Peradeniya Botanical Gardens, and an evening Kandyan cultural dance performance.</p>

<h3>Day 5 — Kandy (Leisure)</h3>
<p>Walk around Kandy Lake and up Lake Drive for spectacular town views. Short drive to the Royal Botanical Gardens of Peradeniya for a picnic lunch. Evening at leisure.</p>

<h3>Day 6 — Kandy → Hatton</h3>
<p>Upcountry scenic train journey to Hatton through rolling tea plantations. Afternoon valley walks or cycling beside Castlereigh Lake.</p>

<h3>Day 7 — Hatton → Haggala → Nuwara Eliya</h3>
<p>"Little England" at elevation — Gregory Lake, Hakgala Botanical Gardens, Pedro Tea Estate, and Lover''s Leap waterfall among lush tea estates.</p>

<h3>Day 8 — Nuwara Eliya → Ella → Haputale</h3>
<p>Dramatic mountain ridge with endless views. Lipton''s Seat hike, Dambatenne Tea Factory, Adisham Bungalow, and Diyaluma Falls nearby.</p>

<h3>Day 9 — Haputale → Bentota</h3>
<p>Early morning visit to Lipton''s Seat. Journey south to Bentota — Sri Lanka''s premier honeymoon coast with pristine beach, calm river lagoon, river safari through mangroves, and turtle hatcheries.</p>

<h3>Day 10 — Bentota → Galle → Bentota</h3>
<p>Drive south to historic Galle Fort (UNESCO), cobbled streets, ramparts, restaurants, art galleries, and jewellery shops. Return to Bentota for the evening.</p>

<h3>Day 11 — Bentota → Airport</h3>
<p>Final beach morning before comfortable transfer to Bandaranaike International Airport.</p>

<h3>Cancellation Policy</h3>
<ul>
<li>30+ days before arrival: No charge</li>
<li>14–29 days: 30% of total booking value</li>
<li>7–13 days: 75% of total booking value</li>
<li>Less than 7 days: 100% of total booking value</li>
</ul>',
  'An 11-day romantic honeymoon itinerary with private transport and chauffeur guide — Negombo, Sigiriya, Polonnaruwa, Kandy, Hatton, Nuwara Eliya, Haputale, Bentota, and Galle. Guests arrange their own accommodation.',
  'tour',
  'Sri Lanka',
  0.00,
  '11 Days / 10 Nights',
  2, 2, false, 11,
  '{"packageType":"Transportation Only","validUntil":"2026-10-31","targetAudience":"Honeymoon couples","cancellationPolicy":{"30+ days":"No charge","14-29 days":"30% of total booking value","7-13 days":"75% of total booking value","less than 7 days":"100% of total booking value"}}'
) ON CONFLICT (slug) DO NOTHING;

-- Honeymoon T-Only — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Private luxury vehicle for all internal road travel as per the itinerary',
  'Assistance from an English-speaking chauffeur guide throughout',
  'All applicable taxes and VAT',
  '1 litre of bottled drinking water per person per day'
])
FROM packages WHERE slug = 'honeymoon-transport-only-11days';

-- Honeymoon T-Only — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 6 months validity',
  'Sri Lanka tourist visa (ETA — obtainable online before arrival)',
  'Modest attire for temple visits (shoulders and knees covered)',
  'Comfortable walking shoes for sightseeing and nature walks',
  'Personal travel insurance strongly recommended'
])
FROM packages WHERE slug = 'honeymoon-transport-only-11days';

-- Honeymoon T-Only — Pricing
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 2, 2, 'Per Person – 2 Passengers (Private Car)', true, 1 FROM packages WHERE slug = 'honeymoon-transport-only-11days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 4, 4, 'Per Person – 4 Passengers (Toyota KDH Van)', false, 2 FROM packages WHERE slug = 'honeymoon-transport-only-11days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 6, 6, 'Per Person – 6 Passengers (Toyota KDH Van)', false, 3 FROM packages WHERE slug = 'honeymoon-transport-only-11days';

-- Honeymoon T-Only — Locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Negombo', 'Arrival and transfer to own-arranged hotel. Laid-back coastal town with colonial canals, Dutch churches, fish markets, and beachfront cafés.', 1, '1 Night', (SELECT id FROM locations WHERE slug = 'negombo' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Sigiriya', 'UNESCO "Lion Rock" — ancient palace fortress at 200 m with frescoes, Mirror Wall, and royal water gardens. Own-arranged accommodation in Habarana area.', 2, '1 Night', (SELECT id FROM locations WHERE slug = 'sigiriya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Polonnaruwa', 'Best-preserved ancient capital. Gal Vihara statues, royal palace complex, Parakrama Samudra reservoir, Minneriya elephant gathering.', 3, '1 Night', (SELECT id FROM locations WHERE slug = 'polonnaruwa' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Kandy', 'Cultural capital — Temple of the Tooth Relic, Kandy Lake, Peradeniya Botanical Gardens, and Kandyan cultural dance performance.', 4, '2 Nights', (SELECT id FROM locations WHERE slug = 'kandy' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Hatton', 'Scenic upcountry train journey. Tea plantation bungalow setting, Castlereigh Lake walks, and valley cycling.', 5, '1 Night', (SELECT id FROM locations WHERE slug = 'hatton' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Nuwara Eliya', '"Little England" highland town — Gregory Lake, Hakgala Gardens, Pedro Tea Estate, and Lover''s Leap waterfall.', 6, '1 Night', (SELECT id FROM locations WHERE slug = 'nuwara-eliya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Haputale', 'Mountain ridge panoramas, Lipton''s Seat sunrise hike, Dambatenne Tea Factory, Adisham Bungalow, and Diyaluma Falls.', 7, '1 Night', (SELECT id FROM locations WHERE slug = 'haputale' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Bentota', 'Premier honeymoon beach — pristine sands, mangrove river safari, turtle hatcheries, Brief Garden, water sports, and a day trip to UNESCO Galle Fort.', 8, '2 Nights', (SELECT id FROM locations WHERE slug = 'bentota' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Airport Departure', 'Final beach morning. Transfer to Bandaranaike International Airport.', 9, '', NULL, NOW() FROM packages p WHERE p.slug = 'honeymoon-transport-only-11days';


-- ═══════════════════════════════════════════════════════════════════════════════
-- SENIOR CITIZENS PACKAGE 1 — Transportation & Accommodation (12 Days / 11 Nights)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  'Senior Citizens Leisure Package – Transportation & Accommodation (12 Days / 11 Nights)',
  'senior-leisure-transport-accommodation-12days',
  '<h2>Comfort-Paced Sri Lanka Experience for Senior Travelers</h2>
<p>Discover Sri Lanka''s cultural and natural wonders at a comfortable, unhurried pace designed specifically for mature travelers seeking quality experiences without physical strain. This thoughtfully crafted package prioritises comfort and safety, with no over-rushed itineraries. Each day begins leisurely with late morning departures, includes afternoon rest periods, and features carefully selected activities requiring minimal physical exertion.</p>

<ul>
<li>Explore magnificent Sigiriya views from gardens without strenuous climbing</li>
<li>Appreciate Kandy''s cultural heritage through comfortable city tours</li>
<li>Witness wildlife from safari jeeps designed for comfort</li>
<li>Stroll through beautiful botanical gardens on paved pathways</li>
<li>Medical support coordination and travel insurance guidance included</li>
</ul>

<h3>Day 1 — Airport → Negombo</h3>
<p>Airport pickup with traditional welcome and assistance with luggage. Welcome refreshment and orientation briefing. Afternoon rest period at leisure in comfortable room. Late afternoon optional beach walk. Early dinner at hotel restaurant (6:30 PM).</p>
<ul>
<li><strong>Best Places:</strong> Negombo Beach · St. Mary''s Church · Dutch Canal · Negombo Lagoon · Fish markets · Angurukaramulla Temple · Hamilton Canal</li>
<li><strong>Things to Do:</strong> Lagoon boat tour · Dutch Canal walk · Dine on fresh crab and prawns · Explore colonial churches · Sunset from the beach · Handicrafts and batik shopping</li>
</ul>
<p><em>Overnight: Negombo</em></p>

<h3>Day 2 — Negombo (Full Rest Day)</h3>
<p>A full rest day allows complete recovery from international travel and adjustment to Sri Lanka''s climate and time zone. This leisurely day eliminates travel stress, letting you explore Negombo''s attractions at your own comfortable pace or simply relax at the hotel. This buffer day ensures you begin the cultural touring portion feeling refreshed and energized.</p>
<p><em>Overnight: Negombo</em></p>

<h3>Day 3 — Negombo → Sigiriya</h3>
<p>Late morning checkout after leisurely breakfast (9:30 AM). Comfortable drive with rest stop at roadside restaurant. Sigiriya village offers peaceful surroundings with boutique accommodation. The area''s flat terrain and relaxed atmosphere make it ideal for senior travelers. We suggest visiting Sigiriya from the ground-level gardens rather than the summit climb.</p>
<ul>
<li>Arrival mid-afternoon · Check-in to ground-floor room · Afternoon rest</li>
<li>Evening visit to Sigiriya gardens and water features (flat walking)</li>
<li>Photography of rock fortress from garden viewpoints</li>
</ul>
<p><em>Overnight: Sigiriya</em></p>

<h3>Day 4 — Sigiriya Area Exploration</h3>
<p>Explore the Sigiriya region''s cultural treasures with comfortable, accessible activities. Dambulla Cave Temple requires only moderate stair climbing with rest points available. A traditional village tour showcases rural Sri Lankan life with bullock cart rides, home-cooked meals, and cultural demonstrations — all at a relaxed pace.</p>
<ul>
<li>Leisurely breakfast (8:00–9:30 AM) · Sigiriya Museum visit (air-conditioned)</li>
<li>Sigiriya gardens walking tour on flat paved paths · Lunch and rest</li>
<li>Afternoon: Dambulla Cave Temple (moderate stairs with rest points)</li>
<li>Optional village tour with bullock cart ride · Traditional cooking demonstration</li>
<li>Early dinner with traditional cuisine sampling</li>
</ul>
<p><em>Overnight: Sigiriya</em></p>

<h3>Day 5 — Sigiriya → Kandy</h3>
<p>Travel to Kandy, the cultural heart of Sri Lanka, through scenic central highlands. Kandy''s lakeside setting, accessible temples, and beautiful botanical gardens make it perfect for senior travelers. The city''s relatively flat areas around the lake allow pleasant walking, while tuk-tuk transport is available for slight inclines. Cooler temperatures provide relief from coastal heat.</p>
<ul>
<li>Late breakfast and checkout (9:00 AM) · Scenic drive with photo stops</li>
<li>Rest stop at spice garden with aromatic tour · Lunch en route</li>
<li>Arrival early afternoon · Check-in to lakeside hotel with elevator access</li>
<li>Afternoon rest · Late afternoon Kandy Lake walk (flat paved path)</li>
</ul>
<p><em>Overnight: Kandy</em></p>

<h3>Day 6 — Kandy Cultural Exploration</h3>
<p>Experience Kandy''s spiritual and natural treasures at a gentle pace. The Temple of the Tooth Relic requires minimal walking with seating areas for rest. The Royal Botanical Gardens at Peradeniya offer paved pathways, benches throughout, and electric cart transport for those preferring not to walk extensively. An evening cultural dance performance provides authentic entertainment while seated comfortably.</p>
<ul>
<li>Leisurely breakfast with lake views · Mid-morning: Temple of the Tooth Relic</li>
<li>Seated observation of rituals · Museum visit (air-conditioned) · Lunch and rest</li>
<li>Afternoon: Royal Botanical Gardens Peradeniya (paved paths or electric cart)</li>
<li>Evening: Kandyan cultural dance performance (seated)</li>
</ul>
<p><em>Overnight: Kandy</em></p>

<h3>Day 7 — Kandy → Nuwara Eliya (Scenic Road Journey)</h3>
<p>Travel to Nuwara Eliya through Sri Lanka''s beautiful hill country, enjoying mountain scenery from the comfort of your vehicle. Situated at 1,868 metres elevation, Nuwara Eliya offers cool climate and English colonial charm. Premium hotels feature fireplaces, comfortable lounges, and excellent dining. Numerous photo stops at tea estates and waterfalls along the route.</p>
<ul>
<li>Late breakfast and checkout (9:30 AM) · Scenic drive with photo stops</li>
<li>Tea factory visit for demonstration (sitting observation) · Tea tasting session</li>
<li>Lunch at scenic hilltop restaurant · Arrival mid-afternoon</li>
<li>Check-in to heritage hotel · Afternoon rest (altitude adjustment)</li>
<li>Evening stroll through Victoria Park (flat terrain) · Cozy dinner by fireplace</li>
</ul>
<p><em>Overnight: Nuwara Eliya</em></p>

<h3>Day 8 — Nuwara Eliya Leisure Day</h3>
<p>A relaxed exploration of Nuwara Eliya''s attractions at your preferred pace. The town''s colonial architecture, manicured gardens, and cool climate create a refreshing change from tropical heat. Gregory Lake offers pleasant scenery with optional boating. The slower pace allows time for personal interests — shopping, photography, or enjoying tea at cafés with mountain views.</p>
<ul>
<li>Late breakfast (8:30–10:00 AM) · Morning visit to Gregory Lake</li>
<li>Optional boat ride on calm lake · Visit to historic Nuwara Eliya Post Office</li>
<li>Colonial architecture walking tour on flat streets · Lunch at Grand Hotel or Hill Club</li>
<li>Afternoon rest · Optional local market visit for Ceylon tea shopping</li>
</ul>
<p><em>Overnight: Nuwara Eliya</em></p>

<h3>Day 9 — Nuwara Eliya → Beach Resort</h3>
<p><strong>Winter (Dec–Apr): South Coast, Bentota</strong> — Calm seas, protected beaches, and luxury resorts with ground-floor rooms, pools, spa facilities, and diverse dining. Accessible flat terrain ideal for senior travelers.</p>
<p><strong>Summer (May–Nov): East Coast, Passikudah</strong> — Shallow reef-protected coastline with exceptionally calm, clear waters ideal for gentle swimming. Luxury resorts with exceptional beach experiences.</p>
<ul>
<li>Leisurely breakfast and checkout (8:30 AM) · Scenic descent through tea estates</li>
<li>Mid-morning rest stop · Lunch at air-conditioned restaurant midway</li>
<li>Arrival at beach resort late afternoon · Check-in to sea-view accessible room</li>
<li>Evening beach walk or relaxation at resort · Beachfront dinner with seafood</li>
</ul>
<p><em>Overnight: Beach Resort</em></p>

<h3>Day 10 — Beach Resort (Full Leisure Day)</h3>
<p>A full rest day at the beach allows complete relaxation after days of cultural touring. Enjoy the resort''s facilities at your own pace without scheduled activities. Calm beach conditions ensure safe, pleasant swimming for those who wish.</p>
<ul>
<li>Very leisurely breakfast (8:00–10:30 AM) · Morning beach walk or gentle swim</li>
<li>Resort pool relaxation · Light lunch at beachfront restaurant · Afternoon rest</li>
<li>Optional spa treatment (massage, facial) · Sunset viewing from beach or terrace</li>
<li>Fresh seafood dinner at resort restaurant</li>
</ul>
<p><em>Overnight: Beach Resort</em></p>

<h3>Day 11 — Beach Resort (Second Leisure Day)</h3>
<p>A second full beach day ensures thorough relaxation before departure. Final photographs, souvenir shopping at resort boutiques, or simply savoring the tropical atmosphere.</p>
<ul>
<li>Leisurely breakfast · Morning beach and optional gentle water activities</li>
<li>Lunch at beach restaurant or room service · Afternoon siesta and packing</li>
<li>Final sunset viewing from beach · Farewell dinner at resort''s specialty restaurant</li>
</ul>
<p><em>Overnight: Beach Resort</em></p>

<h3>Day 12 — Beach Resort → Airport (Departure)</h3>
<p>Comfortable Sri Lankan journey conclusion with a relaxed transfer to the airport, timed according to your flight schedule. The morning allows leisurely packing and final moments at the beach before beginning your homeward journey with wonderful memories.</p>
<ul>
<li>Leisurely breakfast at resort · Final beach moments or pool time</li>
<li>Checkout at appropriate time for flight schedule</li>
<li>Comfortable drive to airport with rest stops as needed</li>
<li>Airport arrival 3 hours before international departure</li>
</ul>

<h3>Package Inclusions</h3>
<ul>
<li>Accommodation in premium accessible hotels (11 nights)</li>
<li>Full Board meal plan (breakfast, lunch, and dinner daily)</li>
<li>Private comfortable air-conditioned vehicle with experienced senior-friendly driver</li>
<li>English-speaking guide throughout (other languages on request)</li>
<li>Airport pickup and drop-off with luggage assistance</li>
<li>Bottled water during all transfers</li>
<li>All government taxes and service charges</li>
<li>Rest stops with refreshments during long drives</li>
<li>Entrance fee assistance and ticket arrangements</li>
<li>Emergency medical coordination support</li>
<li>Travel insurance guidance and recommendations</li>
</ul>

<h3>Cancellation Policy</h3>
<ul>
<li>30+ days before arrival: No charge</li>
<li>14–29 days: 30% of total booking value</li>
<li>7–13 days: 75% of total booking value</li>
<li>Less than 7 days: 100% of total booking value</li>
</ul>',
  'A comfort-paced 12-day / 11-night Sri Lanka experience designed specifically for travelers aged 60 and above — unhurried itinerary, late morning departures, afternoon rest periods, accessible activities, and medical support coordination. Full board with all meals included.',
  'tour',
  'Sri Lanka',
  0.00,
  '12 Days / 11 Nights',
  8, 8, false, 20,
  '{"packageType":"Transportation and Accommodation","targetAudience":"Senior citizens (60+)","mealPlan":"Full Board","validUntil":"2026-12-31","cancellationPolicy":{"30+ days":"No charge","14-29 days":"30% of total booking value","7-13 days":"75% of total booking value","less than 7 days":"100% of total booking value"}}'
) ON CONFLICT (slug) DO NOTHING;

-- Senior T&A — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Accommodation in premium accessible hotels (11 nights)',
  'Full Board meal plan — breakfast, lunch, and dinner daily',
  'Private comfortable air-conditioned vehicle with experienced senior-friendly driver',
  'English-speaking guide throughout (other languages on request)',
  'Airport pickup and drop-off with luggage assistance',
  'Bottled water during all transfers',
  'All government taxes and service charges',
  'Rest stops with refreshments during long drives',
  'Entrance fee assistance and ticket arrangements',
  'Emergency medical coordination support',
  'Travel insurance guidance and recommendations'
])
FROM packages WHERE slug = 'senior-leisure-transport-accommodation-12days';

-- Senior T&A — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 6 months validity',
  'Sri Lanka tourist visa (ETA — free for most nationalities, apply online)',
  'Travel and medical insurance (mandatory recommendation)',
  'Comfortable walking shoes for gentle sightseeing',
  'Light clothing suitable for tropical and highland climates',
  'Modest attire for temple visits (shoulders and knees covered)',
  'Personal medications and any required medical equipment'
])
FROM packages WHERE slug = 'senior-leisure-transport-accommodation-12days';

-- Senior T&A — Pricing
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 2, 2, 'Per Person – 2 Passengers (Private Car)', true, 1 FROM packages WHERE slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 4, 4, 'Per Person – 4 Passengers (Toyota KDH Van)', false, 2 FROM packages WHERE slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 6, 6, 'Per Person – 6 Passengers (Toyota KDH Van)', false, 3 FROM packages WHERE slug = 'senior-leisure-transport-accommodation-12days';

-- Senior T&A — Day locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Negombo', 'Airport pickup with traditional welcome. Comfortable coastal town introduction with Dutch canals, colonial churches, and beachfront relaxation. Full rest day on Day 2 for travel recovery.', 1, '2 Nights', (SELECT id FROM locations WHERE slug = 'negombo' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Sigiriya', 'Ground-level garden exploration of the UNESCO Lion Rock fortress — no strenuous climbing. Dambulla Cave Temple with rest points. Village bullock cart ride and traditional cooking demonstration.', 2, '2 Nights', (SELECT id FROM locations WHERE slug = 'sigiriya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Kandy', 'Cultural capital with lakeside comfort. Temple of the Tooth Relic (minimal walking, seating areas), Peradeniya Botanical Gardens (paved paths or electric cart), evening cultural dance performance while seated.', 3, '2 Nights', (SELECT id FROM locations WHERE slug = 'kandy' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Nuwara Eliya', '"Little England" at 1,868 m — cool climate, colonial charm, Gregory Lake, heritage hotel with fireplace. Full leisure day for personal-pace exploration.', 4, '2 Nights', (SELECT id FROM locations WHERE slug = 'nuwara-eliya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Beach Resort (Bentota or Passikudah)', 'Three nights at a senior-accessible beach resort — calm waters, pool, spa, and beachfront dining. Complete relaxation with no scheduled activities. Destination varies by season: Bentota (winter) or Passikudah (summer).', 5, '3 Nights', NULL, NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-accommodation-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Airport Departure', 'Leisurely final morning at beach resort before comfortable transfer to Bandaranaike International Airport with rest stops as needed.', 6, '', NULL, NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-accommodation-12days';


-- ═══════════════════════════════════════════════════════════════════════════════
-- SENIOR CITIZENS PACKAGE 2 — Transportation Only (12 Days / 11 Nights)
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  'Senior Citizens Leisure Package – Transportation Only (12 Days / 11 Nights)',
  'senior-leisure-transport-only-12days',
  '<h2>Comfort-Paced Sri Lanka Experience for Senior Travelers</h2>
<p>Discover Sri Lanka''s cultural and natural wonders at a comfortable, unhurried pace designed specifically for mature travelers aged 60 and above. This package includes a private senior-friendly vehicle and English-speaking guide. Guests arrange their own accommodation at premium accessible hotels. No over-rushed itineraries — each day features late morning departures, afternoon rest periods, and activities requiring minimal physical exertion.</p>

<h3>Itinerary Highlights</h3>
<ul>
<li><strong>Day 1:</strong> Airport → Negombo (arrival, rest)</li>
<li><strong>Day 2:</strong> Negombo — Full Rest &amp; Orientation Day</li>
<li><strong>Day 3:</strong> Negombo → Sigiriya (late morning departure, ground-level garden visit)</li>
<li><strong>Day 4:</strong> Sigiriya Area — Dambulla Cave Temple, village tour, bullock cart ride</li>
<li><strong>Day 5:</strong> Sigiriya → Kandy (scenic countryside drive with spice garden stop)</li>
<li><strong>Day 6:</strong> Kandy — Temple of the Tooth Relic, Royal Botanical Gardens (electric cart available), cultural dance show</li>
<li><strong>Day 7:</strong> Kandy → Nuwara Eliya (scenic road, tea factory visit, tea tasting)</li>
<li><strong>Day 8:</strong> Nuwara Eliya — Leisure Day (Gregory Lake, colonial architecture, optional boat ride)</li>
<li><strong>Day 9:</strong> Nuwara Eliya → Beach Resort (Bentota in winter · Passikudah in summer)</li>
<li><strong>Day 10:</strong> Beach Resort — Full Leisure Day</li>
<li><strong>Day 11:</strong> Beach Resort — Second Leisure Day</li>
<li><strong>Day 12:</strong> Beach Resort → Airport Departure</li>
</ul>

<h3>Why This Package is Perfect for Senior Travelers</h3>
<ul>
<li>Late morning departures — no early rush</li>
<li>Afternoon rest periods built into every day</li>
<li>Ground-level Sigiriya garden visit (no rock climbing required)</li>
<li>Electric cart option at Peradeniya Botanical Gardens</li>
<li>Flat paved walkways at all major sites</li>
<li>Senior-friendly driver experienced with mature travelers</li>
<li>Medical support coordination available</li>
</ul>

<h3>Cancellation Policy</h3>
<ul>
<li>30+ days before arrival: No charge</li>
<li>14–29 days: 30% of total booking value</li>
<li>7–13 days: 75% of total booking value</li>
<li>Less than 7 days: 100% of total booking value</li>
</ul>',
  'A comfort-paced 12-day / 11-night Sri Lanka transport package for travelers aged 60 and above — senior-friendly vehicle and guide included, guests arrange own accommodation. Unhurried itinerary with late departures and rest periods.',
  'tour',
  'Sri Lanka',
  0.00,
  '12 Days / 11 Nights',
  8, 8, false, 21,
  '{"packageType":"Transportation Only","targetAudience":"Senior citizens (60+)","validUntil":"2026-12-31","cancellationPolicy":{"30+ days":"No charge","14-29 days":"30% of total booking value","7-13 days":"75% of total booking value","less than 7 days":"100% of total booking value"}}'
) ON CONFLICT (slug) DO NOTHING;

-- Senior T-Only — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Private comfortable air-conditioned vehicle with experienced senior-friendly driver',
  'English-speaking guide throughout (other languages on request)',
  'Airport pickup and drop-off with luggage assistance',
  'Bottled water during all transfers',
  'All government taxes and service charges',
  'Rest stops with refreshments during long drives',
  'Emergency medical coordination support',
  'Travel insurance guidance and recommendations'
])
FROM packages WHERE slug = 'senior-leisure-transport-only-12days';

-- Senior T-Only — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 6 months validity',
  'Sri Lanka tourist visa (ETA — free for most nationalities, apply online)',
  'Travel and medical insurance (mandatory recommendation)',
  'Comfortable walking shoes for gentle sightseeing',
  'Light clothing suitable for tropical and highland climates',
  'Modest attire for temple visits (shoulders and knees covered)',
  'Personal medications and any required medical equipment'
])
FROM packages WHERE slug = 'senior-leisure-transport-only-12days';

-- Senior T-Only — Pricing
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 2, 2, 'Per Person – 2 Passengers (Private Car)', true, 1 FROM packages WHERE slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 4, 4, 'Per Person – 4 Passengers (Toyota KDH Van)', false, 2 FROM packages WHERE slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'GROUP', 6, 6, 'Per Person – 6 Passengers (Toyota KDH Van)', false, 3 FROM packages WHERE slug = 'senior-leisure-transport-only-12days';

-- Senior T-Only — Locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Negombo', 'Arrival, traditional welcome, and full rest day for travel recovery. Coastal town with Dutch canals, colonial churches, and beachfront cafés.', 1, '2 Nights', (SELECT id FROM locations WHERE slug = 'negombo' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Sigiriya', 'Ground-level Sigiriya garden visit (no climbing). Sigiriya Museum, Dambulla Cave Temple with rest points, traditional village bullock cart ride.', 2, '2 Nights', (SELECT id FROM locations WHERE slug = 'sigiriya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Kandy', 'Lakeside cultural capital. Temple of the Tooth Relic with seating areas, Peradeniya Botanical Gardens with electric cart option, Kandyan cultural dance (seated).', 3, '2 Nights', (SELECT id FROM locations WHERE slug = 'kandy' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Nuwara Eliya', '"Little England" highland retreat. Cool climate, colonial architecture, Gregory Lake, tea tasting, and a full leisure day at own pace.', 4, '2 Nights', (SELECT id FROM locations WHERE slug = 'nuwara-eliya' LIMIT 1), NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Beach Resort (Bentota or Passikudah)', 'Three nights of complete beach relaxation — own-arranged accessible resort. Calm waters, optional spa, gentle beach walks. Bentota (winter) or Passikudah (summer).', 5, '3 Nights', NULL, NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-only-12days';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Airport Departure', 'Relaxed final morning before transfer to Bandaranaike International Airport with rest stops as needed.', 6, '', NULL, NOW() FROM packages p WHERE p.slug = 'senior-leisure-transport-only-12days';


-- ═══════════════════════════════════════════════════════════════════════════════
-- DIGITAL NOMAD PACKAGE 1 — Transportation & Accommodation
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  'Digital Nomad Sri Lanka – Transportation & Accommodation',
  'digital-nomad-transport-accommodation',
  '<h2>Digital Nomad Tourism in Sri Lanka</h2>
<p>Sri Lanka''s digital nomad visa is designed for independent professionals who want to live and work from the island. This visa allows you to stay for up to a year with the possibility of renewal. To qualify, you''ll need to demonstrate a minimum monthly income of USD 2,000 coming from sources outside Sri Lanka.</p>

<p><strong>Official Digital Nomad Visa: USD 500 / year</strong></p>

<p>It''s a great way to enjoy the country''s natural beauty, rich culture, and warm climate while maintaining your career. Sri Lanka''s infrastructure for digital nomads is robust — across popular hubs like the southern coast and Colombo, you have access to numerous co-working spaces equipped with air conditioning, private booths, and comfortable workspaces, alongside a variety of cafés perfect for remote work.</p>

<h3>Best Nomad Destinations in Sri Lanka</h3>

<h4>Southern Coast</h4>
<p><strong>Weligama &amp; Ahangama</strong> — Fantastic for surfing, with a lively community and tons of co-working spaces and cafés specifically set up for remote work.</p>
<p><strong>Hiriketiya</strong> — A beautiful bay with a relaxed vibe, perfect if you want something a little more peaceful.</p>

<h4>East Coast</h4>
<p><strong>Arugam Bay</strong> — Perfect if you''re chasing waves during the summer months. A prime surf destination with growing digital nomad infrastructure.</p>

<h3>Why Sri Lanka for Digital Nomads</h3>
<ul>
<li>Reliable high-speed internet — fiber-optic connections, widespread 4G, and even 5G in major hubs</li>
<li>Many co-living spaces offering community amenities like pools and kitchens</li>
<li>Rideshares, local tuk-tuks, and digital payment platforms for convenient daily mobility</li>
<li>Affordable cost of living compared to most Western countries</li>
<li>Year-round warm climate with diverse landscapes — beaches, highlands, and national parks</li>
<li>Rich culture, ancient temples, and vibrant local cuisine</li>
<li>Safe and welcoming environment for international professionals</li>
</ul>

<h3>Transport &amp; Accommodation Package</h3>
<p>Our Digital Nomad package includes comfortable accommodation in nomad-friendly hubs and private transport to help you settle in, explore co-working options, and move between locations during your initial stay. We can arrange accommodation in Colombo, the southern coast, or the east coast based on your preferences.</p>

<h3>Getting Started</h3>
<p>Are you thinking of applying for the Digital Nomad Visa, or would you like to know more about the specific application process? Contact your trusted travel partner Ruklak Travels by email or WhatsApp for personalised assistance.</p>',
  'Live and work from Sri Lanka on the official Digital Nomad Visa (USD 500/year, up to 12 months). Package includes accommodation in nomad-friendly hubs and private transport. High-speed internet, co-working spaces, surf beaches, and a thriving remote-work community.',
  'tour',
  'Sri Lanka',
  0.00,
  'Flexible (1 Week – 1 Year)',
  4, 4, false, 30,
  '{"packageType":"Transportation and Accommodation","targetAudience":"Digital nomads and remote workers","visaType":"Digital Nomad Visa","visaCost":"USD 500/year","minimumIncome":"USD 2,000/month from outside Sri Lanka","popularHubs":["Weligama","Ahangama","Hiriketiya","Arugam Bay","Colombo"]}'
) ON CONFLICT (slug) DO NOTHING;

-- Nomad T&A — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Accommodation in nomad-friendly locations (duration as agreed)',
  'Private vehicle for airport transfer and initial hub exploration',
  'English-speaking local guide to help settle into co-working hubs',
  'All applicable taxes and VAT',
  'Bottled water during transfers'
])
FROM packages WHERE slug = 'digital-nomad-transport-accommodation';

-- Nomad T&A — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 12 months validity',
  'Proof of remote income of minimum USD 2,000/month from outside Sri Lanka',
  'Digital Nomad Visa application (USD 500 — apply separately through Sri Lanka immigration)',
  'Laptop and work equipment',
  'Personal travel and health insurance recommended'
])
FROM packages WHERE slug = 'digital-nomad-transport-accommodation';

-- Nomad T&A — Pricing
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'PER_PERSON', 1, 1, 'Per Person (Contact for custom quote)', true, 1 FROM packages WHERE slug = 'digital-nomad-transport-accommodation';

-- Nomad T&A — Locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Colombo', 'Sri Lanka''s vibrant capital — excellent co-working spaces, international restaurants, fast fiber internet, and easy connections to the rest of the island.', 1, 'Optional', NULL, NOW() FROM packages p WHERE p.slug = 'digital-nomad-transport-accommodation';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Weligama / Ahangama (South Coast)', 'The premier digital nomad hub — world-class surfing, abundant co-working cafés, co-living spaces with pools, and a thriving international community of remote workers.', 2, 'Flexible', NULL, NOW() FROM packages p WHERE p.slug = 'digital-nomad-transport-accommodation';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Arugam Bay (East Coast)', 'Sri Lanka''s surf capital on the east coast — perfect for summer months, relaxed vibe, growing co-working scene, and stunning bay scenery.', 3, 'Flexible', NULL, NOW() FROM packages p WHERE p.slug = 'digital-nomad-transport-accommodation';


-- ═══════════════════════════════════════════════════════════════════════════════
-- DIGITAL NOMAD PACKAGE 2 — Transportation Only
-- ═══════════════════════════════════════════════════════════════════════════════
INSERT INTO packages (
  title, slug, description, short_description, category, location,
  price, duration, max_participants, available_spots,
  featured, display_order, additional_details
) VALUES (
  'Digital Nomad Sri Lanka – Transportation Only',
  'digital-nomad-transport-only',
  '<h2>Digital Nomad Tourism in Sri Lanka</h2>
<p>Sri Lanka''s digital nomad visa is designed for independent professionals who want to live and work from the island. This visa allows you to stay for up to a year with the possibility of renewal. To qualify, you''ll need to demonstrate a minimum monthly income of USD 2,000 coming from sources outside Sri Lanka.</p>

<p><strong>Official Digital Nomad Visa: USD 500 / year</strong></p>

<h3>Transport-Only Option</h3>
<p>Already know where you want to stay? Our transport-only package gives you a private vehicle and local assistance to move between nomad hubs, explore the island, and handle logistics — while you arrange your own co-living or accommodation.</p>

<h3>Best Nomad Destinations in Sri Lanka</h3>
<ul>
<li><strong>Weligama &amp; Ahangama:</strong> Surfing, co-working spaces, lively international community</li>
<li><strong>Hiriketiya:</strong> Peaceful bay, relaxed vibe, excellent for focused work retreats</li>
<li><strong>Arugam Bay:</strong> East coast surf paradise, summer months (May–Oct)</li>
<li><strong>Colombo:</strong> Capital city, fiber internet, international co-working offices</li>
</ul>

<h3>Why Sri Lanka for Digital Nomads</h3>
<ul>
<li>High-speed internet — fiber-optic, widespread 4G and 5G</li>
<li>Co-living spaces with pools, kitchens, and community events</li>
<li>Rideshares, tuk-tuks, and digital payments for easy mobility</li>
<li>Affordable cost of living · Warm climate year-round</li>
<li>Rich culture, ancient temples, national parks, and diverse cuisine</li>
</ul>

<p>Contact your trusted travel partner Ruklak Travels by email or WhatsApp for personalised assistance with visa application, co-working recommendations, and transport planning.</p>',
  'Transport package for digital nomads on the Sri Lanka Nomad Visa (USD 500/year). Private vehicle between hubs — Colombo, Weligama, Hiriketiya, Arugam Bay. Guests arrange their own co-living or accommodation.',
  'tour',
  'Sri Lanka',
  0.00,
  'Flexible (1 Week – 1 Year)',
  4, 4, false, 31,
  '{"packageType":"Transportation Only","targetAudience":"Digital nomads and remote workers","visaType":"Digital Nomad Visa","visaCost":"USD 500/year","minimumIncome":"USD 2,000/month from outside Sri Lanka"}'
) ON CONFLICT (slug) DO NOTHING;

-- Nomad T-Only — Inclusions
INSERT INTO package_included (package_id, included_item)
SELECT id, unnest(ARRAY[
  'Private vehicle for airport transfer and inter-hub travel',
  'English-speaking local guide for logistics and orientation',
  'All applicable taxes and VAT',
  'Bottled water during transfers'
])
FROM packages WHERE slug = 'digital-nomad-transport-only';

-- Nomad T-Only — Requirements
INSERT INTO package_requirements (package_id, requirement)
SELECT id, unnest(ARRAY[
  'Valid passport with at least 12 months validity',
  'Proof of remote income of minimum USD 2,000/month from outside Sri Lanka',
  'Digital Nomad Visa (USD 500 — apply separately through Sri Lanka immigration)',
  'Laptop and work equipment',
  'Personal travel and health insurance recommended'
])
FROM packages WHERE slug = 'digital-nomad-transport-only';

-- Nomad T-Only — Pricing
INSERT INTO package_pricing (package_id, currency_code, amount, pricing_type, group_size_min, group_size_max, label, is_primary, display_order)
SELECT id, 'USD', 0.00, 'PER_PERSON', 1, 1, 'Per Person (Contact for custom quote)', true, 1 FROM packages WHERE slug = 'digital-nomad-transport-only';

-- Nomad T-Only — Locations
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Colombo', 'Capital hub with fast internet, international co-working offices, and easy island-wide connections.', 1, 'Optional', NULL, NOW() FROM packages p WHERE p.slug = 'digital-nomad-transport-only';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Weligama / Ahangama (South Coast)', 'Premier nomad hub — surf, co-working cafés, co-living spaces, and thriving international community.', 2, 'Flexible', NULL, NOW() FROM packages p WHERE p.slug = 'digital-nomad-transport-only';
INSERT INTO package_locations (package_id, name, description, visit_order, duration_here, location_ref_id, created_at)
SELECT p.id, 'Arugam Bay (East Coast)', 'East coast surf paradise — ideal for summer months with a growing remote-work community.', 3, 'Flexible', NULL, NOW() FROM packages p WHERE p.slug = 'digital-nomad-transport-only';
