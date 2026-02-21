package com.travesrilankanow.travesrilankanowbe.controller.admin;

import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import com.travesrilankanow.travesrilankanowbe.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/master-data")
@RequiredArgsConstructor
public class AdminMasterDataController {

    private final MasterDataService masterDataService;

    @GetMapping
    public ResponseEntity<List<MasterData>> getAll() {
        return ResponseEntity.ok(masterDataService.getAllMasterData());
    }

    @GetMapping("/types")
    public ResponseEntity<List<MasterDataType>> getAllTypes() {
        return ResponseEntity.ok(masterDataService.getAllTypes());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<MasterData>> getByType(@PathVariable MasterDataType type) {
        return ResponseEntity.ok(masterDataService.getByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MasterData> getById(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.getById(id));
    }

    @PostMapping
    public ResponseEntity<MasterData> create(@RequestBody MasterData masterData) {
        return ResponseEntity.status(HttpStatus.CREATED).body(masterDataService.create(masterData));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MasterData> update(@PathVariable Long id, @RequestBody MasterData masterData) {
        return ResponseEntity.ok(masterDataService.update(id, masterData));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        masterDataService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<MasterData> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(masterDataService.toggleActive(id));
    }
}
