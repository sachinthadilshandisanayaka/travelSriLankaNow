package com.travesrilankanow.travesrilankanowbe.service;

import com.travesrilankanow.travesrilankanowbe.dto.AdminRoleCreateRequest;
import com.travesrilankanow.travesrilankanowbe.dto.AdminRoleDto;
import com.travesrilankanow.travesrilankanowbe.dto.PermissionDto;
import com.travesrilankanow.travesrilankanowbe.entity.AdminRole;
import com.travesrilankanow.travesrilankanowbe.entity.Permission;
import com.travesrilankanow.travesrilankanowbe.repository.AdminRoleRepository;
import com.travesrilankanow.travesrilankanowbe.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminRoleService {

    private final AdminRoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    public List<AdminRoleDto> getAllRoles() {
        return roleRepository.findAllByOrderByNameAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public AdminRoleDto getRoleById(Long id) {
        return toDto(roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id)));
    }

    @Transactional
    public AdminRoleDto createRole(AdminRoleCreateRequest request) {
        if (roleRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Role code already exists: " + request.getCode());
        }
        Set<Permission> permissions = resolvePermissions(request.getPermissionIds());
        AdminRole role = AdminRole.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .systemRole(false)
                .permissions(permissions)
                .build();
        return toDto(roleRepository.save(role));
    }

    @Transactional
    public AdminRoleDto updateRole(Long id, AdminRoleCreateRequest request) {
        AdminRole role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));
        if (role.isSystemRole()) {
            // System roles can have permissions updated but not code/name changed
            role.setDescription(request.getDescription());
        } else {
            role.setName(request.getName());
            role.setDescription(request.getDescription());
        }
        role.setPermissions(resolvePermissions(request.getPermissionIds()));
        return toDto(roleRepository.save(role));
    }

    @Transactional
    public void deleteRole(Long id) {
        AdminRole role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found: " + id));
        if (role.isSystemRole()) {
            throw new RuntimeException("System roles cannot be deleted");
        }
        roleRepository.delete(role);
    }

    public List<PermissionDto> getAllPermissions() {
        return permissionRepository.findAllByOrderByFunctionCodeAscActionAsc().stream()
                .map(this::toPermissionDto)
                .collect(Collectors.toList());
    }

    private Set<Permission> resolvePermissions(List<Long> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();
        return new HashSet<>(permissionRepository.findAllById(ids));
    }

    public AdminRoleDto toDto(AdminRole role) {
        return AdminRoleDto.builder()
                .id(role.getId())
                .code(role.getCode())
                .name(role.getName())
                .description(role.getDescription())
                .systemRole(role.isSystemRole())
                .createdAt(role.getCreatedAt())
                .permissions(role.getPermissions().stream()
                        .map(this::toPermissionDto)
                        .sorted((a, b) -> {
                            int cmp = a.getFunctionCode().compareTo(b.getFunctionCode());
                            return cmp != 0 ? cmp : a.getAction().compareTo(b.getAction());
                        })
                        .collect(Collectors.toList()))
                .build();
    }

    public PermissionDto toPermissionDto(Permission p) {
        return PermissionDto.builder()
                .id(p.getId())
                .functionCode(p.getFunctionCode())
                .action(p.getAction())
                .description(p.getDescription())
                .build();
    }
}
