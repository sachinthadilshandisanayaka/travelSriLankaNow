import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BkBlackoutDate, NavBookingConfig } from '../../models/nav-booking-config.model';

@Injectable({ providedIn: 'root' })
export class AdminNavBookingConfigService {
  private base = `${environment.apiUrl}/admin/nav-booking-config`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<NavBookingConfig[]> {
    return this.http.get<NavBookingConfig[]>(this.base);
  }

  getByNavConfigId(navConfigId: number): Observable<NavBookingConfig[]> {
    return this.http.get<NavBookingConfig[]>(`${this.base}/by-nav/${navConfigId}`);
  }

  create(config: NavBookingConfig): Observable<NavBookingConfig> {
    return this.http.post<NavBookingConfig>(this.base, config);
  }

  update(id: number, config: NavBookingConfig): Observable<NavBookingConfig> {
    return this.http.put<NavBookingConfig>(`${this.base}/${id}`, config);
  }

  toggleActive(id: number): Observable<NavBookingConfig> {
    return this.http.patch<NavBookingConfig>(`${this.base}/${id}/toggle`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // Blackout dates
  getBlackoutDates(configId: number): Observable<BkBlackoutDate[]> {
    return this.http.get<BkBlackoutDate[]>(`${this.base}/${configId}/blackout-dates`);
  }

  addBlackoutDate(configId: number, date: string, reason: string): Observable<BkBlackoutDate> {
    return this.http.post<BkBlackoutDate>(`${this.base}/${configId}/blackout-dates`, { date, reason });
  }

  removeBlackoutDate(configId: number, dateId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${configId}/blackout-dates/${dateId}`);
  }
}
