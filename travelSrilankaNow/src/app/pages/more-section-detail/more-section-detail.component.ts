import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MoreSectionService } from '../../services/more-section.service';
import { MoreSection } from '../../models/more-section.model';

@Component({
  selector: 'app-more-section-detail',
  templateUrl: './more-section-detail.component.html',
  styleUrls: ['./more-section-detail.component.scss']
})
export class MoreSectionDetailComponent implements OnInit {
  section: MoreSection | null = null;
  isLoading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private moreSectionService: MoreSectionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadSection(slug);
      }
    });
  }

  private loadSection(slug: string): void {
    this.isLoading = true;
    this.error = false;
    this.moreSectionService.getSectionBySlug(slug).subscribe({
      next: (section) => {
        this.section = section;
        this.isLoading = false;
      },
      error: () => {
        this.error = true;
        this.isLoading = false;
      }
    });
  }
}
