import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoreSection } from '../models/more-section.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MoreSectionService {
  private apiUrl = `${environment.apiUrl}/more-sections`;

  constructor(private http: HttpClient) { }

  getActiveSections(): Observable<MoreSection[]> {
    return this.http.get<MoreSection[]>(this.apiUrl);
  }

  getSectionBySlug(slug: string): Observable<MoreSection> {
    return this.http.get<MoreSection>(`${this.apiUrl}/${slug}`);
  }
}
