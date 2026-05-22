package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.Event;
import com.travesrilankanow.travesrilankanowbe.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventService eventService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('EVENTS:VIEW')")
    public ResponseEntity<Page<Event>> getEventsPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        if ((search != null && !search.isBlank()) || (category != null && !category.isBlank())) {
            return ResponseEntity.ok(eventService.getEventsPaginatedWithFilter(search, category, pageable));
        }
        return ResponseEntity.ok(eventService.getEventsPaginated(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('EVENTS:CREATE')")
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(event));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENTS:UPDATE')")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        event.setId(id);
        return ResponseEntity.ok(eventService.updateEvent(event));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('EVENTS:DELETE')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
