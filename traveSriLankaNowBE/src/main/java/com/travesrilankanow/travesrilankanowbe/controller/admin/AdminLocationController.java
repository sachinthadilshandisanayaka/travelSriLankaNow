package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.Location;
import com.travesrilankanow.travesrilankanowbe.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/locations")
@RequiredArgsConstructor
public class AdminLocationController {

    private final LocationService locationService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('LOCATIONS:VIEW')")
    public ResponseEntity<Page<Location>> getLocationsPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String region,
            Pageable pageable) {
        if ((search != null && !search.isBlank()) || (category != null && !category.isBlank()) || (region != null && !region.isBlank())) {
            return ResponseEntity.ok(locationService.getLocationsPaginatedWithFilter(search, category, region, pageable));
        }
        return ResponseEntity.ok(locationService.getLocationsPaginated(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('LOCATIONS:CREATE')")
    public ResponseEntity<Location> createLocation(@RequestBody Location location) {
        return ResponseEntity.status(HttpStatus.CREATED).body(locationService.createLocation(location));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('LOCATIONS:UPDATE')")
    public ResponseEntity<Location> updateLocation(@PathVariable Long id, @RequestBody Location location) {
        location.setId(id);
        return ResponseEntity.ok(locationService.updateLocation(location));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('LOCATIONS:DELETE')")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }
}
