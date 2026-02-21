import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GalleryItem } from '../models/gallery-item.model';
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
export class GalleryService {
  private apiUrl = `${environment.apiUrl}/gallery`;

  constructor(private http: HttpClient) { }

  getAllGalleryItems(): Observable<GalleryItem[]> {
    return this.http.get<PageResponse<GalleryItem> | GalleryItem[]>(this.apiUrl).pipe(
      map(response => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return response;
        }
        return response.content || [];
      })
    );
  }

  getGalleryItemsPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    category?: string,
    type?: string
  ): Observable<PageResponse<GalleryItem>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    if (type && type !== 'all') {
      params = params.set('type', type);
    }

    return this.http.get<PageResponse<GalleryItem>>(this.apiUrl, { params });
  }

  getGalleryItemById(id: number): Observable<GalleryItem> {
    return this.http.get<GalleryItem>(`${this.apiUrl}/${id}`);
  }

  getFeaturedGalleryItems(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.apiUrl}/featured`);
  }

  getGalleryItemsByCategory(category: string): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.apiUrl}/category/${category}`);
  }

  searchGalleryItems(query: string): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
