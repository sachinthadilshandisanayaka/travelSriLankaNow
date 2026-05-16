package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.Place;
import com.travesrilankanow.travesrilankanowbe.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
public class AdminPlaceController {

    private final PlaceService placeService;

    @GetMapping("/paginated")
    public ResponseEntity<Page<Place>> getPlacesPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String priceRange,
            Pageable pageable) {
        if ((search != null && !search.isBlank()) || (type != null && !type.isBlank()) || (priceRange != null && !priceRange.isBlank())) {
            return ResponseEntity.ok(placeService.getPlacesPaginatedWithFilter(search, type, priceRange, pageable));
        }
        return ResponseEntity.ok(placeService.getPlacesPaginated(pageable));
    }

    @PostMapping
    public ResponseEntity<Place> createPlace(@RequestBody Place place) {
        Place created = placeService.createPlace(place);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Place> updatePlace(@PathVariable Long id, @RequestBody Place place) {
        place.setId(id);
        Place updated = placeService.updatePlace(place);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return ResponseEntity.noContent().build();
    }
}
