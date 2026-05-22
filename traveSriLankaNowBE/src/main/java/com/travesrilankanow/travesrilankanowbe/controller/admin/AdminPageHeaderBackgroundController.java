package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.PageHeaderBackground;
import com.travesrilankanow.travesrilankanowbe.entity.PageType;
import com.travesrilankanow.travesrilankanowbe.service.PageHeaderBackgroundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/page-header-backgrounds")
@RequiredArgsConstructor
public class AdminPageHeaderBackgroundController {

    private final PageHeaderBackgroundService pageHeaderBackgroundService;

    @GetMapping
    @PreAuthorize("hasAuthority('PAGE_HEADERS:VIEW')")
    public ResponseEntity<List<PageHeaderBackground>> getAllBackgrounds() {
        return ResponseEntity.ok(pageHeaderBackgroundService.getAllBackgrounds());
    }

    @GetMapping("/type/{pageType}")
    @PreAuthorize("hasAuthority('PAGE_HEADERS:VIEW')")
    public ResponseEntity<List<PageHeaderBackground>> getBackgroundsByPageType(@PathVariable String pageType) {
        try {
            return ResponseEntity.ok(pageHeaderBackgroundService.getBackgroundsByPageType(PageType.valueOf(pageType.toUpperCase())));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PAGE_HEADERS:VIEW')")
    public ResponseEntity<PageHeaderBackground> getBackgroundById(@PathVariable Long id) {
        return ResponseEntity.ok(pageHeaderBackgroundService.getBackgroundById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PAGE_HEADERS:CREATE')")
    public ResponseEntity<PageHeaderBackground> createBackground(@RequestBody PageHeaderBackground background) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pageHeaderBackgroundService.createBackground(background));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PAGE_HEADERS:UPDATE')")
    public ResponseEntity<PageHeaderBackground> updateBackground(@PathVariable Long id, @RequestBody PageHeaderBackground background) {
        return ResponseEntity.ok(pageHeaderBackgroundService.updateBackground(id, background));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PAGE_HEADERS:DELETE')")
    public ResponseEntity<Void> deleteBackground(@PathVariable Long id) {
        pageHeaderBackgroundService.deleteBackground(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('PAGE_HEADERS:UPDATE')")
    public ResponseEntity<PageHeaderBackground> activateBackground(@PathVariable Long id) {
        return ResponseEntity.ok(pageHeaderBackgroundService.activateBackground(id));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('PAGE_HEADERS:UPDATE')")
    public ResponseEntity<PageHeaderBackground> deactivateBackground(@PathVariable Long id) {
        return ResponseEntity.ok(pageHeaderBackgroundService.deactivateBackground(id));
    }
}
