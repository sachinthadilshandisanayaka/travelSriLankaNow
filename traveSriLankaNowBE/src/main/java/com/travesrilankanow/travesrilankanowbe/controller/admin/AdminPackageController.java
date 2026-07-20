package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.TourPackage;
import com.travesrilankanow.travesrilankanowbe.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/packages")
@RequiredArgsConstructor
public class AdminPackageController {

    private final PackageService packageService;

    @GetMapping("/paginated")
    @PreAuthorize("hasAuthority('PACKAGES:VIEW')")
    public ResponseEntity<Page<TourPackage>> getPackagesPaginated(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        if ((search != null && !search.isBlank()) || (category != null && !category.isBlank())) {
            return ResponseEntity.ok(packageService.getPackagesPaginatedWithFilter(search, category, pageable));
        }
        return ResponseEntity.ok(packageService.getPackagesPaginated(pageable));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PACKAGES:CREATE')")
    public ResponseEntity<TourPackage> createPackage(@RequestBody TourPackage pkg) {
        return ResponseEntity.status(HttpStatus.CREATED).body(packageService.createPackage(pkg));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PACKAGES:UPDATE')")
    public ResponseEntity<TourPackage> updatePackage(@PathVariable Long id, @RequestBody TourPackage pkg) {
        pkg.setId(id);
        return ResponseEntity.ok(packageService.updatePackage(pkg));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PACKAGES:DELETE')")
    public ResponseEntity<Void> deletePackage(@PathVariable Long id) {
        packageService.deletePackage(id);
        return ResponseEntity.noContent().build();
    }
}
