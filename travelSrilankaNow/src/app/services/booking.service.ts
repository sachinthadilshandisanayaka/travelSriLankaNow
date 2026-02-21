import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EventBooking } from '../models/event.model';
import { environment } from '../../environments/environment';

export interface EventBookingDTO {
  id?: number;
  eventId: number;
  eventDateId: number;
  participantName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  specialRequests?: string;
  totalPrice: number;
  bookingDate?: Date;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  bookEvent(bookingDTO: EventBookingDTO): Observable<EventBooking> {
    return this.http.post<EventBooking>(`${this.apiUrl}/events/book`, bookingDTO);
  }

  getAllBookings(): Observable<EventBooking[]> {
    return this.http.get<EventBooking[]>(`${this.apiUrl}/bookings`);
  }

  getBookingById(id: number): Observable<EventBooking> {
    return this.http.get<EventBooking>(`${this.apiUrl}/bookings/${id}`);
  }

  getBookingsByEmail(email: string): Observable<EventBooking[]> {
    return this.http.get<EventBooking[]>(`${this.apiUrl}/bookings/email/${email}`);
  }

  getBookingsByEventId(eventId: number): Observable<EventBooking[]> {
    return this.http.get<EventBooking[]>(`${this.apiUrl}/bookings/event/${eventId}`);
  }

  updateBookingStatus(id: number, status: 'pending' | 'confirmed' | 'cancelled'): Observable<EventBooking> {
    const params = new HttpParams().set('status', status);
    return this.http.patch<EventBooking>(`${this.apiUrl}/bookings/${id}/status`, null, { params });
  }
}
