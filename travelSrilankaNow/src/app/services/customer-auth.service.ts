import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CustomerUser {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  profileImageUrl: string;
  role: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token: string;
  refresh_token: string;
  username: string;
  first_name: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

@Injectable({ providedIn: 'root' })
export class CustomerAuthService {
  private readonly TOKEN_KEY = 'customer_token';
  private readonly USER_KEY = 'customer_user';
  private readonly apiBase = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<CustomerUser | null>(this.loadStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/register`, req).pipe(
      tap(res => { if (res.success) this.handleAuthSuccess(res); })
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/login`, { username, password }).pipe(
      tap(res => { if (res.success) this.handleAuthSuccess(res); })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): CustomerUser | null {
    return this.currentUserSubject.getValue();
  }

  getProfile(): Observable<CustomerUser> {
    return this.http.get<CustomerUser>(`${this.apiBase}/customer/profile`).pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  updateProfile(updates: Partial<CustomerUser>): Observable<any> {
    return this.http.put(`${this.apiBase}/customer/profile`, updates).pipe(
      tap(() => this.getProfile().subscribe())
    );
  }

  getMyBookings(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiBase}/customer/bookings`);
  }

  private handleAuthSuccess(res: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    // Set partial user immediately for responsive UI, then fetch full profile
    const partial: CustomerUser = {
      id: 0, username: res.username, firstName: res.first_name,
      lastName: '', email: '', phoneNumber: '', profileImageUrl: '', role: res.role
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(partial));
    this.currentUserSubject.next(partial);
    // Fetch full profile in background to get email, lastName, id, etc.
    this.getProfile().subscribe({ error: () => {} });
  }

  private loadStoredUser(): CustomerUser | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
