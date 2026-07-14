package com.travesrilankanow.travesrilankanowbe.content;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/**
 * Auto-discovers every @Component that implements ContentProvider.
 * Adding a new content type requires only implementing ContentProvider
 * and annotating with @Component — no changes here needed.
 */
@Component
@RequiredArgsConstructor
public class ContentProviderRegistry {

    private final List<ContentProvider> providers;

    public List<ContentTypeInfo> getContentTypes() {
        return providers.stream()
                .map(p -> new ContentTypeInfo(p.getContentType(), p.getDisplayName(), p.getIcon()))
                .toList();
    }

    public Optional<ContentProvider> findByType(String type) {
        return providers.stream()
                .filter(p -> p.getContentType().equals(type))
                .findFirst();
    }
}
