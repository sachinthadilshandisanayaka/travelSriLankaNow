import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../services/language.service';

@Pipe({ name: 'translate', pure: false })
export class TranslatePipe implements PipeTransform, OnDestroy {
  private sub: Subscription;
  private lastKey = '';
  private lastValue = '';

  constructor(private langService: LanguageService, private cd: ChangeDetectorRef) {
    this.sub = this.langService.currentLang$.subscribe(() => {
      this.lastKey = '';
      this.cd.markForCheck();
    });
  }

  transform(key: string): string {
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastValue = this.langService.translate(key);
    }
    return this.lastValue || key;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
