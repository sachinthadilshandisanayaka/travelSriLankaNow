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
public class AdminContactDetailController {

    private final ContactDetailService contactDetailService;

    @GetMapping("/{entityType}/{entityId}")
    @PreAuthorize("hasAuthority('CONTACT_DETAILS:VIEW')")
    public ResponseEntity<List<ContactDetail>> getAllByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(contactDetailService.getAllByEntity(entityType, entityId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTACT_DETAILS:VIEW')")
    public ResponseEntity<ContactDetail> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactDetailService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CONTACT_DETAILS:CREATE')")
    public ResponseEntity<ContactDetail> create(@RequestBody ContactDetail contactDetail) {
        return ResponseEntity.ok(contactDetailService.create(contactDetail));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTACT_DETAILS:UPDATE')")
    public ResponseEntity<ContactDetail> update(@PathVariable Long id, @RequestBody ContactDetail contactDetail) {
        return ResponseEntity.ok(contactDetailService.update(id, contactDetail));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('CONTACT_DETAILS:DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactDetailService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('CONTACT_DETAILS:UPDATE')")
    public ResponseEntity<ContactDetail> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(contactDetailService.toggleActive(id));
    }
}
