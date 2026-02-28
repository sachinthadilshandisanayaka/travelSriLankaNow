package com.travesrilankanow.travesrilankanowbe.config;

import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection;
import com.travesrilankanow.travesrilankanowbe.entity.HomepageSection.SectionType;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting;
import com.travesrilankanow.travesrilankanowbe.entity.SiteSetting.SettingCategory;
import com.travesrilankanow.travesrilankanowbe.entity.User;
import com.travesrilankanow.travesrilankanowbe.repository.HomepageSectionRepository;
import com.travesrilankanow.travesrilankanowbe.repository.MasterDataRepository;
import com.travesrilankanow.travesrilankanowbe.repository.SiteSettingRepository;
import com.travesrilankanow.travesrilankanowbe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final MasterDataRepository masterDataRepository;
    private final SiteSettingRepository siteSettingRepository;
    private final HomepageSectionRepository homepageSectionRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.default.username}")
    private String adminUsername;

    @Value("${admin.default.password}")
    private String adminPassword;

    @Value("${admin.default.email:admin@travelsrilankanow.com}")
    private String adminEmail;

    @Override
    public void run(String... args) {
        initializeAdminUser();
        initializeMasterData();
        initializeSiteSettings();
        initializeHomepageSections();
    }

    private void initializeAdminUser() {
        if (!userRepository.existsByUsername(adminUsername)) {
            User adminUser = User.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName(adminUsername)
                    .role(User.Role.ADMIN)
                    .build();

            userRepository.save(adminUser);
            log.info("Admin user created - Username: {}", adminUsername);
        }
    }

    private void initializeMasterData() {
        // Event Categories
        createMasterDataIfNotExists(MasterDataType.EVENT_CATEGORY, "cultural", "Cultural", 1, "#8B5CF6");
        createMasterDataIfNotExists(MasterDataType.EVENT_CATEGORY, "adventure", "Adventure", 2, "#F59E0B");
        createMasterDataIfNotExists(MasterDataType.EVENT_CATEGORY, "food", "Food", 3, "#EF4444");
        createMasterDataIfNotExists(MasterDataType.EVENT_CATEGORY, "festival", "Festival", 4, "#EC4899");
        createMasterDataIfNotExists(MasterDataType.EVENT_CATEGORY, "tour", "Tour", 5, "#3B82F6");

        // Location Categories
        createMasterDataIfNotExists(MasterDataType.LOCATION_CATEGORY, "beach", "Beach", 1, "#06B6D4");
        createMasterDataIfNotExists(MasterDataType.LOCATION_CATEGORY, "mountain", "Mountain", 2, "#10B981");
        createMasterDataIfNotExists(MasterDataType.LOCATION_CATEGORY, "cultural", "Cultural", 3, "#8B5CF6");
        createMasterDataIfNotExists(MasterDataType.LOCATION_CATEGORY, "wildlife", "Wildlife", 4, "#F59E0B");
        createMasterDataIfNotExists(MasterDataType.LOCATION_CATEGORY, "city", "City", 5, "#6366F1");

        // Regions
        createMasterDataIfNotExists(MasterDataType.REGION, "north", "North", 1, "#3B82F6");
        createMasterDataIfNotExists(MasterDataType.REGION, "south", "South", 2, "#10B981");
        createMasterDataIfNotExists(MasterDataType.REGION, "east", "East", 3, "#F59E0B");
        createMasterDataIfNotExists(MasterDataType.REGION, "west", "West", 4, "#EF4444");
        createMasterDataIfNotExists(MasterDataType.REGION, "central", "Central", 5, "#8B5CF6");

        // Place Types
        createMasterDataIfNotExists(MasterDataType.PLACE_TYPE, "hotel", "Hotel", 1, "#3B82F6");
        createMasterDataIfNotExists(MasterDataType.PLACE_TYPE, "restaurant", "Restaurant", 2, "#F59E0B");
        createMasterDataIfNotExists(MasterDataType.PLACE_TYPE, "cafe", "Cafe", 3, "#06B6D4");
        createMasterDataIfNotExists(MasterDataType.PLACE_TYPE, "guesthouse", "Guesthouse", 4, "#14B8A6");
        createMasterDataIfNotExists(MasterDataType.PLACE_TYPE, "resort", "Resort", 5, "#8B5CF6");

        // Price Ranges
        createMasterDataIfNotExists(MasterDataType.PRICE_RANGE, "$", "Budget ($)", 1, "#10B981");
        createMasterDataIfNotExists(MasterDataType.PRICE_RANGE, "$$", "Moderate ($$)", 2, "#3B82F6");
        createMasterDataIfNotExists(MasterDataType.PRICE_RANGE, "$$$", "Expensive ($$$)", 3, "#F59E0B");
        createMasterDataIfNotExists(MasterDataType.PRICE_RANGE, "$$$$", "Luxury ($$$$)", 4, "#EF4444");

        // Gallery Categories
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "beach", "Beach", 1, "#06B6D4");
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "mountain", "Mountain", 2, "#10B981");
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "cultural", "Cultural", 3, "#8B5CF6");
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "wildlife", "Wildlife", 4, "#F59E0B");
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "food", "Food", 5, "#EF4444");
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "people", "People", 6, "#EC4899");
        createMasterDataIfNotExists(MasterDataType.GALLERY_CATEGORY, "architecture", "Architecture", 7, "#6366F1");

        // Gallery Types
        createMasterDataIfNotExists(MasterDataType.GALLERY_TYPE, "image", "Image", 1, "#3B82F6");
        createMasterDataIfNotExists(MasterDataType.GALLERY_TYPE, "video", "Video", 2, "#EF4444");

        log.info("Master data initialization completed");
    }

    private void createMasterDataIfNotExists(MasterDataType type, String code, String displayName, int sortOrder, String color) {
        if (!masterDataRepository.existsByTypeAndCode(type, code)) {
            MasterData masterData = MasterData.builder()
                    .type(type)
                    .code(code)
                    .displayName(displayName)
                    .sortOrder(sortOrder)
                    .color(color)
                    .isActive(true)
                    .build();
            masterDataRepository.save(masterData);
        }
    }

    private void initializeSiteSettings() {
        // Contact Email
        createSiteSettingIfNotExists(SettingCategory.CONTACT_EMAIL, "contact_email", "Email", "info@travelsrilankanow.com", "email", 1);

        // Contact Phone
        createSiteSettingIfNotExists(SettingCategory.CONTACT_PHONE, "contact_phone", "Phone", "+94 11 234 5678", "phone", 1);

        // Contact Address
        createSiteSettingIfNotExists(SettingCategory.CONTACT_ADDRESS, "contact_address", "Address", "Colombo, Sri Lanka", "location", 1);

        // Social Media Links
        createSiteSettingIfNotExists(SettingCategory.SOCIAL_MEDIA, "social_facebook", "Facebook", "https://facebook.com/travelsrilankanow", "facebook", 1);
        createSiteSettingIfNotExists(SettingCategory.SOCIAL_MEDIA, "social_instagram", "Instagram", "https://instagram.com/travelsrilankanow", "instagram", 2);
        createSiteSettingIfNotExists(SettingCategory.SOCIAL_MEDIA, "social_twitter", "Twitter", "https://twitter.com/travelsrilankanow", "twitter", 3);
        createSiteSettingIfNotExists(SettingCategory.SOCIAL_MEDIA, "social_youtube", "YouTube", "https://youtube.com/travelsrilankanow", "youtube", 4);

        // Business Hours
        createSiteSettingIfNotExists(SettingCategory.BUSINESS_HOURS, "hours_weekday", "Weekdays", "Mon - Fri: 9:00 AM - 6:00 PM", "clock", 1);
        createSiteSettingIfNotExists(SettingCategory.BUSINESS_HOURS, "hours_weekend", "Weekends", "Sat - Sun: 10:00 AM - 4:00 PM", "clock", 2);

        // General Settings
        createSiteSettingIfNotExists(SettingCategory.GENERAL, "site_name", "Site Name", "Travel Sri Lanka Now", null, 1);
        createSiteSettingIfNotExists(SettingCategory.GENERAL, "site_tagline", "Tagline", "Discover the Pearl of the Indian Ocean", null, 2);

        log.info("Site settings initialization completed");
    }

    private void initializeHomepageSections() {
        createHomepageSectionIfNotExists(SectionType.HERO_SLIDER, "Hero Slider", "Stunning visuals of Sri Lanka", 1, "{\"autoPlay\":true,\"displayDuration\":5000}");
        createHomepageSectionIfNotExists(SectionType.FEATURED_LOCATIONS, "Featured Locations", "Discover amazing destinations across Sri Lanka", 2, "{\"itemsCount\":6,\"showViewAll\":true}");
        createHomepageSectionIfNotExists(SectionType.UPCOMING_EVENTS, "Upcoming Events", "Don't miss these exciting events", 3, "{\"itemsCount\":6,\"showViewAll\":true}");
        createHomepageSectionIfNotExists(SectionType.PLACES, "Where to Stay", "Find the perfect place for your journey", 4, "{\"itemsCount\":6,\"showViewAll\":true}");
        createHomepageSectionIfNotExists(SectionType.SOCIAL_MEDIA, "Follow Us", "Stay connected on social media", 5, "{\"itemsCount\":8,\"showViewAll\":false}");

        log.info("Homepage sections initialization completed");
    }

    private void createHomepageSectionIfNotExists(SectionType sectionType, String title, String subtitle, int displayOrder, String config) {
        if (!homepageSectionRepository.existsBySectionType(sectionType)) {
            HomepageSection section = HomepageSection.builder()
                    .sectionType(sectionType)
                    .title(title)
                    .subtitle(subtitle)
                    .displayOrder(displayOrder)
                    .isActive(true)
                    .config(config)
                    .build();
            homepageSectionRepository.save(section);
        }
    }

    private void createSiteSettingIfNotExists(SettingCategory category, String key, String label, String value, String icon, int sortOrder) {
        if (!siteSettingRepository.existsByKey(key)) {
            SiteSetting setting = SiteSetting.builder()
                    .category(category)
                    .key(key)
                    .label(label)
                    .value(value)
                    .icon(icon)
                    .sortOrder(sortOrder)
                    .isActive(true)
                    .build();
            siteSettingRepository.save(setting);
        }
    }
}
