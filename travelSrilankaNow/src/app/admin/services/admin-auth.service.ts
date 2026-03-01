import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  success: boolean;
  message: string;
  access_token?: string;
  refresh_token?: string;
  username?: string;
  first_name?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = `${environment.apiUrl}/admin/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private displayNameSubject = new BehaviorSubject<string>(this.getFirstName() || this.getUsername() || '');
  public displayName$ = this.displayNameSubject.asObservable();

  private readonly ACCESS_TOKEN_KEY = 'adminAccessToken';
  private readonly REFRESH_TOKEN_KEY = 'adminRefreshToken';
  private readonly USER_KEY = 'adminUser';
  private readonly FIRST_NAME_KEY = 'adminFirstName';
  private readonly ROLE_KEY = 'adminRole';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.access_token) {
            this.storeTokens(response);
            this.isAuthenticatedSubject.next(true);
          }
        })
      );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refresh_token: refreshToken })
      .pipe(
        tap((response: AuthResponse) => {
          if (response.success && response.access_token) {
            this.storeTokens(response);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {})
      .pipe(
        tap(() => {
          this.clearAuth();
        })
      );
  }

  private storeTokens(response: AuthResponse): void {
    if (response.access_token) {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, response.access_token);
    }
    if (response.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refresh_token);
    }
    if (response.username) {
      localStorage.setItem(this.USER_KEY, response.username);
    }
    if (response.first_name) {
      localStorage.setItem(this.FIRST_NAME_KEY, response.first_name);
    }
    if (response.role) {
      localStorage.setItem(this.ROLE_KEY, response.role);
    }
    this.displayNameSubject.next(this.getFirstName() || this.getUsername() || '');
  }

  clearAuth(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.FIRST_NAME_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    // Also remove legacy token key if exists
    localStorage.removeItem('adminToken');
    this.isAuthenticatedSubject.next(false);
    this.displayNameSubject.next('');
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getToken(): string | null {
    // Backward compatibility
    return this.getAccessToken();
  }

  getUsername(): string | null {
    return localStorage.getItem(this.USER_KEY);
  }

  getFirstName(): string | null {
    return localStorage.getItem(this.FIRST_NAME_KEY);
  }

  getRole(): string | null {
    return localStorage.getItem(this.ROLE_KEY);
  }

  hasToken(): boolean {
    return !!this.getAccessToken();
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  updateStoredProfile(firstName: string, username: string): void {
    localStorage.setItem(this.FIRST_NAME_KEY, firstName);
    localStorage.setItem(this.USER_KEY, username);
    this.displayNameSubject.next(firstName || username);
  }
}
