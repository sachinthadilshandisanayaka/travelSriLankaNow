import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MoreSectionService } from '../../services/more-section.service';
import { MoreSection, MoreSectionItem } from '../../models/more-section.model';

@Component({
  selector: 'app-more-section-item-detail',
  templateUrl: './more-section-item-detail.component.html',
  styleUrls: ['./more-section-item-detail.component.scss']
})
export class MoreSectionItemDetailComponent implements OnInit {
  section: MoreSection | null = null;
  item: MoreSectionItem | null = null;
  isLoading = true;
  error = false;
  slug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moreSectionService: MoreSectionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.slug = params['slug'];
      const itemId = +params['id'];
      if (this.slug && itemId) {
        this.loadItem(this.slug, itemId);
      }
    });
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
        }
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
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
      if (value.from !== undefined && value.to !== undefined) {
        return `${value.from || '?'} – ${value.to || '?'}`;
      }
      if (value.min !== undefined && value.max !== undefined) {
        return `${value.min ?? '?'} – ${value.max ?? '?'}`;
      }
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
