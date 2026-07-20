package com.travesrilankanow.travesrilankanowbe.controller;

import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import com.travesrilankanow.travesrilankanowbe.service.MasterDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/master-data")
@RequiredArgsConstructor
public class MasterDataController {

    private final MasterDataService masterDataService;

    @GetMapping("/types")
    public ResponseEntity<List<MasterDataType>> getAllTypes() {
        return ResponseEntity.ok(masterDataService.getAllTypes());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<MasterData>> getActiveByType(@PathVariable MasterDataType type) {
        return ResponseEntity.ok(masterDataService.getActiveByType(type));
    }

    // Unfiltered (active + inactive) — used for filter dropdowns that must always
    // list every category regardless of whether "Browse by Category" is toggled on
    @GetMapping("/type/{type}/all")
    public ResponseEntity<List<MasterData>> getAllByType(@PathVariable MasterDataType type) {
        return ResponseEntity.ok(masterDataService.getByType(type));
    }

    @GetMapping("/type/{type}/paginated")
    public ResponseEntity<Page<MasterData>> getActiveByTypePaginated(
            @PathVariable MasterDataType type,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(masterDataService.getActiveByTypePaginated(type, search, pageable));
    }

    @GetMapping("/type/{type}/code/{code}")
    public ResponseEntity<MasterData> getByTypeAndCode(
            @PathVariable MasterDataType type,
            @PathVariable String code) {
        return ResponseEntity.ok(masterDataService.getByTypeAndCode(type, code));
    }
}
