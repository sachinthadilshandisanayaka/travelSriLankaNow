import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Place } from '../models/place.model';
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
export class PlaceService {
  private apiUrl = `${environment.apiUrl}/places`;

  constructor(private http: HttpClient) { }

  getAllPlaces(): Observable<Place[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return response as Place[];
        }
        // Check for Spring Boot paginated response
        if (response && response.content) {
          return response.content as Place[];
        }
        return [];
      })
    );
  }

  getPlacesPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    type?: string,
    priceRange?: string
  ): Observable<PageResponse<Place>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (type && type !== 'all') {
      params = params.set('type', type);
    }
    if (priceRange && priceRange !== 'all') {
      params = params.set('priceRange', priceRange);
    }

    return this.http.get<PageResponse<Place>>(this.apiUrl, { params });
  }

  getPlaceById(id: number): Observable<Place> {
    return this.http.get<Place>(`${this.apiUrl}/${id}`);
  }

  getFeaturedPlaces(): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.apiUrl}/featured`);
  }

  getPlacesByType(type: string): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.apiUrl}/type/${type}`);
  }

  getPlacesByRegion(region: string): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.apiUrl}/region/${region}`);
  }

  searchPlaces(query: string): Observable<Place[]> {
    return this.http.get<Place[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
