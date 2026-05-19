import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';

@Injectable()
export class CustomerAuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: CustomerAuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isExternal = req.url.startsWith('http') && !req.url.includes('localhost') && !req.url.includes('127.0.0.1');
    const token = this.authService.getToken();

    let authReq = req;
    if (token && !req.headers.has('Authorization') && !isExternal) {
      authReq = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        // Token expired or invalid — clear session and redirect to login
        if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
          this.authService.logout();
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url, reason: 'session-expired' } });
        }
        return throwError(() => error);
      })
    );
  }
}
