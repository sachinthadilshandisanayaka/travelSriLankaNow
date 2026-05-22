package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.AdminUserCreateRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AdminUserDto;
import com.travesrilankanow.travesrilankanowbe.dto.AdminUserUpdateRequest;
import com.travesrilankanow.travesrilankanowbe.service.AdminUserManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserManagementController {

    private final AdminUserManagementService userManagementService;

    @GetMapping
    @PreAuthorize("hasAuthority('USER_MANAGEMENT:VIEW')")
    public ResponseEntity<List<AdminUserDto>> getAllAdminUsers() {
        return ResponseEntity.ok(userManagementService.getAllAdminUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGEMENT:VIEW')")
    public ResponseEntity<AdminUserDto> getAdminUser(@PathVariable Long id) {
        return ResponseEntity.ok(userManagementService.getAdminUser(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('USER_MANAGEMENT:CREATE')")
    public ResponseEntity<AdminUserDto> createAdminUser(@Valid @RequestBody AdminUserCreateRequest request) {
        return ResponseEntity.ok(userManagementService.createAdminUser(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGEMENT:UPDATE')")
    public ResponseEntity<AdminUserDto> updateAdminUser(@PathVariable Long id,
                                                        @Valid @RequestBody AdminUserUpdateRequest request) {
        return ResponseEntity.ok(userManagementService.updateAdminUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('USER_MANAGEMENT:DELETE')")
    public ResponseEntity<Void> deleteAdminUser(@PathVariable Long id) {
        userManagementService.deleteAdminUser(id);
        return ResponseEntity.noContent().build();
    }
}
