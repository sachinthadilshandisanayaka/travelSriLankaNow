import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TourPackage, PackageBooking } from '../models/package.model';
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
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;

  constructor(private http: HttpClient) { }

  getAllPackages(): Observable<TourPackage[]> {
    return this.http.get<PageResponse<TourPackage> | TourPackage[]>(this.apiUrl).pipe(
      map(response => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return response;
        }
        return response.content || [];
      })
    );
  }

  getPackagesPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    category?: string
  ): Observable<PageResponse<TourPackage>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (category && category !== 'all') {
      params = params.set('category', category);
    }

    return this.http.get<PageResponse<TourPackage>>(this.apiUrl, { params });
  }

  getPackageById(id: number): Observable<TourPackage> {
    return this.http.get<TourPackage>(`${this.apiUrl}/${id}`);
  }

  getPackageBySlug(slug: string): Observable<TourPackage> {
    return this.http.get<TourPackage>(`${this.apiUrl}/slug/${slug}`);
  }

  getFeaturedPackages(): Observable<TourPackage[]> {
    return this.http.get<TourPackage[]>(`${this.apiUrl}/featured`);
  }

  getPackagesByCategory(category: string): Observable<TourPackage[]> {
    return this.http.get<TourPackage[]>(`${this.apiUrl}/category/${category}`);
  }

  searchPackages(query: string): Observable<TourPackage[]> {
    return this.http.get<TourPackage[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
