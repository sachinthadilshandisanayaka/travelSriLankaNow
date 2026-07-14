import { Component, OnInit } from '@angular/core';
import {
  PermissionService,
  AdminRoleDto,
  PermissionDto,
  AdminRoleCreateRequest
} from '../../services/permission.service';

interface PermissionGroup {
  functionCode: string;
  permissions: PermissionDto[];
}

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {
  roles: AdminRoleDto[] = [];
  allPermissions: PermissionDto[] = [];
  permissionGroups: PermissionGroup[] = [];
  loading = true;
  error = '';
  success = '';
  formError = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  selectedRole: AdminRoleDto | null = null;
  viewRole: AdminRoleDto | null = null;

  formCode = '';
  formName = '';
  formDescription = '';
  selectedPermissionIds = new Set<number>();

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.permissionService.getRoles().subscribe({
      next: roles => {
        this.roles = roles;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load roles.';
        this.loading = false;
      }
    });
    this.permissionService.getAllPermissions().subscribe({
      next: perms => {
        this.allPermissions = perms;
        this.buildGroups(perms);
      }
    });
  }

  private buildGroups(perms: PermissionDto[]): void {
    const map = new Map<string, PermissionDto[]>();
    for (const p of perms) {
      if (!map.has(p.functionCode)) map.set(p.functionCode, []);
      map.get(p.functionCode)!.push(p);
    }
    this.permissionGroups = Array.from(map.entries()).map(([functionCode, permissions]) => ({
      functionCode,
      permissions: permissions.sort((a, b) => a.action.localeCompare(b.action))
    }));
  }

  openCreate(): void {
    this.formCode = '';
    this.formName = '';
    this.formDescription = '';
    this.selectedPermissionIds = new Set();
    this.formError = '';
    this.showCreateModal = true;
  }

  openEdit(role: AdminRoleDto): void {
    this.selectedRole = role;
    this.formCode = role.code;
    this.formName = role.name;
    this.formDescription = role.description;
    this.selectedPermissionIds = new Set(role.permissions.map(p => p.id));
    this.formError = '';
    this.showEditModal = true;
  }

  togglePermission(id: number): void {
    if (this.selectedPermissionIds.has(id)) {
      this.selectedPermissionIds.delete(id);
    } else {
      this.selectedPermissionIds.add(id);
    }
  }

  toggleGroup(group: PermissionGroup): void {
    const allSelected = group.permissions.every(p => this.selectedPermissionIds.has(p.id));
    for (const p of group.permissions) {
      if (allSelected) {
        this.selectedPermissionIds.delete(p.id);
      } else {
        this.selectedPermissionIds.add(p.id);
      }
    }
  }

  isGroupAllSelected(group: PermissionGroup): boolean {
    return group.permissions.every(p => this.selectedPermissionIds.has(p.id));
  }

  isGroupPartialSelected(group: PermissionGroup): boolean {
    const count = group.permissions.filter(p => this.selectedPermissionIds.has(p.id)).length;
    return count > 0 && count < group.permissions.length;
  }

  private buildRequest(): AdminRoleCreateRequest {
    return {
      code: this.formCode.toUpperCase(),
      name: this.formName,
      description: this.formDescription,
      permissionIds: Array.from(this.selectedPermissionIds)
    };
  }

  submitCreate(): void {
    this.formError = '';
    this.permissionService.createRole(this.buildRequest()).subscribe({
      next: () => {
        this.success = 'Role created successfully.';
        this.showCreateModal = false;
        this.loadData();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Failed to create role.';
      }
    });
  }

  submitEdit(): void {
    if (!this.selectedRole) return;
    this.formError = '';
    const req = this.buildRequest();
    if (this.selectedRole.systemRole) {
      req.code = this.selectedRole.code;
      req.name = this.selectedRole.name;
    }
    this.permissionService.updateRole(this.selectedRole.id, req).subscribe({
      next: () => {
        this.success = 'Role updated successfully.';
        this.showEditModal = false;
        this.loadData();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Failed to update role.';
      }
    });
  }

  openDelete(role: AdminRoleDto): void {
    this.selectedRole = role;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.selectedRole) return;
    this.permissionService.deleteRole(this.selectedRole.id).subscribe({
      next: () => {
        this.success = 'Role deleted.';
        this.showDeleteConfirm = false;
        this.loadData();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Cannot delete system role.';
        this.showDeleteConfirm = false;
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

  toggleViewRole(role: AdminRoleDto): void {
    this.viewRole = this.viewRole?.id === role.id ? null : role;
  }

  roleHasPerm(role: AdminRoleDto, permId: number): boolean {
    return role.permissions.some(p => p.id === permId);
  }

  readonly ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE'];

  getPermByAction(group: PermissionGroup, action: string): PermissionDto | undefined {
    return group.permissions.find(p => p.action === action);
  }

  hasPermission(p: string): boolean {
    return this.permissionService.hasPermission(p);
  }
}
