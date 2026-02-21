package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.exception.ResourceNotFoundException;
import com.travesrilankanow.travesrilankanowbe.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventService {

    private final EventRepository eventRepository;

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
    }

    public List<Event> getFeaturedEvents() {
        return eventRepository.findByFeaturedTrueOrderByDisplayOrderAsc();
    }

    public List<Event> getEventsByCategory(String category) {
        return eventRepository.findByCategory(category);
    }

    public List<Event> searchEvents(String query) {
        return eventRepository.searchEvents(query);
    }

    public org.springframework.data.domain.Page<Event> getEventsPaginatedWithFilter(
            String search, String category, org.springframework.data.domain.Pageable pageable) {
        String categoryFilter = null;
        if (category != null && !category.isEmpty() && !category.equalsIgnoreCase("all")) {
            categoryFilter = category;
        }
        return eventRepository.findBySearchAndCategory(search, categoryFilter, pageable);
    }

    // Admin CRUD methods
    @Transactional
    public org.springframework.data.domain.Page<Event> getEventsPaginated(org.springframework.data.domain.Pageable pageable) {
        return eventRepository.findAll(pageable);
    }

    @Transactional
    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    @Transactional
    public Event updateEvent(Event event) {
        Event existing = eventRepository.findById(event.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + event.getId()));

        // Partial update - only update fields that are provided (non-null)
        if (event.getTitle() != null) {
            existing.setTitle(event.getTitle());
        }
        if (event.getDescription() != null) {
            existing.setDescription(event.getDescription());
        }
        if (event.getShortDescription() != null) {
            existing.setShortDescription(event.getShortDescription());
        }
        if (event.getImageUrl() != null) {
            existing.setImageUrl(event.getImageUrl());
        }
        if (event.getCategory() != null) {
            existing.setCategory(event.getCategory());
        }
        if (event.getLocation() != null) {
            existing.setLocation(event.getLocation());
        }
        if (event.getDates() != null && !event.getDates().isEmpty()) {
            existing.setDates(event.getDates());
        }
        if (event.getPrice() != null) {
            existing.setPrice(event.getPrice());
        }
        if (event.getDuration() != null) {
            existing.setDuration(event.getDuration());
        }
        if (event.getMaxParticipants() != null) {
            existing.setMaxParticipants(event.getMaxParticipants());
        }
        if (event.getAvailableSpots() != null) {
            existing.setAvailableSpots(event.getAvailableSpots());
        }
        if (event.getIncluded() != null && !event.getIncluded().isEmpty()) {
            existing.setIncluded(event.getIncluded());
        }
        if (event.getRequirements() != null && !event.getRequirements().isEmpty()) {
            existing.setRequirements(event.getRequirements());
        }
        if (event.getRating() != null) {
            existing.setRating(event.getRating());
        }
        if (event.getFeatured() != null) {
            existing.setFeatured(event.getFeatured());
        }
        if (event.getDisplayOrder() != null) {
            existing.setDisplayOrder(event.getDisplayOrder());
        }

        return eventRepository.save(existing);
    }

    @Transactional
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        eventRepository.deleteById(id);
    }
}
