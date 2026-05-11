package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.ContactDetail;
import com.travesrilankanow.travesrilankanowbe.service.ContactDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/contact-details")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactDetailController {

    private final ContactDetailService contactDetailService;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<ContactDetail>> getAllByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(contactDetailService.getAllByEntity(entityType, entityId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactDetail> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactDetailService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ContactDetail> create(@RequestBody ContactDetail contactDetail) {
        return ResponseEntity.ok(contactDetailService.create(contactDetail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContactDetail> update(
            @PathVariable Long id,
            @RequestBody ContactDetail contactDetail) {
        return ResponseEntity.ok(contactDetailService.update(id, contactDetail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactDetailService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ContactDetail> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(contactDetailService.toggleActive(id));
    }
}
