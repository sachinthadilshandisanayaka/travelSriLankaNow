-- V35__seed_locations.sql
-- Seed Sri Lanka tourism location data

-- ─── 1. Sigiriya ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Sigiriya', 'sigiriya',
  'Sigiriya, the iconic rock fortress also known as the ''Lion Rock,'' is one of Sri Lanka''s greatest archaeological wonders and a UNESCO World Heritage Site. Built by King Kashyapa in the 5th century, this ancient palace complex is perched atop a 200-meter-high rock with panoramic views of the surrounding jungle and water gardens. The climb up the rock is as fascinating as the view from the top — with its frescoes, Mirror Wall, and lion-paw entrance. Sigiriya is surrounded by traditional villages and lush landscapes, making it ideal for those seeking a mix of history, culture, and nature. The nearby Pidurangala Rock offers a less crowded but equally impressive climb and view.',
  'Sigiriya, the iconic rock fortress known as the ''Lion Rock,'' is one of Sri Lanka''s greatest archaeological wonders and a UNESCO World Heritage Site.',
  'cultural', 'central', false, 1, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Sigiriya Rock Fortress','Frescoes and Mirror Wall','Lion''s Paw Terraces','Royal Water Gardens','Boulder Garden','Sigiriya Museum','Moats and Ramparts','Cobra Hood Cave','Pidurangala Rock','Village Paddy Fields'])
FROM locations WHERE slug = 'sigiriya';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Climb Sigiriya Rock','Visit Pidurangala Rock for sunrise views','Explore Sigiriya Museum','Take a village bullock cart ride','Enjoy a traditional village lunch','Try a Sri Lankan cooking class','Cycle around rural trails','Birdwatching around the moats','Join a local pottery or craft session','Watch sunset over the plains'])
FROM locations WHERE slug = 'sigiriya';

-- ─── 2. Kandy ─────────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Kandy', 'kandy',
  'Kandy is the cultural capital of Sri Lanka, surrounded by misty hills and centered around the sacred Temple of the Tooth Relic — one of the most important Buddhist pilgrimage sites in the world. The city''s colonial charm, scenic lake, and vibrant cultural life attract travelers from around the globe. Kandy also serves as the gateway to the Knuckles Mountain Range and central highlands. The Esala Perahera, a grand procession of dancers, elephants, and musicians held in July or August, is one of the most spectacular festivals in Asia.',
  'Kandy is the cultural capital of Sri Lanka, home to the sacred Temple of the Tooth Relic and the magnificent Esala Perahera festival.',
  'cultural', 'central', false, 2, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Temple of the Tooth Relic','Kandy Lake','Bahirawakanda Buddha Statue','Royal Botanical Gardens, Peradeniya','Kandy Viewpoint','Cultural Center','British Garrison Cemetery','Udawatta Kele Sanctuary','Hindu Temples (Natha Devale)','Tea Museum and Plantations'])
FROM locations WHERE slug = 'kandy';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Visit the Temple of the Tooth','Walk or take a boat ride around Kandy Lake','Attend a Kandyan dance performance','Picnic in Royal Botanical Gardens','Hike in Udawatta Kele Sanctuary','Visit the market and buy handicrafts','Explore nearby tea estates','Take the scenic train to Nuwara Eliya','Try traditional Kandyan sweets','Watch the Esala Perahera (if in season)'])
FROM locations WHERE slug = 'kandy';

-- ─── 3. Polonnaruwa ───────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Polonnaruwa', 'polonnaruwa',
  'Polonnaruwa is Sri Lanka''s best-preserved ancient city and a UNESCO World Heritage Site. It served as the capital during the 10th to 12th centuries and is a treasure trove of temples, stupas, and royal palaces. The site is compact enough to explore in a day, making it ideal for cycling. The Gal Vihara statues carved into a single granite slab are a highlight. Surrounded by lakes and forest, the area offers a peaceful escape into history, culture, and nature. Wildlife like monkeys and birds are commonly seen around the ruins.',
  'Polonnaruwa is Sri Lanka''s best-preserved ancient city and a UNESCO World Heritage Site, compact enough to explore by bicycle in a single day.',
  'cultural', 'north', false, 3, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Gal Vihara Buddha Statues','Royal Palace Complex','Quadrangle (Vatadage & Thuparama)','Rankoth Vehera','Parakrama Samudra Reservoir','Shiva Devalayas (Hindu Temples)','Lankatilaka Image House','Nissanka Latha Mandapaya','Ancient Moats and Waterways','Archaeological Museum'])
FROM locations WHERE slug = 'polonnaruwa';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Cycle through ancient ruins','Visit the Gal Vihara rock statues','Explore the King''s Council Chamber','Watch monkeys in their natural setting','Enjoy a boat ride near the reservoir','Visit a local pottery workshop','Birdwatching near Parakrama Samudra','Learn from archaeological guides','Capture sunrise photos over ruins','Try fresh buffalo curd in local eateries'])
FROM locations WHERE slug = 'polonnaruwa';

-- ─── 4. Minneriya ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Minneriya', 'minneriya',
  'Minneriya is located within Sri Lanka''s Cultural Triangle and is internationally renowned for "The Gathering," where over 300 wild elephants congregate around the ancient reservoir during the dry season. The park features lush plains, swampy wetlands, and lowland forest, creating a haven for diverse animal species. It is a crucial part of the elephant migration corridor that connects to Kaudulla and Hurulu Eco Park. Minneriya''s accessibility from Sigiriya and Polonnaruwa makes it a popular and rewarding safari destination.',
  'Minneriya is internationally renowned for "The Gathering," where over 300 wild elephants congregate around its ancient reservoir during the dry season.',
  'wildlife', 'central', false, 4, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Large Herds of Elephants','Minneriya Tank','Toque Macaques','Spotted Deer','Crocodiles and Turtles','Purple Herons and Storks','Monitor Lizards','Termite Mounds','Sambar Deer','Wetland Ecosystems'])
FROM locations WHERE slug = 'minneriya';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Watch "The Gathering" (June–September)','Jeep safari through the park','Birdwatching near the tank','Explore nearby Kaudulla Park','Visit ancient waterworks','Boat ride near tank borders','Join conservation talks','Picnic with lake views','Learn about elephant behavior from rangers','Photograph wildlife at sunset'])
FROM locations WHERE slug = 'minneriya';

-- ─── 5. Mirissa ───────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Mirissa', 'mirissa',
  'Mirissa is a tropical beach town on the southern coast, famous for whale watching and vibrant beach nightlife. The crescent-shaped bay is lined with palm trees, beach bars, and surf spots. Mirissa offers a laid-back escape with plenty of water activities, from surfing and snorkeling to catamaran cruises. It''s also the country''s top location for spotting blue whales and dolphins on guided ocean safaris.',
  'Mirissa is a tropical beach town on the southern coast, famous for whale watching, surfing, and vibrant beachside nightlife.',
  'beach', 'south', false, 5, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Mirissa Beach','Parrot Rock','Secret Beach','Coconut Tree Hill','Whale & Dolphin Watching Boats','Surfing Point Break','Stilt Fishermen Nearby','Taprobane Island (Weligama)','Beachside Cafés and Bars','Snake Farm Nearby'])
FROM locations WHERE slug = 'mirissa';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Go whale watching (November–April)','Relax on Secret Beach','Surf or take surf lessons','Hike to Coconut Tree Hill','Take a sunset catamaran cruise','Snorkel in clear waters','Visit a local massage spa','Try seafood BBQ at the beach','Watch fishermen cast nets','Party at a beach club'])
FROM locations WHERE slug = 'mirissa';

-- ─── 6. Nilaveli ──────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Nilaveli', 'nilaveli',
  'Nilaveli, just north of Trincomalee, is a peaceful coastal retreat known for its white sands and shallow turquoise waters. It is ideal for quiet beach holidays, snorkeling, and marine life exploration. With fewer crowds, Nilaveli offers a more authentic and relaxing experience than southern beaches. Its calm sea and proximity to Pigeon Island make it one of Sri Lanka''s best snorkeling destinations.',
  'Nilaveli is a peaceful coastal retreat north of Trincomalee, known for its white sands and proximity to Pigeon Island Marine Park.',
  'beach', 'east', false, 6, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Nilaveli Beach','Pigeon Island Marine Park','Coral Gardens','Fishing Boats at Dawn','Local Hindu Shrines','Mangroves and Estuaries','Coconut-Lined Coastlines','Natural Coral Reefs','Underwater Marine Life','Sunrise over the Ocean'])
FROM locations WHERE slug = 'nilaveli';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Go snorkeling at Pigeon Island','Swim in shallow seas','Enjoy boat trips and island hopping','Take sunset walks on the beach','Relax in beachfront cabanas','Join a fishing trip','Birdwatch near lagoons','Visit nearby Trincomalee temples','Try fresh seafood by the sea','Kayak along mangrove canals'])
FROM locations WHERE slug = 'nilaveli';

-- ─── 7. Matale ────────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Matale', 'matale',
  'Matale, nestled in the Central Highlands just north of Kandy, is a charming town known for its spice gardens, Hindu temples, and historical importance. It served as a key battleground during Sri Lanka''s colonial uprisings and is home to the iconic Aluvihara Rock Temple, where Buddhist scriptures were first written down. Matale also offers cool air, cultural diversity, and access to beautiful natural landscapes such as the Knuckles Mountains and Sembuwatta Lake. Visitors are drawn to its blend of heritage, spirituality, and tranquil scenery.',
  'Matale is a charming town known for its spice gardens, the Aluvihara Rock Temple where Buddhist scriptures were first written, and access to the Knuckles Mountains.',
  'cultural', 'central', false, 7, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Aluvihara Rock Temple','Spice Gardens','Muthumariamman Hindu Temple','Gedige (Ancient Hindu-Buddhist Site)','Sembuwatta Lake (Nearby)','Matale Heritage Center','Agricultural Museum','Small Village Shrines','Matale Town Market','Colonial Memorial'])
FROM locations WHERE slug = 'matale';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Explore cave temples at Aluvihara','Tour spice gardens with tastings','Visit Muthumariamman Temple','Hike to Sembuwatta Lake','Browse the Matale Heritage Center','Visit the Agricultural Museum','Shop at Matale town market','Walk to local village shrines','Try fresh spices and herbal teas','Day trip to the Knuckles Range'])
FROM locations WHERE slug = 'matale';

-- ─── 8. Kitulgala ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Kitulgala', 'kitulgala',
  'Kitulgala is Sri Lanka''s adventure capital, famous for white-water rafting on the Kelani River. Surrounded by rainforest, waterfalls, and caves, it is also where parts of The Bridge on the River Kwai were filmed. Adventure lovers flock here for rafting, canyoning, jungle hikes, and birdwatching. Kitulgala is also home to endemic species and hidden archaeological sites. Despite its adventure vibe, the area offers tranquil eco-lodges for rest and rejuvenation between thrill-seeking.',
  'Kitulgala is Sri Lanka''s adventure capital, famous for white-water rafting on the Kelani River and stunning rainforest landscapes.',
  'mountain', 'west', false, 8, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Kelani River Rafting','Makandawa Rainforest Reserve','Belilena Cave (Prehistoric Site)','Waterfalls and Streams','Scenic Mountain Views','River Kwai Film Location','Natural Rock Pools','Bamboo Forests','Caves and Bat Colonies','Rubber and Spice Estates'])
FROM locations WHERE slug = 'kitulgala';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Go white-water rafting','Hike to Belilena Cave','Go canyoning and waterfall abseiling','Birdwatching in the rainforest','Take nature walks and jungle treks','Swim in clear jungle pools','Kayak along the river','Zipline through the trees','Stay in eco-lodges and treehouses','Join a guided rainforest night walk'])
FROM locations WHERE slug = 'kitulgala';

-- ─── 9. Negombo ───────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Negombo', 'negombo',
  'Negombo is a laid-back coastal town close to the Bandaranaike International Airport, making it a popular first or last stop for travelers in Sri Lanka. Known for its colonial canals, Dutch-era churches, and sandy beach, Negombo also boasts a rich Catholic heritage and bustling fish markets. Its accessibility, friendly locals, and lively town atmosphere make it a great introduction to island life.',
  'Negombo is a laid-back coastal town near Colombo''s international airport, known for its Dutch canals, colonial churches, and bustling fish markets.',
  'beach', 'west', false, 9, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Negombo Beach','St. Mary''s Church','Dutch Canal','Negombo Lagoon','Fish Markets and Auctions','Angurukaramulla Temple','Hamilton Canal','Remains of the Dutch Fort','Local Seafood Stalls','Catholic Shrines and Crosses'])
FROM locations WHERE slug = 'negombo';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Take a lagoon boat tour','Walk the Dutch Canal paths','Visit fish markets in the morning','Dine on fresh crab and prawns','Explore churches and colonial buildings','Cycle around the old town','Relax at a beachfront café','Visit Buddhist and Hindu temples','Watch the sunset from the beach','Shop for handicrafts and batik'])
FROM locations WHERE slug = 'negombo';

-- ─── 10. Pinnawala ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Pinnawala', 'pinnawala',
  'Pinnawala is most famous for the Pinnawala Elephant Orphanage, one of the largest in the world. Established in 1975, it cares for abandoned or injured elephants, offering visitors the chance to observe bathing, feeding, and social interaction up close. The nearby Pinnawala Zoo and Millennium Elephant Foundation offer more insight into Sri Lanka''s elephant conservation efforts.',
  'Pinnawala is famous for its Elephant Orphanage, one of the world''s largest, where visitors can observe elephant bathing, feeding, and conservation efforts.',
  'wildlife', 'central', false, 10, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Pinnawala Elephant Orphanage','Elephant Bathing at Maha Oya River','Elephant Feeding Sessions','Millennium Elephant Foundation','Pinnawala Zoo','Village Shops and Markets','Coconut Plantations','Local Craft Stores','Rural Scenery','Elephant Enrichment Zone'])
FROM locations WHERE slug = 'pinnawala';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Watch elephant river bathing','Bottle-feed baby elephants (scheduled times)','Visit the zoo and learn about local species','Walk through the elephant sanctuary','Shop for elephant-themed souvenirs','Observe mahouts at work','Learn from wildlife guides','Relax at a riverside restaurant','Photograph elephants in open space','Ride a tuk-tuk through the village'])
FROM locations WHERE slug = 'pinnawala';

-- ─── 11. Arugam Bay ───────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Arugam Bay', 'arugam-bay',
  'Arugam Bay is Sri Lanka''s premier surf destination, located on the southeast coast near Pottuvil. Famed for its consistent point breaks and laid-back atmosphere, it draws surfers, backpackers, and beach lovers from around the world. The area features wide sandy beaches, wildlife-rich lagoons, and a growing scene of beach cafés, yoga retreats, and boutique stays. Beyond surfing, visitors can enjoy safaris in Kumana National Park and cultural visits to ancient temples.',
  'Arugam Bay is Sri Lanka''s premier surf destination on the southeast coast, famed for consistent point breaks, wildlife lagoons, and a relaxed backpacker vibe.',
  'beach', 'east', false, 11, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Main Point Surf Break','Peanut Farm Beach','Elephant Rock Viewpoint','Panama Crocodile Rock','Pottuvil Lagoon','Muhudu Maha Viharaya (Ancient Temple)','Whiskey Point','Okanda Hindu Shrine','Sand Dunes of Panama','Wildlife Around Lagoons'])
FROM locations WHERE slug = 'arugam-bay';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Surfing at Main Point or Whiskey Point','Take a lagoon safari (birds, elephants, crocodiles)','Yoga and wellness classes by the beach','Explore sand dunes by 4x4','Visit ancient temples and rock carvings','Eat at beach cafés and reggae bars','Camp or stargaze by the ocean','Learn to surf at local surf schools','Visit Kumana National Park for wildlife safaris','Go fishing with local boatmen'])
FROM locations WHERE slug = 'arugam-bay';

-- ─── 12. Hikkaduwa ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Hikkaduwa', 'hikkaduwa',
  'Hikkaduwa, located on Sri Lanka''s southwest coast, is a vibrant beach town known for its coral reefs, water sports, and nightlife. Once a sleepy fishing village, it''s now a favorite spot for snorkeling with sea turtles, surfing gentle waves, and enjoying beach parties. The town has a laid-back vibe, lined with beachfront restaurants, dive centers, and artisan shops. Hikkaduwa Marine National Park protects the reef and its marine life, making it ideal for eco-tourism. Visitors can also explore Buddhist temples and learn about traditional mask-making.',
  'Hikkaduwa is a vibrant beach town on the southwest coast famous for coral reefs, sea turtles, surf, and lively beach nightlife.',
  'beach', 'south', false, 12, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Hikkaduwa Beach','Coral Sanctuary','Seenigama Vihara Temple (on a small island)','Sea Turtle Hatchery','Tsunami Photo Museum','Narigama Beach','Hikkaduwa Lake','Buddhist Monasteries Inland','Traditional Stilt Fishermen','Local Art and Mask Shops'])
FROM locations WHERE slug = 'hikkaduwa';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Snorkel with sea turtles','Explore mask museums and artisan workshops','Take a glass-bottom boat ride','Try seafood at beach restaurants','Surf or take surf lessons','Attend a beach party or live music night','Visit the tsunami memorial and museum','Go kayaking in Hikkaduwa Lake','Shop for handmade crafts and batik','Take scuba diving lessons'])
FROM locations WHERE slug = 'hikkaduwa';

-- ─── 13. Beruwala and Aluthgama ───────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Beruwala and Aluthgama', 'beruwala-aluthgama',
  'Beruwala and Aluthgama are twin coastal towns on the southwest coast, offering a mix of culture, beach relaxation, and Ayurveda wellness. Beruwala is known for its long beaches and the historic Ketchimalai Mosque, one of the oldest in Sri Lanka. Aluthgama features calm lagoons ideal for boating. Together, they cater to those seeking serene beach holidays with a touch of local tradition, especially among Muslim and Buddhist communities.',
  'Beruwala and Aluthgama are twin coastal towns offering beach relaxation, Ayurveda wellness, and the historic Ketchimalai Mosque on the southwest coast.',
  'beach', 'west', false, 13, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Beruwala Beach','Ketchimalai Mosque','Aluthgama Lagoon','Local Fishing Harbor','Bentota River Mouth','Barberyn Island Lighthouse','Brief Garden (Nearby)','Ayurveda Healing Centers','Temple of Seenawatte','Island Mangrove Ecosystems'])
FROM locations WHERE slug = 'beruwala-aluthgama';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Relax on wide golden beaches','Take a boat ride in Aluthgama Lagoon','Visit the mosque and learn about Muslim heritage','Go kayaking or paddleboarding','Join an Ayurveda massage or detox session','Watch fishermen return with the day''s catch','Explore Brief Garden by Bevis Bawa','Try a traditional Muslim biryani','Shop for gems and coastal handicrafts','Go snorkeling or reef fishing'])
FROM locations WHERE slug = 'beruwala-aluthgama';

-- ─── 14. Delft Island ─────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Delft Island', 'delft-island',
  'Delft Island, or Neduntheevu, is a remote and windswept island off the Jaffna Peninsula, known for its wild ponies, colonial ruins, and coral walls. Largely untouched by modern tourism, Delft offers a surreal experience blending history, nature, and isolation. Accessible by ferry, it provides a unique escape from mainland crowds. Visitors can explore Dutch forts, Buddhist remnants, and endless landscapes dotted with donkeys and baobab trees.',
  'Delft Island is a remote island off Jaffna known for wild ponies, Dutch colonial ruins, ancient coral walls, and an untouched, windswept landscape.',
  'cultural', 'north', false, 14, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Wild Ponies','Dutch Fort Ruins','Ancient Buddhist Chaitya','Coral Walls and Fences','Giant Baobab Tree','Queen''s Tower Lighthouse','Growing Stone (Mystical Rock)','Pigeon Nests Tower','Palmyra Palm Groves','Coastal Tide Pools'])
FROM locations WHERE slug = 'delft-island';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Take a ferry adventure from Jaffna','Cycle around the island','Photograph wild donkeys and ponies','Visit Dutch ruins and coral structures','Observe local village life','Try Jaffna-style seafood meals','Climb Queen''s Tower for coastal views','Spot dolphins near the coast (boat trip)','Talk to local guides for folklore','Explore the ancient Buddhist chaitya'])
FROM locations WHERE slug = 'delft-island';

-- ─── 15. Jaffna ───────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Jaffna', 'jaffna',
  'Jaffna is the cultural heart of Sri Lanka''s Tamil population, offering unique food, religious sites, and colonial history. Located at the northern tip of the island, Jaffna is a vibrant yet peaceful city with a distinct identity. Key attractions include the Nallur Kandaswamy Kovil, ancient forts, and islands like Delft and Nagadeepa. The area was isolated for years due to civil war but is now open and welcoming. Visitors can enjoy spicy Jaffna cuisine, colorful Hindu rituals, and serene beaches.',
  'Jaffna is the cultural heart of Sri Lanka''s Tamil population, offering spicy cuisine, vibrant Hindu temples, ancient forts, and colorful religious rituals.',
  'cultural', 'north', false, 15, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Nallur Kandaswamy Temple','Jaffna Fort','Nagadeepa Island Temple','Jaffna Library','Manalkadu Sand Dunes','Keerimalai Springs','Casuarina Beach','Hindu Shrines and Kovils','Archaeological Museum','Delft Island (Wild Ponies)'])
FROM locations WHERE slug = 'jaffna';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Attend temple rituals at Nallur','Take a ferry to nearby islands','Try crab curry and Jaffna thali','Visit colonial churches','Cycle around town','Swim at quiet beaches','Visit traditional markets','Learn about Hindu astrology','Explore Portuguese ruins','Watch evening puja processions'])
FROM locations WHERE slug = 'jaffna';

-- ─── 16. Yala ─────────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Yala', 'yala',
  'Yala, located in Sri Lanka''s southeastern corner, is the most visited national park in the country and is world-renowned for having the highest leopard density on Earth. This vast reserve blends grasslands, lagoons, forests, and scrub jungle to create a rich and diverse habitat for wildlife, including elephants, sloth bears, crocodiles, and over 200 bird species. Cultural and historical treasures like Sithulpawwa Rock Temple and Magul Maha Viharaya lie hidden deep within the jungle. Yala is a must for nature enthusiasts, wildlife photographers, and adventure seekers.',
  'Yala is Sri Lanka''s most visited national park, world-renowned for the highest leopard density on Earth and diverse wildlife across grasslands and lagoons.',
  'wildlife', 'south', false, 16, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Leopards','Wild Elephants','Spotted Deer','Sloth Bears','Crocodiles','Peacocks and Hornbills','Water Buffaloes','Sithulpawwa Rock Temple','Magul Maha Viharaya','Coastal Lagoons and Dunes'])
FROM locations WHERE slug = 'yala';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Jeep safaris at sunrise and sunset','Wildlife photography','Visit ancient temples inside the park','Birdwatching tours','Spot leopards in scrub jungle','Observe elephants at waterholes','Explore coastal dune ecosystems','Night safaris (select areas)','Photography workshops in the wild','Learn about conservation from guides'])
FROM locations WHERE slug = 'yala';

-- ─── 17. Udawalawe ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Udawalawe', 'udawalawe',
  'Udawalawe is Sri Lanka''s elephant country — a sanctuary with open landscapes and a calm safari experience. Located on the edge of Sabaragamuwa Province, this park offers near-guaranteed elephant sightings any time of year. Open grasslands, bush forests, and the giant Udawalawe Reservoir support a rich variety of animals. Unlike denser parks, Udawalawe''s visibility makes spotting wildlife easy. The Elephant Transit Home (ETH), where orphaned elephants are rehabilitated and released, is a major highlight for conservation-minded visitors.',
  'Udawalawe offers near-guaranteed elephant sightings in open savanna landscapes, with the Elephant Transit Home as a major conservation highlight.',
  'wildlife', 'south', false, 17, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Elephant Herds','Peacock Displays','Mugger Crocodiles','Sri Lankan Junglefowl','Walawe Reservoir','Buffalo Herds','Grey Langurs and Toque Macaques','Raptors and Water Birds','Termite Mounds','Elephant Transit Home'])
FROM locations WHERE slug = 'udawalawe';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Jeep safaris through open grasslands','Visit the Elephant Transit Home','Birdwatching tours','Sunset photography','Eco-lodge stay','Visit nearby Chandrika Lake','Nature journaling','Stargazing from eco-camps','Walk village trails','Try a local herbal bath'])
FROM locations WHERE slug = 'udawalawe';

-- ─── 18. Wilpattu ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Wilpattu', 'wilpattu',
  'Wilpattu, Sri Lanka''s largest and oldest national park, lies in the northwestern region near Anuradhapura. Its name means "Land of Lakes," thanks to its unique system of natural waterholes called "villus." Unlike Yala, Wilpattu features thick jungle terrain and wide open spaces where leopards, sloth bears, and elephants roam free. It is less commercialized and ideal for those seeking peaceful encounters with nature. The safari experience feels more intimate, often with long stretches without other jeeps.',
  'Wilpattu is Sri Lanka''s largest national park, known as the "Land of Lakes," offering intimate wildlife encounters with leopards, bears, and elephants away from the crowds.',
  'wildlife', 'north', false, 18, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Natural Villus (Lakes)','Leopards','Sloth Bears','Elephants','Water Buffaloes','Spotted Deer','Wild Boar','Marsh Crocodiles','Grey Hornbills','Thick Jungle Terrain'])
FROM locations WHERE slug = 'wilpattu';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Full-day safaris through thick jungle','Spot elusive leopards and bears','Visit forest-hidden temples','Capture wildlife photos','Quiet nature meditation','Birdwatching walks','Visit ruins near ancient tanks','Watch sunrise over a villu lake','Camp at forest rest houses','Learn from experienced trackers'])
FROM locations WHERE slug = 'wilpattu';

-- ─── 19. Sinharaja ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Sinharaja', 'sinharaja',
  'Sinharaja is Sri Lanka''s last great lowland rainforest, recognized as a UNESCO World Heritage Site and biosphere reserve. It is a paradise for ecotourists, botanists, and bird lovers. This dense, misty jungle is home to more than 60% of the country''s endemic species, including rare birds like the Sri Lanka blue magpie and green-billed coucal. Guided treks offer glimpses of monkeys, amphibians, insects, and giant hardwood trees. The forest plays a vital role in the island''s ecology and is protected by law.',
  'Sinharaja is Sri Lanka''s last great lowland rainforest and a UNESCO World Heritage Site, home to over 60% of the country''s endemic species.',
  'wildlife', 'south', false, 19, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Endemic Bird Species','Giant Trees and Rare Orchids','Tree Frogs and Snakes','Exotic Butterflies','Giant Squirrels and Monkeys','Tropical Ferns and Vines','Rainforest Canopy Views','Hidden Waterfalls','Lichens and Fungi','Kudawa Biodiversity Center'])
FROM locations WHERE slug = 'sinharaja';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Guided rainforest hikes','Birdwatching tours','Visit waterfalls and streams','Educational nature walks','Photography of flora and fauna','Join eco-awareness sessions','Visit tea estates nearby','Observe medicinal plants','Picnic near trailheads','Watch endemic reptiles and amphibians'])
FROM locations WHERE slug = 'sinharaja';

-- ─── 20. Anuradhapura ─────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Anuradhapura', 'anuradhapura',
  'Anuradhapura is one of the oldest continuously inhabited cities in the world and a sacred center of Buddhism. As Sri Lanka''s first capital, its sprawling complex of stupas, temples, monasteries, and sacred trees offers a deep spiritual and historical experience. The Sri Maha Bodhi, grown from a branch of the original Bodhi Tree under which the Buddha attained enlightenment, is the heart of the city. Anuradhapura is especially atmospheric during full moon days when thousands of devotees visit its ancient shrines.',
  'Anuradhapura is one of the world''s oldest cities and Sri Lanka''s first capital, centered on the sacred Sri Maha Bodhi Tree and magnificent ancient stupas.',
  'cultural', 'north', false, 20, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Sri Maha Bodhi Tree','Ruwanwelisaya Stupa','Jetavanaramaya Stupa','Abhayagiri Monastery Complex','Thuparamaya Stupa','Isurumuniya Temple (Rock Carvings)','Samadhi Buddha Statue','Kuttam Pokuna (Twin Ponds)','Lovamahapaya (Brazen Palace)','Moonstones and Guard Stones'])
FROM locations WHERE slug = 'anuradhapura';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Join pilgrims on Poya Day','Meditate under the Bodhi Tree','Visit all major stupas','Explore on foot or bicycle','Take a tuk-tuk heritage tour','Watch sunset at Tissa Wewa tank','Try local vegetarian Buddhist meals','Visit nearby Mihintale mountain temple','Explore museum exhibits','Experience local village life'])
FROM locations WHERE slug = 'anuradhapura';

-- ─── 21. Dambulla ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Dambulla', 'dambulla',
  'Dambulla is known for its majestic cave temple complex, the largest and best-preserved in Sri Lanka. Designated as a UNESCO World Heritage Site, the Dambulla Cave Temple features more than 150 Buddha statues and vibrant ceiling murals. Located atop a massive rock outcrop, the temple also offers panoramic views of the surrounding plains. Dambulla is a central base for visiting Sigiriya, Polonnaruwa, and Minneriya. The town is also known for its vegetable market — one of the country''s largest.',
  'Dambulla is home to Sri Lanka''s largest cave temple complex, a UNESCO World Heritage Site featuring over 150 Buddha statues and vivid ancient murals.',
  'cultural', 'central', false, 21, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Dambulla Cave Temple Complex','Golden Buddha Statue','Ibbankatuwa Megalithic Tombs','Jathika Namal Uyana (Ironwood Forest)','Rose Quartz Mountain at Namal Uyana','Dambulla Vegetable Market','Local Buddhist Meditation Centers','Stupa at Popham Arboretum','Rock Inscriptions and Ancient Murals','Panoramic Viewpoints from Dambulla Rock'])
FROM locations WHERE slug = 'dambulla';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Explore the cave temple complex','Visit the Golden Buddha Statue','Walk through Jathika Namal Uyana','Visit Rose Quartz Mountain','Browse Dambulla Vegetable Market','Meditate at Buddhist centers','Visit Ibbankatuwa Megalithic Tombs','Explore Popham Arboretum','Photograph ancient murals','Enjoy panoramic views from Dambulla Rock'])
FROM locations WHERE slug = 'dambulla';

-- ─── 22. Horton Plains & World's End ──────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Horton Plains & World''s End', 'horton-plains',
  'Horton Plains National Park is a misty, elevated plateau located in Sri Lanka''s Central Highlands at over 2,000 meters above sea level. It is part of a UNESCO World Heritage Site and one of the country''s most unique ecosystems. It is famous for the dramatic World''s End viewpoint, which features a sheer drop of 900 meters and breathtaking views on clear mornings. The park is home to rare flora and fauna, including the sambar deer and several endemic birds. Horton Plains is a paradise for hikers, nature lovers, and photographers.',
  'Horton Plains is a misty highland plateau famous for World''s End, a dramatic 900-meter sheer cliff with breathtaking views on clear mornings.',
  'mountain', 'central', false, 22, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['World''s End Cliff','Mini World''s End','Baker''s Falls','Rolling Grasslands','Cloud Forests','Sambar Deer','Kirigalpoththa Mountain','Thotupola Kanda Peak','Marshlands and Wetlands','Rare Endemic Birds'])
FROM locations WHERE slug = 'horton-plains';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Hike to World''s End','Visit Baker''s Falls','Spot sambar deer','Enjoy birdwatching','Take panoramic photos','Explore marshlands','Learn at the visitor center','Watch sunrise from the trail','Hike to Thotupola Kanda','Enjoy a breakfast picnic on the plateau'])
FROM locations WHERE slug = 'horton-plains';

-- ─── 23. Knuckles Mountain Range ──────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Knuckles Mountain Range', 'knuckles-mountain-range',
  'The Knuckles Mountain Range, named after its resemblance to a clenched fist, is a pristine wilderness area in central Sri Lanka. It spans across the Kandy and Matale districts and features rugged peaks, cloud forests, cascading waterfalls, and biodiversity-rich landscapes. The range is a UNESCO World Heritage Site and a paradise for trekking enthusiasts and birdwatchers. With over 35 peaks above 1,000 meters, it offers scenic views and access to traditional villages such as Meemure. Hikes here are adventurous and serene, with encounters ranging from rare orchids to wild boar, lizards, and monkeys.',
  'The Knuckles Mountain Range is a UNESCO World Heritage wilderness in central Sri Lanka with rugged peaks, cloud forests, and over 35 summits above 1,000 meters.',
  'mountain', 'central', false, 23, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Knuckles Peaks and Ridges','Meemure Village','Pitawala Pathana Grasslands','Mini World''s End Viewpoint','Doowili Ella Waterfall','Riverston Gap','Corbett''s Gap Viewpoint','Cloud Forests','Traditional Kandyan Farms','Endemic Plant and Animal Species'])
FROM locations WHERE slug = 'knuckles-mountain-range';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Multi-day trekking expeditions','Camp in the mountains','Explore waterfalls and natural pools','Visit remote villages','Take nature photography','Watch endemic birds and insects','Hike to Mini World''s End','River bathing in mountain streams','Learn about herbal plants from locals','Go off-road jeep trekking'])
FROM locations WHERE slug = 'knuckles-mountain-range';

-- ─── 24. Pidurangala ──────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Pidurangala', 'pidurangala',
  'Pidurangala Rock is located just a few kilometers from Sigiriya and offers one of the best panoramic views of Sri Lanka''s Cultural Triangle. The hike involves scrambling over large boulders toward the top. At sunrise, it is one of the most magical experiences — overlooking the iconic Sigiriya Rock Fortress bathed in golden light. The rock is home to an ancient cave monastery with a massive reclining Buddha statue at its base. Quieter and less crowded than Sigiriya, Pidurangala is a perfect mix of adventure, history, and breathtaking scenery.',
  'Pidurangala Rock offers magical sunrise panoramas of Sigiriya and hosts an ancient cave monastery with a massive reclining Buddha statue at its base.',
  'cultural', 'central', false, 24, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Panoramic Summit View of Sigiriya','Ancient Reclining Buddha Statue','Meditation Caves','Sigiriya and Dambulla Landscape','Sunrise over Jungle Canopy','Pidurangala Rock Summit Plateau','Rock Inscriptions','Ancient Stone Staircases','Wildlife like Monkeys and Birds','Dambulla Hills in the Distance'])
FROM locations WHERE slug = 'pidurangala';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Hike to the summit for sunrise or sunset','Meditate at ancient cave shrines','Explore the temple at the base','Photograph Sigiriya from above','Enjoy birdwatching','Climb early morning for mist views','Explore boulder paths','Combine with a Sigiriya tour','Visit the small temple museum','Have a picnic with a view'])
FROM locations WHERE slug = 'pidurangala';

-- ─── 25. Ella ─────────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Ella', 'ella',
  'Ella is a relaxed mountain town set amidst lush greenery and tea plantations in Sri Lanka''s Uva Province. It is a favorite among backpackers, nature lovers, and hikers, offering a perfect mix of scenic trails, waterfalls, and cool hill-country vibes. Ella is known for iconic sights such as Little Adam''s Peak, the Nine Arches Bridge, and Ella Rock. The town''s cafés, yoga retreats, and homestays make it both a chill-out hub and an adventure base.',
  'Ella is a relaxed mountain town in the Uva Province famous for the Nine Arches Bridge, Little Adam''s Peak, and stunning tea plantation landscapes.',
  'mountain', 'central', false, 25, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Nine Arches Bridge','Little Adam''s Peak','Ella Rock','Ravana Falls','Ravana Cave','Demodara Loop Station','Ella Gap Viewpoint','Tea Plantations','Local Spice Gardens','Buddhist Rock Shrines'])
FROM locations WHERE slug = 'ella';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Hike Ella Rock at sunrise','Walk across Nine Arches Bridge','Climb Little Adam''s Peak','Swim at Ravana Falls','Enjoy train photography','Go ziplining at Flying Ravana','Take a tea factory tour','Join a local cooking class','Relax in hill-view cafés','Join a yoga session'])
FROM locations WHERE slug = 'ella';

-- ─── 26. Nuwara Eliya ─────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Nuwara Eliya', 'nuwara-eliya',
  'Known as "Little England," Nuwara Eliya is a charming highland town with colonial buildings, rose gardens, and cool mountain air. Nestled in Sri Lanka''s tea country, it is surrounded by lush plantations and beautiful waterfalls. Once a favorite retreat for British colonials, today it is a scenic escape for locals and travelers alike. Popular sites include Gregory Lake, Hakgala Botanical Gardens, and numerous tea estates. The April season transforms the city into a festive paradise with flower shows, horse races, and street fairs.',
  'Nuwara Eliya, known as "Little England," is a charming highland town with colonial buildings, lush tea plantations, and the scenic Gregory Lake.',
  'mountain', 'central', false, 26, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Gregory Lake','Hakgala Botanical Garden','Pedro Tea Estate','Lover''s Leap Waterfall','Seetha Amman Temple','Moon Plains Viewpoint','Victoria Park','Galway''s Land Bird Sanctuary','Colonial-Style Buildings','Local Strawberry Farms'])
FROM locations WHERE slug = 'nuwara-eliya';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Boat ride on Gregory Lake','Tour a tea factory and taste Ceylon tea','Walk through botanical gardens','Visit Hindu temples','Hike to Lover''s Leap','Watch horse races (April)','Explore colonial architecture','Ride ponies in Victoria Park','Try local street food','Attend the April Flower Festival'])
FROM locations WHERE slug = 'nuwara-eliya';

-- ─── 27. Haputale ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Haputale', 'haputale',
  'Haputale is a scenic hill town in Sri Lanka''s Uva Province, nestled along the edge of a dramatic mountain ridge. Known for its cooler climate and endless views over the southern plains, it is less touristy than Ella but equally breathtaking. The region is dotted with tea plantations, misty forests, waterfalls, and colonial estates. The town''s highlight is Lipton''s Seat, where Sir Thomas Lipton used to survey his tea empire. Haputale offers serenity, clean air, and authentic village experiences.',
  'Haputale is a scenic hill town less-visited than Ella but equally stunning, famous for Lipton''s Seat and dramatic views over the southern plains.',
  'mountain', 'central', false, 27, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Lipton''s Seat','Dambatenne Tea Factory','St. Andrew''s Church','Adisham Bungalow','Thangamale Bird Sanctuary','Idalgashinna Railway Station','Diyaluma Falls (Nearby)','Tea Estate Valleys','Misty Forest Reserves','Haputale Mountain Ridge Viewpoint'])
FROM locations WHERE slug = 'haputale';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Hike to Lipton''s Seat','Visit a tea factory and taste fresh tea','Explore Adisham Bungalow','Take scenic train rides','Birdwatch in Thangamale Sanctuary','Visit Idalgashinna village','Enjoy photography from cliff viewpoints','Walk through tea pluckers'' paths','Meditate at forest monasteries','Relax at peaceful eco-lodges'])
FROM locations WHERE slug = 'haputale';

-- ─── 28. Colombo ──────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Colombo', 'colombo',
  'Colombo is Sri Lanka''s bustling commercial capital — a dynamic city that blends colonial charm, religious diversity, luxury shopping, and vibrant street food. Once a key port for traders and colonizers, today it features a mix of modern skyscrapers, heritage buildings, and a growing arts scene. Tourists enjoy visiting temples, Dutch forts, bazaars, museums, and beaches all within a short drive. It is a great introduction to Sri Lanka''s urban life and cultural diversity.',
  'Colombo is Sri Lanka''s dynamic capital city blending colonial charm, modern skyscrapers, religious diversity, luxury shopping, and vibrant street food.',
  'city', 'west', false, 28, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Gangaramaya Temple','Galle Face Green','Lotus Tower','Colombo National Museum','Independence Square','Old Dutch Hospital Precinct','Colombo Port City','Red Mosque (Jami Ul-Alfar)','Viharamahadevi Park','Pettah Market'])
FROM locations WHERE slug = 'colombo';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Visit museums and art galleries','Explore temples and churches','Watch sunset at Galle Face','Dine at rooftop restaurants','Take a tuk-tuk city tour','Shop at Arcade Independence Square','Explore colonial Fort district','Try street food (kottu, hoppers)','Walk or cycle around Independence Square','Attend cultural performances'])
FROM locations WHERE slug = 'colombo';

-- ─── 29. Galle ────────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Galle', 'galle',
  'Galle is a historic coastal city on the southern tip of Sri Lanka, famous for its beautifully preserved 17th-century Dutch Fort — a UNESCO World Heritage Site. With cobbled streets, colonial villas, art galleries, and boutique cafés, Galle is a favorite among both history lovers and beachgoers. The nearby beaches of Unawatuna, Jungle Beach, and Koggala offer great swimming, diving, and relaxation. It is a wonderful mix of culture, coast, and cuisine.',
  'Galle is famous for its beautifully preserved 17th-century Dutch Fort, a UNESCO World Heritage Site with cobbled streets, colonial villas, and boutique cafés.',
  'cultural', 'south', false, 29, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Galle Fort','Galle Lighthouse','Dutch Reformed Church','Maritime Museum','Historical Mansion Museum','Unawatuna Beach','Jungle Beach','Japanese Peace Pagoda','Koggala Lake','Yatagala Temple'])
FROM locations WHERE slug = 'galle';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Walk around Galle Fort ramparts','Explore colonial architecture and boutiques','Swim and relax at Unawatuna','Snorkel at Jungle Beach','Take a boat ride on Koggala Lake','Visit tea plantations near Handunugoda','Try seafood by the beach','Join a Sri Lankan cooking class','Watch cricket at Galle stadium','Go whale watching from nearby Mirissa'])
FROM locations WHERE slug = 'galle';

-- ─── 30. Unawatuna ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Unawatuna', 'unawatuna',
  'Unawatuna is a popular beach village near Galle, known for its calm, swimmable bay, coral reefs, and laid-back vibe. It is perfect for families, snorkelers, and honeymooners. The town is also close to jungle-covered hills with Buddhist temples and secluded beaches. With a mix of water sports, boutique stays, and charming cafés, Unawatuna is ideal for a relaxing coastal escape with a splash of local flavor.',
  'Unawatuna is a popular beach village near Galle with a calm bay, coral reefs, and a laid-back atmosphere perfect for families and snorkelers.',
  'beach', 'south', false, 30, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Unawatuna Bay','Jungle Beach','Japanese Peace Pagoda','Coral Reefs and Turtles','Galle Fort (10 mins away)','Yatagala Temple','Rumassala Sanctuary','Twin Islands (Snorkeling Spot)','Local Fish Markets','Handicraft Shops'])
FROM locations WHERE slug = 'unawatuna';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Swim in calm waters','Snorkel with turtles','Boat ride to coral reefs','Kayak around Twin Islands','Visit Peace Pagoda at sunset','Take a yoga class','Shop for handmade souvenirs','Relax in beachfront cafés','Try seafood and hoppers','Join a guided forest walk in Rumassala'])
FROM locations WHERE slug = 'unawatuna';

-- ─── 31. Tangalle ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Tangalle', 'tangalle',
  'Tangalle is a tranquil coastal escape on the southern shores of Sri Lanka, known for long stretches of uncrowded beaches, turquoise waters, and laid-back vibes. Unlike busier beach towns, Tangalle offers peace and serenity with a touch of local culture. From fishing villages and palm-lined bays to luxury eco-resorts and turtle conservation projects, the area offers a blend of nature and sustainability. It is also a great launchpad for exploring Mulkirigala Rock Temple and Rekawa Turtle Beach.',
  'Tangalle is a tranquil southern coastal town known for uncrowded beaches, turtle conservation at Rekawa, and the nearby Mulkirigala Rock Temple.',
  'beach', 'south', false, 31, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Tangalle Beach','Rekawa Turtle Conservation Project','Mulkirigala Rock Temple','Goyambokka Bay','Hummanaya Blowhole','Medaketiya Beach','Kalametiya Bird Sanctuary','Tangalle Lagoon','Kudawella Fishing Village','Tangalle Lighthouse'])
FROM locations WHERE slug = 'tangalle';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Swim and relax on quiet beaches','Visit Rekawa Turtle Hatchery at night','Explore Mulkirigala temple caves','Kayak on the Tangalle Lagoon','Hike to the blowhole at Kudawella','Birdwatch in Kalametiya','Try local seafood curries','Sunset picnics on the beach','Practice yoga at beachfront resorts','Watch fishermen haul in morning catch'])
FROM locations WHERE slug = 'tangalle';

-- ─── 32. Bentota ──────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Bentota', 'bentota',
  'Bentota is a favorite among honeymooners and water sports enthusiasts. Located just a few hours south of Colombo, it features a pristine beach, a calm river lagoon, and plenty of luxury resorts. This destination blends sun, sand, and heritage — with historic temples, brief river safaris, and peaceful gardens. Bentota''s backwaters, mangroves, and safe swimming spots make it perfect for families and romantic getaways alike.',
  'Bentota is a favorite honeymoon and water sports destination with a pristine beach, calm river lagoon, and lush heritage gardens south of Colombo.',
  'beach', 'west', false, 32, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Bentota Beach','Bentota River','Brief Garden (Bawa''s Garden)','Kande Viharaya Temple','Cinnamon Island','Kosgoda Turtle Hatchery','Galapatha Temple','Lunuganga Estate (Geoffrey Bawa)','Mangrove Estuaries','Lighthouse Gallery Art Shops'])
FROM locations WHERE slug = 'bentota';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Jet ski or banana boat rides','River safari through mangroves','Visit turtle hatcheries','Relax at a spa resort','Take a cycling tour through the village','Watch sunset at Bentota Beach','Visit art galleries and gardens','Go fishing with locals','Enjoy traditional Sri Lankan dance shows','Try herbal body treatments'])
FROM locations WHERE slug = 'bentota';

-- ─── 33. Kalpitiya ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Kalpitiya', 'kalpitiya',
  'Kalpitiya is Sri Lanka''s adventure and marine hotspot located on the northwest coast. It is a haven for kitesurfers, dolphin watchers, and eco-travelers. The region has a unique ecosystem with lagoons, mangroves, and coral reefs. With consistent winds, calm seas, and abundant marine life, Kalpitiya offers unforgettable outdoor experiences while retaining a rustic, undeveloped charm.',
  'Kalpitiya is Sri Lanka''s adventure and marine hotspot on the northwest coast, famous for kitesurfing, dolphin watching, and pristine lagoon ecosystems.',
  'beach', 'west', false, 33, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Kalpitiya Lagoon','Dutch Fort Ruins','Dolphin Pods','Wilpattu''s Coastal Edge','St. Anne''s Church, Talawila','Puttalam Salt Pans','Mangrove Forests','Bar Reef Marine Sanctuary','Fishing Boats and Harbors','Coral Reefs'])
FROM locations WHERE slug = 'kalpitiya';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Go kitesurfing (seasonal)','Take a dolphin or whale-watching cruise','Explore the Dutch Fort','Snorkel or dive at Bar Reef','Kayak in mangroves','Camp on the beach under the stars','Visit Talawila Church','Explore local fish markets','Join a lagoon sailing tour','Birdwatching in mangrove forests'])
FROM locations WHERE slug = 'kalpitiya';

-- ─── 34. Trincomalee ──────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Trincomalee', 'trincomalee',
  'Trincomalee, or "Trinco," sits on the east coast and is renowned for its deep natural harbor and stunning white-sand beaches. It is a spiritual and scenic destination, home to the iconic Koneswaram Temple perched atop a cliff. Trinco offers a mix of snorkeling, whale watching, culture, and historical exploration. Nilaveli and Uppuveli beaches offer crystal-clear water, ideal for peaceful escapes and underwater adventures.',
  'Trincomalee is renowned for its deep natural harbor, the clifftop Koneswaram Temple, and stunning white-sand beaches on Sri Lanka''s east coast.',
  'beach', 'east', false, 34, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Koneswaram Temple','Fort Frederick','Nilaveli Beach','Uppuveli Beach','Hot Springs of Kanniya','Swami Rock','Maritime & Naval History Museum','Lovers Leap Viewpoint','Pigeon Island National Park','Dutch Bay'])
FROM locations WHERE slug = 'trincomalee';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Visit Koneswaram Temple for views and culture','Snorkel at Pigeon Island','Relax at Nilaveli Beach','Take a boat trip to coral reefs','Swim in hot springs','Visit local Hindu temples','Try Tamil cuisine','Go whale watching (May–October)','Explore Fort Frederick on foot','Watch fishermen bring in their catch'])
FROM locations WHERE slug = 'trincomalee';

-- ─── 35. Uppuveli ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Uppuveli', 'uppuveli',
  'Uppuveli is a relaxed beach area near Trincomalee with a youthful, backpacker-friendly atmosphere. The area has grown as a beach escape with budget stays, scuba diving schools, and yoga centers. The beach is wide, quiet, and perfect for swimming or lounging under coconut trees. It is also a good base for whale watching, snorkeling, and exploring Tamil culture.',
  'Uppuveli is a relaxed backpacker-friendly beach near Trincomalee with scuba diving schools, yoga centers, and easy access to Pigeon Island.',
  'beach', 'east', false, 35, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Uppuveli Beach','Pigeon Island (Accessible by Boat)','Kanniya Hot Springs','Salli Muthumariamman Temple','Diving Sites','Trincomalee Cityscape','Beachside Cafés','Hindu Shrines','Coral Reefs','Turtle Nesting Areas'])
FROM locations WHERE slug = 'uppuveli';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Swim and sunbathe','Try scuba diving or get certified','Join yoga and wellness retreats','Rent a scooter and explore','Take boat trips to Pigeon Island','Dine in beachfront restaurants','Try Sri Lankan seafood BBQ','Play beach volleyball','Watch fishermen haul in nets','Explore nearby Trincomalee city'])
FROM locations WHERE slug = 'uppuveli';

-- ─── 36. Pasikuda ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Pasikuda', 'pasikuda',
  'Pasikuda, on Sri Lanka''s east coast, is known for its shallow, calm, and crystal-clear waters. Its expansive bay, protected by a natural coral reef, allows visitors to walk far out into the ocean — making it perfect for families and swimmers. The town has transformed into a luxury beach destination with high-end resorts, yet it maintains its quiet charm. The nearby town of Batticaloa adds cultural depth with its colonial buildings and local Tamil culture.',
  'Pasikuda is famous for its shallow, crystal-clear bay where visitors can walk far into the ocean, making it ideal for families and luxury beach stays.',
  'beach', 'east', false, 36, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Pasikuda Bay','Coral Reef','Coconut Groves','Sunrise on the Beach','Batticaloa Lighthouse (Nearby)','Dutch Fort, Batticaloa','Traditional Fishing Boats','St. Anthony''s Church','Shallow Reef Fish','Mangrove Areas'])
FROM locations WHERE slug = 'pasikuda';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Swim in the shallow sea','Snorkel along coral reefs','Relax in luxury beach resorts','Take a catamaran ride','Enjoy seafood by the beach','Jet ski or kayak','Try yoga on the beach','Explore nearby Batticaloa','Take boat rides around the bay','Visit local fishing villages'])
FROM locations WHERE slug = 'pasikuda';

-- ─── 37. Kataragama ───────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Kataragama', 'kataragama',
  'Kataragama is one of Sri Lanka''s most sacred pilgrimage towns, visited by Buddhists, Hindus, Muslims, and Veddas. It is famous for the Kataragama Devalaya, a temple complex dedicated to Lord Skanda (Murugan), attracting thousands of devotees during daily rituals and annual processions. The sacred Menik Ganga (River of Gems) is used for ritual bathing. During the Esala Festival, devotees engage in fire walking and intense religious observances. The town is also a gateway to Yala National Park.',
  'Kataragama is one of Sri Lanka''s most sacred pilgrimage towns, home to the Kataragama Devalaya temple and the sacred Menik Ganga river.',
  'cultural', 'south', false, 37, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Kataragama Devalaya','Kirivehera Buddhist Stupa','Menik Ganga (River of Gems)','Sella Kataragama Temple','Maha Devalaya Festival Hall','Wall Art and Offerings Stalls','Peacock Shrines','Yala Entrance Gate','Sacred Bo Tree','Religious Processions'])
FROM locations WHERE slug = 'kataragama';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Observe temple rituals','Participate in pujas (offerings)','Bathe in Menik Ganga','Attend the Esala Festival','Visit Sella Kataragama Hindu shrine','Visit Kirivehera Buddhist temple','Meditate by the river','Explore nearby forest shrines','Watch fire-walking ceremonies','Day trip to Yala National Park'])
FROM locations WHERE slug = 'kataragama';

-- ─── 38. Adam's Peak (Sri Pada) ───────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Adam''s Peak (Sri Pada)', 'adams-peak',
  'Adam''s Peak (Sri Pada) is one of Sri Lanka''s most sacred and iconic pilgrimage sites. Standing at 2,243 meters, this mountain is revered by Buddhists, Hindus, Muslims, and Christians. At the summit lies a sacred footprint believed to be that of the Buddha, Shiva, Adam, or St. Thomas, depending on the religion. Pilgrims climb the peak — often overnight — to witness a stunning sunrise above the clouds and see the triangular "Shadow of the Peak." The path is lit by thousands of lanterns during pilgrimage season.',
  'Adam''s Peak is a sacred mountain revered by four religions, famous for its summit footprint and the breathtaking triangular Shadow of the Peak at sunrise.',
  'mountain', 'central', false, 38, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Sacred Footprint at Summit','Sunrise View above Clouds','Shadow of the Peak Phenomenon','Forest Shrines along the Trail','Buddhist Statues and Stupas','Pilgrimage Lanterns','Galpoththawala Rock Temple','Saman Devalaya Shrine','Scenic Mountain Ranges','Wildlife in Surrounding Reserve'])
FROM locations WHERE slug = 'adams-peak';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Climb the mountain overnight','Witness sunrise at the summit','Visit shrines along the trail','Observe pilgrimage traditions','Meditate at summit temple','Watch the shadow triangle phenomenon','Light incense or offer flowers','Enjoy tea stalls on the trail','Camp in nearby forest zones','Take photos of night-lit stairs'])
FROM locations WHERE slug = 'adams-peak';

-- ─── 39. Ritigala ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Ritigala', 'ritigala',
  'Ritigala is an ancient monastic site nestled in a forested mountain range near Habarana. Unlike many other temples, Ritigala is quiet, mysterious, and shrouded in dense jungle. It was once home to strict forest-dwelling Buddhist monks and is now a captivating archaeological reserve. Massive stone pathways, meditation platforms, and bathing pools blend with nature. It is steeped in legend — some say Hanuman dropped a piece of the Himalayan range here during the Ramayana.',
  'Ritigala is a mysterious ancient forest monastery near Habarana with stone pathways, meditation platforms, and rare medicinal plants hidden in dense jungle.',
  'cultural', 'central', false, 39, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Ancient Stone Bridges and Stairs','Meditation Platforms','Giant Bathing Ponds','Forest Ruins and Inscriptions','Overgrown Stone Walkways','Rare Medicinal Plants','Wildlife in the Reserve','Rock Caves Used by Monks','Moss-Covered Ruins','Dense Jungle Canopy'])
FROM locations WHERE slug = 'ritigala';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Explore the silent forest ruins','Photograph mossy temples','Learn history of forest monks','Meditate in ancient cave shelters','Identify rare forest herbs','Join a guided archaeological walk','Observe butterflies and insects','Visit nearby Habarana village','Watch monkeys in treetops','Enjoy nature without crowds'])
FROM locations WHERE slug = 'ritigala';

-- ─── 40. Buduruwagala ─────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Buduruwagala', 'buduruwagala',
  'Buduruwagala is home to a fascinating set of ancient rock carvings in a forested area near Wellawaya in southern Sri Lanka. The name means "the rock of Buddha''s statues," and the site features seven massive carvings etched into a vertical rock face, the tallest of which is over 50 feet. These statues date back to the 9th or 10th century and are linked to Mahayana Buddhist traditions. Buduruwagala is serene, uncrowded, and enveloped by jungle, making it a spiritual and off-the-beaten-path destination.',
  'Buduruwagala features seven ancient rock carvings near Wellawaya, including a 50-foot Buddha statue dating to the 9th century, set in serene jungle surroundings.',
  'cultural', 'south', false, 40, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['51-ft Buddha Carving','Six Accompanying Bodhisattva Figures','Ancient Inscriptions on Rocks','Mahayana-Style Robe Details','Natural Rock Lake','Birdlife in Surrounding Jungle','Ancient Meditation Caves (Nearby)','Lush Forest Surroundings','Wild Elephants in Reserve','Scenic Road through Wellawaya'])
FROM locations WHERE slug = 'buduruwagala';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Explore the ancient statues','Take guided history tours','Meditate near the rock face','Spot forest birds and butterflies','Visit nearby hermit caves','Photograph intricate carvings','Walk along the jungle path','Have a picnic by the reservoir','Combine with Ravana Falls or Ella trip','Visit nearby rock shrines'])
FROM locations WHERE slug = 'buduruwagala';

-- ─── 41. Kanneliya ────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Kanneliya', 'kanneliya',
  'Kanneliya Rainforest Reserve, in the Southern Province, is a lesser-known but richly biodiverse tropical rainforest. It is part of Sri Lanka''s remaining lowland wet-zone forest system and is home to a large number of endemic species. The reserve features waterfalls, rivers, canopy layers, and a peaceful eco-atmosphere. Guided treks take visitors deep into forest paths to learn about medicinal plants, wildlife, and conservation efforts.',
  'Kanneliya Rainforest Reserve is a lesser-known but biodiverse tropical rainforest in the Southern Province, rich in endemic species and peaceful eco-trails.',
  'wildlife', 'south', false, 41, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Dense Tropical Vegetation','Anagimale Falls','Neluwa River','Endemic Reptiles and Amphibians','Rare Orchids','Giant Snails and Spiders','Canopy of Fig and Palm Trees','Tree Frogs and Chameleons','Local Herbal Gardens','Traditional Water-Powered Mills'])
FROM locations WHERE slug = 'kanneliya';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Take a guided nature walk','Visit Anagimale Falls','Learn about medicinal plants','Observe birds and insects','Photograph flora and fauna','Cross hanging bridges','Swim in freshwater pools','Join eco-education programs','Interact with forest guides','Have a jungle picnic'])
FROM locations WHERE slug = 'kanneliya';

-- ─── 42. Belihuloya ───────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Belihuloya', 'belihuloya',
  'Belihuloya is a picturesque village nestled between Sri Lanka''s hill country and dry zone. It is known for its biodiversity, waterfalls, rivers, and eco-lodges. Located at 615 meters above sea level, it has a pleasant climate and offers stunning nature experiences like forest walks, canyoning, and mountain biking. The area is also rich in birdlife and ancient irrigation systems. It is ideal for travelers seeking soft adventure, wellness, and nature-based exploration.',
  'Belihuloya is a picturesque eco-village nestled between hill country and dry zone, known for its waterfalls, rivers, and outdoor adventure experiences.',
  'mountain', 'central', false, 42, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Pahanthudawa Falls','Samanalawewa Reservoir','Belihuloya River','Kinchigune Eco Village','Papulagala Rock','Duvili Ella Falls','Hiking Trails through Paddy Fields','Misty Mountain Views','Rural Farming Communities','Sri Lanka Blue Magpie Sightings'])
FROM locations WHERE slug = 'belihuloya';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Hike to Pahanthudawa waterfall','Go kayaking in the reservoir','Try river bathing and canyoning','Cycle through tea and paddy fields','Camp near the river','Visit the eco-village of Kinchigune','Meditate or practice yoga','Fish with local villagers','Photograph wildlife','Enjoy organic meals at eco-lodges'])
FROM locations WHERE slug = 'belihuloya';

-- ─── 43. Mannar Island ────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Mannar Island', 'mannar-island',
  'Mannar Island, in the northwest, is connected to the mainland by a causeway and is known for its desert-like terrain, windmills, birdlife, and historic ruins. It is less developed for tourism but fascinating for travelers seeking history and wildlife. The region is rich in Tamil and Christian heritage, with landmarks such as the ancient Thiruketheeswaram Temple and St. Mary''s Church. Wild donkeys and baobab trees add to the island''s unique charm.',
  'Mannar Island is a remote northwest destination known for its desert terrain, 700-year-old baobab tree, wild donkeys, and Tamil and Christian heritage.',
  'cultural', 'north', false, 43, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Mannar Fort (Dutch Ruins)','Baobab Tree (Over 700 Years Old)','Adam''s Bridge Sandbanks','Thiruketheeswaram Hindu Temple','Vankalai Bird Sanctuary','Mannar Causeway Views','Wind Farms','St. Mary''s Church','Local Fishing Harbor','Wild Donkeys'])
FROM locations WHERE slug = 'mannar-island';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Explore Mannar Fort ruins','Birdwatching at Vankalai Sanctuary','Visit Hindu and Christian shrines','Photograph baobab trees','Observe fishing at Mannar Harbour','Ride bikes across the island','Spot dolphins near Adam''s Bridge','Watch flamingos and pelicans','Try Tamil coastal cuisine','Explore local markets'])
FROM locations WHERE slug = 'mannar-island';

-- ─── 44. Batticaloa ───────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Batticaloa', 'batticaloa',
  'Batticaloa is an eastern coastal city known for its lagoons, colonial heritage, and Tamil culture. It is a great destination for offbeat travelers seeking beaches, nature, and authentic local life. The city is famous for the "singing fish" phenomenon in its lagoon, best heard during full moon nights. With nearby beaches like Kallady and attractions such as the Dutch Fort, Batticaloa offers cultural depth and coastal beauty.',
  'Batticaloa is an eastern city known for its lagoons, colonial Dutch Fort, Tamil culture, and the famous "singing fish" heard in the lagoon on full moon nights.',
  'city', 'east', false, 44, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Batticaloa Lagoon','Dutch Fort','Kallady Bridge','Gandhi Park','St. Mary''s Cathedral','Local Markets','Pasikudah Beach (Nearby)','Eastern University','Mangrove Ecosystems','Singing Fish (Full Moon Nights)'])
FROM locations WHERE slug = 'batticaloa';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Take a lagoon boat ride','Explore the Dutch Fort','Cycle along the lagoon banks','Visit traditional fishing villages','Try spicy Tamil cuisine','Watch sunrise at Kallady Beach','Birdwatching in mangroves','Photograph colonial ruins','Learn about local folklore','Attend cultural music events'])
FROM locations WHERE slug = 'batticaloa';

-- ─── 45. Mount Lavinia ────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Mount Lavinia', 'mount-lavinia',
  'Mount Lavinia, just south of Colombo, blends urban convenience with beachside relaxation. Known for its colonial heritage and iconic Mount Lavinia Hotel, this coastal suburb offers golden beaches, romantic sunsets, and historical charm. It is popular for day-trippers, couples, and those seeking proximity to the city with the ambiance of a beach resort. The beach is lined with seafood restaurants, bars, and beachfront events.',
  'Mount Lavinia blends urban convenience with beachside charm near Colombo, famous for the historic Mount Lavinia Hotel and romantic sunset views.',
  'beach', 'west', false, 45, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Mount Lavinia Beach','Mount Lavinia Hotel (Historic Colonial Mansion)','St. Thomas'' College','Holy Emmanuel Church','Dehiwala Railway Station (Vintage Architecture)','Beachside Street Art and Murals','Colombo Skyline at Sunset','Fishing Boats along the Coast','Turtle Sightings Offshore','Street Food Markets'])
FROM locations WHERE slug = 'mount-lavinia';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Relax on the beach and swim','Enjoy sunset cocktails at beach bars','Explore the historic Mount Lavinia Hotel','Visit local churches and colonial buildings','Dine on seafood at beachfront restaurants','Take a beach train ride to Colombo','Attend beachside concerts or weddings','Try street food (isso wade, hoppers)','Watch or join beach volleyball games','Photograph Colombo skyline at dusk'])
FROM locations WHERE slug = 'mount-lavinia';

-- ─── 46. Meemure ──────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Meemure', 'meemure',
  'Meemure is a remote village hidden deep within the Knuckles Mountain Range, known for its traditional lifestyle, dramatic mountain scenery, and pristine nature. Accessed via rugged trails or jeep rides, Meemure offers authentic rural hospitality and ecotourism adventures. With no mobile signal and minimal modern influence, it is perfect for off-grid travelers, hikers, and nature photographers. Local villagers offer camping, village walks, and traditional meals.',
  'Meemure is a remote off-grid village deep in the Knuckles Range with no mobile signal, offering authentic rural hospitality and dramatic mountain scenery.',
  'mountain', 'central', false, 46, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Knuckles Peaks','Lakegala Mountain','Bamboo Groves and Tea Fields','Traditional Village Huts','Rice Paddy Terraces','Dumbara Valley','Local Shrines and Statues','Forest Waterfalls','Riverstone Cliff Views','Medicinal Plants and Wild Herbs'])
FROM locations WHERE slug = 'meemure';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Hike to Lakegala or Knuckles trails','Camp in local eco-sites','Enjoy village-cooked meals','Bathe in rivers and waterfalls','Take a forest herb tour','Watch cultural drum and dance shows','Visit local weaving and woodcraft homes','Birdwatch in quiet forest zones','Meditate in nature','Stargaze with zero light pollution'])
FROM locations WHERE slug = 'meemure';

-- ─── 47. Kalutara ─────────────────────────────────────────────────────────────
INSERT INTO locations (name, slug, description, short_description, category, region, featured, display_order, additional_details)
VALUES (
  'Kalutara', 'kalutara',
  'Kalutara is a historic coastal town just south of Colombo, best known for the towering Kalutara Bodhiya (dagoba) and scenic lagoon. It offers a blend of beach life, heritage, and religious landmarks. The town''s riverside charm, Buddhist and colonial influences, and laid-back feel make it a great cultural detour on a beach circuit. It is also a convenient stop for those heading toward Bentota or Galle.',
  'Kalutara is a historic coastal town south of Colombo, known for the towering Kalutara Bodhiya, scenic Kalu Ganga lagoon, and Buddhist temple complex.',
  'beach', 'west', false, 47, '{}'
) ON CONFLICT (slug) DO NOTHING;
INSERT INTO location_highlights (location_id, highlight)
SELECT id, unnest(ARRAY['Kalutara Bodhiya (Huge White Dagoba)','Richmond Castle (Colonial Mansion)','Kalutara Beach','Kalu Ganga River and Lagoon','Catholic Shrine of St. Sebastian','Kalutara Bridge','Thudugala Ella Waterfall (Nearby)','Local Spice and Fruit Markets','Buddhist Temples Inland','Handloom and Basket Workshops'])
FROM locations WHERE slug = 'kalutara';
INSERT INTO location_activities (location_id, activity)
SELECT id, unnest(ARRAY['Visit the Kalutara Temple complex','Take a boat ride on the lagoon','Tour Richmond Castle and gardens','Relax on uncrowded beaches','Sample seasonal fruits (mangoes, rambutans)','Visit handloom centers for souvenirs','Explore spice gardens nearby','Join a temple puja or blessing','Photography at the Kalutara Bridge','Day trip toward Bentota or Galle'])
FROM locations WHERE slug = 'kalutara';
