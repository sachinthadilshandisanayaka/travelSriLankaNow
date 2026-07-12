package com.travesrilankanow.travesrilankanowbe.content;

import com.travesrilankanow.travesrilankanowbe.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LocationContentProvider implements ContentProvider {

    private final LocationRepository locationRepository;

    @Override public String getContentType()  { return "locations"; }
    @Override public String getDisplayName()  { return "Locations"; }
    @Override public String getIcon()         { return "map-pin"; }

    @Override
    public Page<ContentItem> getItems(String search, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("name")));
        return locationRepository.findBySearchAndCategory(search, null, pageable)
                .map(l -> new ContentItem(l.getId(), l.getName(),
                        l.getImageUrl() != null ? l.getImageUrl() : "",
                        "/locations/" + l.getSlug()));
    }
}
