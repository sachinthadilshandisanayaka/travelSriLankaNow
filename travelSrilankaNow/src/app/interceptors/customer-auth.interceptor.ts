import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CustomerAuthService } from '../services/customer-auth.service';

@Injectable()
export class CustomerAuthInterceptor implements HttpInterceptor {
  constructor(private authService: CustomerAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isExternal = req.url.startsWith('http') && !req.url.includes('localhost') && !req.url.includes('127.0.0.1');
    const token = this.authService.getToken();
    if (token && !req.headers.has('Authorization') && !isExternal) {
      const cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      return next.handle(cloned);
    }
    return next.handle(req);
  }
}
