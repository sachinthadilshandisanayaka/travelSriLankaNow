import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NavBookingConfig } from '../models/nav-booking-config.model';

@Injectable({ providedIn: 'root' })
export class NavBookingConfigService {
  private base = `${environment.apiUrl}/nav-booking-config`;

  constructor(private http: HttpClient) {}

  /** Returns active booking rules for a nav route (e.g. "/events"). */
  getByRoutePath(routePath: string): Observable<NavBookingConfig[]> {
    return this.http.get<NavBookingConfig[]>(this.base, {
      params: { routePath }
    }).pipe(catchError(() => of([])));
  }
}
