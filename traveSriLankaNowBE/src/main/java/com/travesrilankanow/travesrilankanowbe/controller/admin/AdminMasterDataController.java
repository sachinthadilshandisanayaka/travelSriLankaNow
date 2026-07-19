package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import com.travesrilankanow.travesrilankanowbe.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/master-data")
@RequiredArgsConstructor
public class AdminMasterDataController {

    private final MasterDataService masterDataService;

    @GetMapping
    @PreAuthorize("hasAuthority('MASTER_DATA:VIEW')")
    public ResponseEntity<List<MasterData>> getAll() {
        return ResponseEntity.ok(masterDataService.getAllMasterData());
    }

    @GetMapping("/types")
    @PreAuthorize("hasAuthority('MASTER_DATA:VIEW')")
    public ResponseEntity<List<MasterDataType>> getAllTypes() {
        return ResponseEntity.ok(masterDataService.getAllTypes());
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAuthority('MASTER_DATA:VIEW')")
    public ResponseEntity<List<MasterData>> getByType(@PathVariable MasterDataType type) {
        return ResponseEntity.ok(masterDataService.getByType(type));
    }

    @GetMapping("/type/{type}/paginated")
    @PreAuthorize("hasAuthority('MASTER_DATA:VIEW')")
    public ResponseEntity<Page<MasterData>> getByTypePaginated(
            @PathVariable MasterDataType type,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(masterDataService.getByTypePaginated(type, search, pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('MASTER_DATA:VIEW')")
    public ResponseEntity<MasterData> getById(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MASTER_DATA:CREATE')")
    public ResponseEntity<MasterData> create(@RequestBody MasterData masterData) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.create(masterData));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MASTER_DATA:UPDATE')")
    public ResponseEntity<MasterData> update(@PathVariable Long id, @RequestBody MasterData masterData) {
        return ResponseEntity.ok(masterDataService.update(id, masterData));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MASTER_DATA:DELETE')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        masterDataService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('MASTER_DATA:UPDATE')")
    public ResponseEntity<MasterData> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.toggleActive(id));
    }
}
