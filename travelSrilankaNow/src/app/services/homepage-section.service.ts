import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HomepageSection } from '../models/homepage-section.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HomepageSectionService {
  private apiUrl = `${environment.apiUrl}/homepage-sections`;

  constructor(private http: HttpClient) { }

  getActiveSections(): Observable<HomepageSection[]> {
    return this.http.get<HomepageSection[]>(this.apiUrl);
  }
}
