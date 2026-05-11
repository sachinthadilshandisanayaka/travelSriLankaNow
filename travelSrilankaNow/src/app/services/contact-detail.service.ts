import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactDetail } from '../models/contact-detail.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ContactDetailService {
  private publicUrl = `${environment.apiUrl}/contact-details`;
  private adminUrl = `${environment.apiUrl}/admin/contact-details`;

  constructor(private http: HttpClient) {}

  getByEntity(entityType: string, entityId: number): Observable<ContactDetail[]> {
    return this.http.get<ContactDetail[]>(`${this.publicUrl}/${entityType}/${entityId}`);
  }

  getAllByEntity(entityType: string, entityId: number): Observable<ContactDetail[]> {
    return this.http.get<ContactDetail[]>(`${this.adminUrl}/${entityType}/${entityId}`);
  }

  create(detail: ContactDetail): Observable<ContactDetail> {
    return this.http.post<ContactDetail>(this.adminUrl, detail);
  }

  update(id: number, detail: ContactDetail): Observable<ContactDetail> {
    return this.http.put<ContactDetail>(`${this.adminUrl}/${id}`, detail);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${id}`);
  }

  toggleActive(id: number): Observable<ContactDetail> {
    return this.http.patch<ContactDetail>(`${this.adminUrl}/${id}/toggle-active`, {});
  }
}
