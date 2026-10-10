package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.MoreSection;
import com.travesrilankanow.travesrilankanowbe.entity.MoreSectionItem;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import com.travesrilankanow.travesrilankanowbe.repository.LocationRepository;
import com.travesrilankanow.travesrilankanowbe.repository.MoreSectionItemRepository;
import com.travesrilankanow.travesrilankanowbe.repository.MoreSectionRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriUtils;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.concurrent.TimeUnit;

/**
 * Dynamic sitemap.xml: static pages plus every location, event, place and
 * "more" section/item detail page, so new content is discoverable without a redeploy.
 */
@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final LocationRepository locationRepository;
    private final EventRepository eventRepository;
    private final PlaceRepository placeRepository;
    private final MoreSectionRepository moreSectionRepository;
    private final MoreSectionItemRepository moreSectionItemRepository;

    @Value("${app.site-url:https://travelsrilankanow.lk}")
    private String siteUrl;

    @GetMapping(value = "/api/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        StringBuilder xml = new StringBuilder(8192);
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n")
           .append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" ")
           .append("xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">\n");

        String today = LocalDate.now().toString();
        url(xml, "", "daily", "1.0", today, null);
        url(xml, "/locations", "daily", "0.9", today, null);
        url(xml, "/events", "daily", "0.9", today, null);
        url(xml, "/places", "daily", "0.9", today, null);
        url(xml, "/gallery", "weekly", "0.7", null, null);

        locationRepository.findAll().forEach(l ->
                url(xml, "/locations/" + seg(l.getSlug()), "weekly", Boolean.TRUE.equals(l.getFeatured()) ? "0.9" : "0.8", null, l.getImageUrl()));
        eventRepository.findAll().forEach(e ->
                url(xml, "/events/" + seg(e.getSlug()), "weekly", Boolean.TRUE.equals(e.getFeatured()) ? "0.9" : "0.8", null, e.getImageUrl()));
        placeRepository.findAll().forEach(p ->
                url(xml, "/places/" + seg(p.getSlug()), "weekly", Boolean.TRUE.equals(p.getFeatured()) ? "0.8" : "0.7", null, p.getImageUrl()));

        for (MoreSection s : moreSectionRepository.findByActiveTrueOrderByDisplayOrderAsc()) {
            url(xml, "/more/" + seg(s.getSlug()), "weekly", "0.7", date(s.getUpdatedAt()), s.getImageUrl());
            for (MoreSectionItem i : moreSectionItemRepository.findBySectionIdAndActiveTrueOrderByDisplayOrderAsc(s.getId())) {
                url(xml, "/more/" + seg(s.getSlug()) + "/" + seg(i.getSlug()), "monthly", "0.6", date(i.getUpdatedAt()), i.getImageUrl());
            }
        }

        xml.append("</urlset>\n");
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic())
                .contentType(MediaType.APPLICATION_XML)
                .body(xml.toString());
    }

    private void url(StringBuilder xml, String path, String changefreq, String priority, String lastmod, String image) {
        xml.append("  <url>\n    <loc>").append(escape(siteUrl + path)).append("</loc>\n");
        if (lastmod != null) xml.append("    <lastmod>").append(lastmod).append("</lastmod>\n");
        xml.append("    <changefreq>").append(changefreq).append("</changefreq>\n")
           .append("    <priority>").append(priority).append("</priority>\n");
        if (image != null && image.startsWith("http")) {
            xml.append("    <image:image><image:loc>").append(escape(image)).append("</image:loc></image:image>\n");
        }
        xml.append("  </url>\n");
    }

    private static String seg(String slug) {
        return UriUtils.encodePathSegment(slug, StandardCharsets.UTF_8);
    }

    private static String date(LocalDateTime t) {
        return t == null ? null : t.toLocalDate().toString();
    }

    private static String escape(String s) {
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}
