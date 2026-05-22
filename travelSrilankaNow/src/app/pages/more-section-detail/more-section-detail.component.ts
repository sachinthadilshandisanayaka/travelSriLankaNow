import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { MoreSectionService } from '../../services/more-section.service';
import { MoreSection, MoreSectionItem } from '../../models/more-section.model';
import { LanguageService } from '../../services/language.service';
import { ContentTranslationService } from '../../services/content-translation.service';

@Component({
  selector: 'app-more-section-detail',
  templateUrl: './more-section-detail.component.html',
  styleUrls: ['./more-section-detail.component.scss']
})
export class MoreSectionDetailComponent implements OnInit, OnDestroy {
  section: MoreSection | null = null;
  isLoading = true;
  isTranslating = false;
  error = false;

  // Per-item translated display maps (keyed by item id)
  displayTitles: { [id: number]: string } = {};
  displayShortDescs: { [id: number]: string } = {};
  displayExcerpts: { [id: number]: string } = {};

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
      const slug = params['slug'];
      if (slug) this.loadSection(slug);
    });

    this.langSub = this.langService.currentLang$.subscribe(() => {
      if (this.section?.items?.length) this.translateItems();
    });
  }

  ngOnDestroy(): void {
    this.langSub?.unsubscribe();
  }

  private loadSection(slug: string): void {
    this.isLoading = true;
    this.error = false;
    this.moreSectionService.getSectionBySlug(slug).subscribe({
      next: (section) => {
        this.section = section;
        this.initDisplayFields();
        this.translateItems();
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
    });
  }

  private initDisplayFields(): void {
    (this.section?.items || []).forEach(item => {
      if (item.id == null) return;
      this.displayTitles[item.id] = item.title || '';
      this.displayShortDescs[item.id] = item.shortDescription || '';
      this.displayExcerpts[item.id] = this.getArticleExcerpt(item);
    });
  }

  private translateItems(): void {
    const lang = this.langService.currentLang;
    if (lang === 'en') {
      this.initDisplayFields();
      return;
    }
    const items = this.section?.items || [];
    if (!items.length) return;

    this.isTranslating = true;
    const jobs = items
      .filter(i => i.id != null)
      .map(item =>
        forkJoin({
          title: this.contentTranslation.text(item.title || '', lang),
          short: this.contentTranslation.text(item.shortDescription || '', lang),
          excerpt: this.contentTranslation.text(this.getArticleExcerpt(item), lang)
        }).pipe().subscribe({
          next: ({ title, short, excerpt }) => {
            this.displayTitles[item.id!] = title || item.title || '';
            this.displayShortDescs[item.id!] = short || item.shortDescription || '';
            this.displayExcerpts[item.id!] = excerpt || this.getArticleExcerpt(item);
          }
        })
      );

    // Mark translating done after a short delay (all forkJoins are independent)
    setTimeout(() => { this.isTranslating = false; }, items.length * 400 + 500);
  }

  hasDetails(item: any): boolean {
    if (!item.additionalDetails) return false;
    return Object.keys(item.additionalDetails).some(key => this.isNonEmpty(item.additionalDetails[key]));
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
      if (value.from !== undefined && value.to !== undefined) return `${value.from || '?'} - ${value.to || '?'}`;
      if (value.min !== undefined && value.max !== undefined) return `${value.min ?? '?'} - ${value.max ?? '?'}`;
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

  navigateToItem(item: any, event: MouseEvent): void {
    // Use slug for SEO-friendly URL; fall back to numeric ID for items without a slug
    const itemParam = item.slug ?? item.id;
    this.router.navigate(['/more', this.section!.slug, itemParam]);
  }

  getArticleExcerpt(item: any): string {
    if (!item.articleContent) return '';
    const text = item.articleContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 160 ? text.substring(0, 160) + '...' : text;
  }
}
