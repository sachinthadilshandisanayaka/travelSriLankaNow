import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NavConfig } from '../models/nav-config.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NavConfigService {
  private apiUrl = `${environment.apiUrl}/nav-config`;
  private adminUrl = `${environment.apiUrl}/admin/nav-config`;

  constructor(private http: HttpClient) {}

  getVisibleNavLinks(): Observable<NavConfig[]> {
    return this.http.get<NavConfig[]>(this.apiUrl);
  }

  getAllNavLinks(): Observable<NavConfig[]> {
    return this.http.get<NavConfig[]>(this.adminUrl);
  }

  update(id: number, navConfig: Partial<NavConfig>): Observable<NavConfig> {
    return this.http.put<NavConfig>(`${this.adminUrl}/${id}`, navConfig);
  }

  toggleVisibility(id: number): Observable<NavConfig> {
    return this.http.patch<NavConfig>(`${this.adminUrl}/${id}/toggle-visibility`, {});
  }
}
