package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.MasterData;
import com.travesrilankanow.travesrilankanowbe.entity.MasterData.MasterDataType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MasterDataRepository extends JpaRepository<MasterData, Long> {

    List<MasterData> findByTypeOrderBySortOrderAsc(MasterDataType type);

    List<MasterData> findByTypeAndIsActiveTrueOrderBySortOrderAsc(MasterDataType type);

    Optional<MasterData> findByTypeAndCode(MasterDataType type, String code);

    boolean existsByTypeAndCode(MasterDataType type, String code);

    boolean existsByTypeAndCodeAndIdNot(MasterDataType type, String code, Long id);

    List<MasterData> findAllByOrderByTypeAscSortOrderAsc();
}
