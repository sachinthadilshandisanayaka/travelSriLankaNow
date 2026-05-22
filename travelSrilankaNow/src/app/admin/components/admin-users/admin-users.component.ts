import { Component, OnInit } from '@angular/core';
import {
  PermissionService,
  AdminUserDto,
  AdminRoleDto,
  AdminUserCreateRequest,
  AdminUserUpdateRequest
} from '../../services/permission.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss']
})
export class AdminUsersComponent implements OnInit {
  users: AdminUserDto[] = [];
  roles: AdminRoleDto[] = [];
  loading = false;
  error = '';
  success = '';
  formError = '';

  showCreateModal = false;
  showEditModal = false;
  showDeleteConfirm = false;
  selectedUser: AdminUserDto | null = null;

  createForm: AdminUserCreateRequest = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    adminRoleCode: null
  };

  editForm: AdminUserUpdateRequest = {
    email: '',
    firstName: '',
    lastName: '',
    adminRoleCode: null,
    enabled: true
  };

  constructor(private permissionService: PermissionService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.permissionService.getAdminUsers().subscribe({
      next: users => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users.';
        this.loading = false;
      }
    });
    this.permissionService.getRoles().subscribe({
      next: roles => this.roles = roles,
      error: () => {} // silently ignore when caller lacks ROLE_MANAGEMENT:VIEW
    });
  }

  openCreate(): void {
    this.createForm = { username: '', password: '', email: '', firstName: '', lastName: '', adminRoleCode: null };
    this.formError = '';
    this.showCreateModal = true;
  }

  submitCreate(): void {
    this.formError = '';
    this.permissionService.createAdminUser(this.createForm).subscribe({
      next: () => {
        this.success = 'User created successfully.';
        this.showCreateModal = false;
        this.loadData();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Failed to create user.';
      }
    });
  }

  openEdit(user: AdminUserDto): void {
    this.selectedUser = user;
    this.editForm = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      adminRoleCode: user.adminRoleCode,
      enabled: user.enabled
    };
    this.formError = '';
    this.showEditModal = true;
  }

  submitEdit(): void {
    if (!this.selectedUser) return;
    this.formError = '';
    this.permissionService.updateAdminUser(this.selectedUser.id, this.editForm).subscribe({
      next: () => {
        this.success = 'User updated successfully.';
        this.showEditModal = false;
        this.loadData();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.formError = err?.error?.message || 'Failed to update user.';
      }
    });
  }

  openDelete(user: AdminUserDto): void {
    this.selectedUser = user;
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.selectedUser) return;
    this.permissionService.deleteAdminUser(this.selectedUser.id).subscribe({
      next: () => {
        this.success = 'User deactivated.';
        this.showDeleteConfirm = false;
        this.loadData();
        setTimeout(() => this.success = '', 3000);
      },
      error: () => {
        this.error = 'Failed to delete user.';
        setTimeout(() => this.error = '', 4000);
      }
    });
  }

  hasPermission(p: string): boolean {
    return this.permissionService.hasPermission(p);
  }
}
