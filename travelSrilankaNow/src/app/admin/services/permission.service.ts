import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';
import { environment } from '../../../environments/environment';

export interface PermissionDto {
  id: number;
  functionCode: string;
  action: string;
  description: string;
}

export interface AdminRoleDto {
  id: number;
  code: string;
  name: string;
  description: string;
  systemRole: boolean;
  permissions: PermissionDto[];
  createdAt: string;
}

export interface AdminRoleCreateRequest {
  code: string;
  name: string;
  description: string;
  permissionIds: number[];
}

export interface AdminUserDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  adminRoleCode: string | null;
  adminRoleName: string | null;
  enabled: boolean;
  createdAt: string;
}

export interface AdminUserCreateRequest {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  adminRoleCode: string | null;
}

export interface AdminUserUpdateRequest {
  email: string;
  firstName: string;
  lastName: string;
  adminRoleCode: string | null;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(
    private authService: AdminAuthService,
    private http: HttpClient
  ) {}

  hasPermission(permission: string): boolean {
    return this.authService.hasPermission(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.authService.hasPermission(p));
  }

  // ── Permissions ──────────────────────────────────────────────────────────

  getAllPermissions(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(`${this.apiUrl}/permissions`);
  }

  // ── Roles ─────────────────────────────────────────────────────────────────

  getRoles(): Observable<AdminRoleDto[]> {
    return this.http.get<AdminRoleDto[]>(`${this.apiUrl}/roles`);
  }

  getRole(id: number): Observable<AdminRoleDto> {
    return this.http.get<AdminRoleDto>(`${this.apiUrl}/roles/${id}`);
  }

  createRole(request: AdminRoleCreateRequest): Observable<AdminRoleDto> {
    return this.http.post<AdminRoleDto>(`${this.apiUrl}/roles`, request);
  }

  updateRole(id: number, request: AdminRoleCreateRequest): Observable<AdminRoleDto> {
    return this.http.put<AdminRoleDto>(`${this.apiUrl}/roles/${id}`, request);
  }

  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/roles/${id}`);
  }

  // ── Users ──────────────────────────────────────────────────────────────────

  getAdminUsers(): Observable<AdminUserDto[]> {
    return this.http.get<AdminUserDto[]>(`${this.apiUrl}/users`);
  }

  getAdminUser(id: number): Observable<AdminUserDto> {
    return this.http.get<AdminUserDto>(`${this.apiUrl}/users/${id}`);
  }

  createAdminUser(request: AdminUserCreateRequest): Observable<AdminUserDto> {
    return this.http.post<AdminUserDto>(`${this.apiUrl}/users`, request);
  }

  updateAdminUser(id: number, request: AdminUserUpdateRequest): Observable<AdminUserDto> {
    return this.http.put<AdminUserDto>(`${this.apiUrl}/users/${id}`, request);
  }

  deleteAdminUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${id}`);
  }
}
