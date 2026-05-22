import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  constructor(
    private permissionService: PermissionService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const required: string | string[] = route.data['permission'];
    if (!required) return true;

    const permissions = Array.isArray(required) ? required : [required];
    if (this.permissionService.hasAnyPermission(permissions)) {
      return true;
    }

    return this.router.createUrlTree(['/admin/dashboard']);
  }
}
