package com.travesrilankanow.travesrilankanowbe.content;

import com.travesrilankanow.travesrilankanowbe.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PackageContentProvider implements ContentProvider {

    private final PackageRepository packageRepository;

    @Override public String getContentType()  { return "packages"; }
    @Override public String getDisplayName()  { return "Packages"; }
    @Override public String getIcon()         { return "briefcase"; }

    @Override
    public Page<ContentItem> getItems(String search, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("title")));
        return packageRepository.findBySearchAndCategory(search, null, pageable)
                .map(p -> new ContentItem(p.getId(), p.getTitle(),
                        p.getImageUrl() != null ? p.getImageUrl() : "",
                        "/packages/" + p.getSlug()));
    }
}
