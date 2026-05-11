package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.ContactDetail;
import com.travesrilankanow.travesrilankanowbe.service.ContactDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contact-details")
@RequiredArgsConstructor
public class ContactDetailController {

    private final ContactDetailService contactDetailService;

    @GetMapping("/{entityType}/{entityId}")
    public ResponseEntity<List<ContactDetail>> getActiveContacts(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        return ResponseEntity.ok(contactDetailService.getActiveByEntity(entityType, entityId));
    }
}
