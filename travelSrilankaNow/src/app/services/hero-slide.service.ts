import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HeroSlide } from '../models/hero-slide.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HeroSlideService {
  private apiUrl = `${environment.apiUrl}/hero-slides`;

  constructor(private http: HttpClient) { }

  getActiveHeroSlides(): Observable<HeroSlide[]> {
    return this.http.get<HeroSlide[]>(this.apiUrl);
  }

  getHeroSlideById(id: number): Observable<HeroSlide> {
    return this.http.get<HeroSlide>(`${this.apiUrl}/${id}`);
  }
}
