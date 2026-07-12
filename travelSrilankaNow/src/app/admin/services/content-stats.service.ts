import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ContentStatsService {
  private refresh$ = new Subject<void>();

  /** Emit after any content item is created or deleted. */
  get changes$(): Observable<void> {
    return this.refresh$.asObservable();
  }

  notify(): void {
    this.refresh$.next();
  }
}
