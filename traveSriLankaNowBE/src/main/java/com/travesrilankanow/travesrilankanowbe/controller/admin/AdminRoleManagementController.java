package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.AdminRoleCreateRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AdminRoleDto;
import com.travesrilankanow.travesrilankanowbe.service.AdminRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
public class AdminRoleManagementController {

    private final AdminRoleService adminRoleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT:VIEW')")
    public ResponseEntity<List<AdminRoleDto>> getAllRoles() {
        return ResponseEntity.ok(adminRoleService.getAllRoles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT:VIEW')")
    public ResponseEntity<AdminRoleDto> getRole(@PathVariable Long id) {
        return ResponseEntity.ok(adminRoleService.getRoleById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT:CREATE')")
    public ResponseEntity<AdminRoleDto> createRole(@Valid @RequestBody AdminRoleCreateRequest request) {
        return ResponseEntity.ok(adminRoleService.createRole(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT:UPDATE')")
    public ResponseEntity<AdminRoleDto> updateRole(@PathVariable Long id,
                                                   @Valid @RequestBody AdminRoleCreateRequest request) {
        return ResponseEntity.ok(adminRoleService.updateRole(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_MANAGEMENT:DELETE')")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        adminRoleService.deleteRole(id);
        return ResponseEntity.noContent().build();
    }
}
