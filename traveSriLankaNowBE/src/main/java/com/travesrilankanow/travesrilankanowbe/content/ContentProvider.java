package com.travesrilankanow.travesrilankanowbe.content;

import org.springframework.data.domain.Page;

/**
 * Implement this interface and annotate with @Component to register a new
 * content type as an image source for hero slide galleries. No other
 * configuration is needed — the ContentProviderRegistry auto-discovers all beans.
 */
public interface ContentProvider {
    /** Unique key used in DB and API (e.g. "events"). */
    String getContentType();

    /** Human-readable label shown in the admin picker (e.g. "Events"). */
    String getDisplayName();

    /** Icon identifier for the admin UI (e.g. "calendar"). */
    String getIcon();

    /** Returns a paged, optionally filtered list of items with images. */
    Page<ContentItem> getItems(String search, int page, int size);
}
