package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.PageHeaderBackground;
import com.travesrilankanow.travesrilankanowbe.entity.PageType;
import com.travesrilankanow.travesrilankanowbe.service.PageHeaderBackgroundService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/page-header-backgrounds")
@RequiredArgsConstructor
public class AdminPageHeaderBackgroundController {

    private final PageHeaderBackgroundService pageHeaderBackgroundService;

    @GetMapping
    public ResponseEntity<List<PageHeaderBackground>> getAllBackgrounds() {
        return ResponseEntity.ok(pageHeaderBackgroundService.getAllBackgrounds());
    }

    @GetMapping("/type/{pageType}")
    public ResponseEntity<List<PageHeaderBackground>> getBackgroundsByPageType(@PathVariable String pageType) {
        try {
            PageType type = PageType.valueOf(pageType.toUpperCase());
            return ResponseEntity.ok(pageHeaderBackgroundService.getBackgroundsByPageType(type));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PageHeaderBackground> getBackgroundById(@PathVariable Long id) {
        return ResponseEntity.ok(pageHeaderBackgroundService.getBackgroundById(id));
    }

    @PostMapping
    public ResponseEntity<PageHeaderBackground> createBackground(@RequestBody PageHeaderBackground background) {
        PageHeaderBackground created = pageHeaderBackgroundService.createBackground(background);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PageHeaderBackground> updateBackground(@PathVariable Long id, @RequestBody PageHeaderBackground background) {
        PageHeaderBackground updated = pageHeaderBackgroundService.updateBackground(id, background);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBackground(@PathVariable Long id) {
        pageHeaderBackgroundService.deleteBackground(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<PageHeaderBackground> activateBackground(@PathVariable Long id) {
        PageHeaderBackground activated = pageHeaderBackgroundService.activateBackground(id);
        return ResponseEntity.ok(activated);
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<PageHeaderBackground> deactivateBackground(@PathVariable Long id) {
        PageHeaderBackground deactivated = pageHeaderBackgroundService.deactivateBackground(id);
        return ResponseEntity.ok(deactivated);
    }
}
