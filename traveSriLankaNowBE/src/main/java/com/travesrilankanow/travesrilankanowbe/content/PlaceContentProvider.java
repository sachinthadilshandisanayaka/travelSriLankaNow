package com.travesrilankanow.travesrilankanowbe.content;

import com.travesrilankanow.travesrilankanowbe.repository.PlaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PlaceContentProvider implements ContentProvider {

    private final PlaceRepository placeRepository;

    @Override public String getContentType()  { return "places"; }
    @Override public String getDisplayName()  { return "Places"; }
    @Override public String getIcon()         { return "compass"; }

    @Override
    public Page<ContentItem> getItems(String search, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("name")));
        return placeRepository.findBySearchAndTypeAndPriceRange(search, null, null, pageable)
                .map(p -> new ContentItem(p.getId(), p.getName(),
                        p.getImageUrl() != null ? p.getImageUrl() : "",
                        "/places/" + p.getSlug()));
    }
}
