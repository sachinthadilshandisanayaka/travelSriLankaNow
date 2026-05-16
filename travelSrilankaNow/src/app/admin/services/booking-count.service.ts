import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BookingCountService {
  private readonly apiUrl = `${environment.apiUrl}/admin/bookings`;
  private pendingSubject = new BehaviorSubject<number>(0);
  readonly pending$ = this.pendingSubject.asObservable();

  constructor(private http: HttpClient) {}

  refresh(): void {
    const params = new HttpParams().set('page', '0').set('size', '1').set('status', 'pending');
    this.http.get<{ totalElements: number }>(this.apiUrl, { params }).subscribe({
      next: (res) => this.pendingSubject.next(res.totalElements),
      error: () => {}
    });
  }
}
