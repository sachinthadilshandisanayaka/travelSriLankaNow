import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event, EventBooking } from '../models/event.model';
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
export class EventService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) { }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<PageResponse<Event> | Event[]>(this.apiUrl).pipe(
      map(response => {
        // Handle both paginated response and direct array
        if (Array.isArray(response)) {
          return response;
        }
        return response.content || [];
      })
    );
  }

  getEventsPaginated(
    page: number = 0,
    size: number = 10,
    search?: string,
    category?: string
  ): Observable<PageResponse<Event>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim()) {
      params = params.set('search', search.trim());
    }
    if (category && category !== 'all') {
      params = params.set('category', category);
    }

    return this.http.get<PageResponse<Event>>(this.apiUrl, { params });
  }

  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  getEventBySlug(slug: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/slug/${slug}`);
  }

  getFeaturedEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/featured`);
  }

  getEventsByCategory(category: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/category/${category}`);
  }

  searchEvents(query: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
