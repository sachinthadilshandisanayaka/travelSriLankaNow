package com.travesrilankanow.travesrilankanowbe.content;

import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class EventContentProvider implements ContentProvider {

    private final EventRepository eventRepository;

    @Override public String getContentType()  { return "events"; }
    @Override public String getDisplayName()  { return "Events"; }
    @Override public String getIcon()         { return "calendar"; }

    @Override
    public Page<ContentItem> getItems(String search, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("displayOrder").ascending().and(Sort.by("title")));
        return eventRepository.findBySearchAndCategory(search, null, pageable)
                .map(e -> new ContentItem(e.getId(), e.getTitle(),
                        e.getImageUrl() != null ? e.getImageUrl() : "",
                        "/events/" + e.getSlug()));
    }
}
