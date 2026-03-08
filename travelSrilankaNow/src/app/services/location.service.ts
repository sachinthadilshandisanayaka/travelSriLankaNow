import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Location } from '../models/location.model';
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
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) { }

  getAllLocations(): Observable<Location[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return response as Location[];
        }
        if (response && response.content) {
          return response.content as Location[];
        }
        if (response && response.data) {
          return Array.isArray(response.data) ? response.data as Location[] : [];
        }
        if (response && response._embedded && response._embedded.locations) {
          return response._embedded.locations as Location[];
        }
        return [];
      })
    );
  }

  getLocationsPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    category?: string,
    region?: string
  ): Observable<PageResponse<Location>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (category && category !== 'all') {
      params = params.set('category', category);
    }
    if (region && region !== 'all') {
      params = params.set('region', region);
    }

    return this.http.get<PageResponse<Location>>(this.apiUrl, { params });
  }

  getLocationById(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  getFeaturedLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/featured`);
  }

  getLocationsByCategory(category: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/category/${category}`);
  }

  getLocationsByRegion(region: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/region/${region}`);
  }

  searchLocations(query: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
