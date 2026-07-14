package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.dto.*;
import com.travesrilankanow.travesrilankanowbe.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @PreAuthorize("hasAuthority('COMPANY_MANAGEMENT:VIEW')")
    public ResponseEntity<List<CompanyDto>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY_MANAGEMENT:VIEW','COMPANY_DETAILS:VIEW')")
    public ResponseEntity<CompanyDto> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getById(id));
    }

    @GetMapping("/my-company")
    @PreAuthorize("hasAuthority('COMPANY_DETAILS:VIEW')")
    public ResponseEntity<CompanyDto> getMyCompany(Authentication auth) {
        return companyService.getCompanyForUser(auth.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('COMPANY_MANAGEMENT:CREATE')")
    public ResponseEntity<CompanyDto> createCompany(@Valid @RequestBody CompanyRequest request) {
        return ResponseEntity.ok(companyService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('COMPANY_MANAGEMENT:UPDATE','COMPANY_DETAILS:UPDATE')")
    public ResponseEntity<CompanyDto> updateCompany(@PathVariable Long id,
                                                     @Valid @RequestBody CompanyRequest request,
                                                     Authentication auth) {
        return ResponseEntity.ok(companyService.update(id, request, auth.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('COMPANY_MANAGEMENT:DELETE')")
    public ResponseEntity<Void> deactivateCompany(@PathVariable Long id) {
        companyService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/logo")
    @PreAuthorize("hasAnyAuthority('COMPANY_MANAGEMENT:UPDATE','COMPANY_DETAILS:UPDATE')")
    public ResponseEntity<String> uploadLogo(@PathVariable Long id,
                                              @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(companyService.uploadLogo(id, file));
    }

    @PostMapping("/{id}/signature")
    @PreAuthorize("hasAnyAuthority('COMPANY_MANAGEMENT:UPDATE','COMPANY_DETAILS:UPDATE')")
    public ResponseEntity<String> uploadSignature(@PathVariable Long id,
                                                   @RequestParam("file") MultipartFile file) throws Exception {
        return ResponseEntity.ok(companyService.uploadSignature(id, file));
    }

    @GetMapping("/{id}/users")
    @PreAuthorize("hasAnyAuthority('COMPANY_MANAGEMENT:VIEW','COMPANY_DETAILS:VIEW')")
    public ResponseEntity<List<AdminUserDto>> getCompanyUsers(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyUsers(id));
    }

    @PostMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAuthority('COMPANY_MANAGEMENT:UPDATE')")
    public ResponseEntity<Void> assignUser(@PathVariable Long id, @PathVariable Long userId) {
        companyService.assignUser(id, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/users/{userId}")
    @PreAuthorize("hasAuthority('COMPANY_MANAGEMENT:UPDATE')")
    public ResponseEntity<Void> removeUser(@PathVariable Long id, @PathVariable Long userId) {
        companyService.removeUser(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/change-log")
    @PreAuthorize("hasAnyAuthority('COMPANY_MANAGEMENT:VIEW','COMPANY_DETAILS:VIEW')")
    public ResponseEntity<List<CompanyChangeLogDto>> getChangeLog(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getChangeLog(id));
    }
}
