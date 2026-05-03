import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MoreSectionService } from '../../services/more-section.service';
import { MoreSection, MoreSectionItem } from '../../models/more-section.model';
import { LanguageService } from '../../services/language.service';
import { ContentTranslationService } from '../../services/content-translation.service';

@Component({
  selector: 'app-more-section-item-detail',
  templateUrl: './more-section-item-detail.component.html',
  styleUrls: ['./more-section-item-detail.component.scss']
})
export class MoreSectionItemDetailComponent implements OnInit, OnDestroy {
  section: MoreSection | null = null;
  item: MoreSectionItem | null = null;
  isLoading = true;
  isTranslating = false;
  error = false;
  slug = '';

  // Translated display fields
  displayTitle = '';
  displayShortDescription = '';
  displayDescription = '';
  displayArticleContent = '';

  private langSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moreSectionService: MoreSectionService,
    private langService: LanguageService,
    private contentTranslation: ContentTranslationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      const itemId = +params['id'];
      if (this.slug && itemId) {
        this.loadItem(this.slug, itemId);
      }
    });

    this.langSub = this.langService.currentLang$.subscribe(() => {
      if (this.item) this.applyTranslations();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadItem(slug: string, itemId: number): void {
    this.isLoading = true;
    this.error = false;
    this.moreSectionService.getSectionBySlug(slug).subscribe({
      next: (section) => {
        this.section = section;
        this.item = section.items?.find(i => i.id === itemId) || null;
        if (!this.item) {
          this.error = true;
        } else {
          this.applyTranslations();
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  private applyTranslations(): void {
    if (!this.item) return;
    const lang = this.langService.currentLang;

    // Set originals immediately so page isn't blank
    this.displayTitle = this.item.title || '';
    this.displayShortDescription = this.item.shortDescription || '';
    this.displayDescription = this.item.description || '';
    this.displayArticleContent = this.item.articleContent || '';

    if (lang === 'en') return;

    this.isTranslating = true;

    const title$ = this.contentTranslation.text(this.item.title || '', lang);
    const short$ = this.contentTranslation.text(this.item.shortDescription || '', lang);
    const desc$ = this.contentTranslation.text(this.item.description || '', lang);
    const article$ = this.item.articleContent
      ? this.contentTranslation.html(this.item.articleContent, lang)
      : of('');

    forkJoin({ title: title$, short: short$, desc: desc$, article: article$ }).subscribe({
      next: ({ title, short, desc, article }) => {
        this.displayTitle = title || this.item!.title || '';
        this.displayShortDescription = short || this.item!.shortDescription || '';
        this.displayDescription = desc || this.item!.description || '';
        this.displayArticleContent = article || this.item!.articleContent || '';
        this.isTranslating = false;
      },
      error: () => { this.isTranslating = false; }
    });
  }

  goBack(): void {
    this.router.navigate(['/more', this.slug]);
  }

  hasDetails(item: MoreSectionItem): boolean {
    if (!item.additionalDetails) return false;
    return Object.keys(item.additionalDetails).some(key => this.isNonEmpty(item.additionalDetails![key]));
  }

  isNonEmpty(value: any): boolean {
    if (value === null || value === undefined || value === '') return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') {
      return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
    }
    return true;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.from !== undefined && value.to !== undefined) return `${value.from || '?'} – ${value.to || '?'}`;
      if (value.min !== undefined && value.max !== undefined) return `${value.min ?? '?'} – ${value.max ?? '?'}`;
    }
    return String(value);
  }

  getFieldLabel(key: string): string {
    const defs = this.section?.additionalFieldDefinitions || [];
    const def = defs.find(d => d.key === key);
    return def?.label || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  isLinkField(key: string): boolean {
    const defs = this.section?.additionalFieldDefinitions || [];
    const def = defs.find(d => d.key === key);
    return def?.type === 'link';
  }
}
