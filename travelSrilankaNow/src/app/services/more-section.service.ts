import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MoreSection, MoreSectionItem } from '../models/more-section.model';
import { environment } from '../../environments/environment';

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

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

  getSectionItems(slug: string, page: number = 0, size: number = 12, search?: string): Observable<PageResponse<MoreSectionItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (search) params = params.set('search', search);
    return this.http.get<PageResponse<MoreSectionItem>>(`${this.apiUrl}/${slug}/items`, { params });
  }
}
