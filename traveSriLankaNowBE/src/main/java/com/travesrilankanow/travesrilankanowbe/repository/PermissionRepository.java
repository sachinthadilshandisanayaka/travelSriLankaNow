package com.travesrilankanow.travesrilankanowbe.repository;

import com.travesrilankanow.travesrilankanowbe.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    Optional<Permission> findByFunctionCodeAndAction(String functionCode, String action);

    List<Permission> findByFunctionCode(String functionCode);

    List<Permission> findAllByOrderByFunctionCodeAscActionAsc();
}
