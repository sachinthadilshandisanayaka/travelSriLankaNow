import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AdminAuthService } from '../services/admin-auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authService: AdminAuthService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip auth endpoints and external APIs
    if (this.isAuthEndpoint(request.url) || this.isExternalUrl(request.url)) {
      return next.handle(request);
    }

    // Only attach admin token to admin API routes — never to customer/public routes
    if (!this.isAdminRoute(request.url)) {
      return next.handle(request);
    }

    // Add token to request if available
    const token = this.authService.getAccessToken();
    if (token) {
      request = this.addTokenToRequest(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && !this.isAuthEndpoint(request.url)) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addTokenToRequest(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private isAuthEndpoint(url: string): boolean {
    return url.includes('/admin/auth/login') || url.includes('/admin/auth/refresh');
  }

  private isAdminRoute(url: string): boolean {
    return url.includes('/api/admin/');
  }

  private isExternalUrl(url: string): boolean {
    return url.startsWith('http') && !url.includes('localhost') && !url.includes('127.0.0.1');
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.authService.getRefreshToken();

      if (refreshToken) {
        return this.authService.refreshToken().pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;

            if (response.success) {
              this.refreshTokenSubject.next(response.access_token);
              return next.handle(this.addTokenToRequest(request, response.access_token));
            } else {
              this.authService.clearAuth();
              this.router.navigate(['/admin/login']);
              return throwError(() => new Error('Token refresh failed'));
            }
          }),
          catchError((error) => {
            this.isRefreshing = false;
            this.authService.clearAuth();
            this.router.navigate(['/admin/login']);
            return throwError(() => error);
          })
        );
      } else {
        this.isRefreshing = false;
        this.authService.clearAuth();
        this.router.navigate(['/admin/login']);
        return throwError(() => new Error('No refresh token available'));
      }
    }

    // Wait for the refresh to complete
    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(this.addTokenToRequest(request, token)))
    );
  }
}
