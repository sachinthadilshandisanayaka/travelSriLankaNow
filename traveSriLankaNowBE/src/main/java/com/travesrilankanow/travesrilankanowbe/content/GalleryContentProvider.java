package com.travesrilankanow.travesrilankanowbe.content;

import com.travesrilankanow.travesrilankanowbe.repository.GalleryItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GalleryContentProvider implements ContentProvider {

    private final GalleryItemRepository galleryItemRepository;

    @Override public String getContentType()  { return "gallery"; }
    @Override public String getDisplayName()  { return "Gallery"; }
    @Override public String getIcon()         { return "image"; }

    @Override
    public Page<ContentItem> getItems(String search, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("title")));
        return galleryItemRepository.findBySearchAndCategoryAndType(search, null, null, pageable)
                .map(g -> new ContentItem(g.getId(), g.getTitle(),
                        g.getThumbnailUrl() != null ? g.getThumbnailUrl() : g.getUrl(),
                        "/gallery"));
    }
}
