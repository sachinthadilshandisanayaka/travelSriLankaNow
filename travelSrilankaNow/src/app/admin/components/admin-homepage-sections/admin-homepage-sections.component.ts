import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

interface HomepageSection {
  id?: number;
  sectionType: string;
  title: string;
  subtitle?: string;
  displayOrder: number;
  isActive: boolean;
  config?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SectionConfig {
  autoPlay?: boolean;
  displayDuration?: number;
  itemsCount?: number;
  showViewAll?: boolean;
}

@Component({
  selector: 'app-admin-homepage-sections',
  templateUrl: './admin-homepage-sections.component.html',
  styleUrls: ['./admin-homepage-sections.component.scss']
})
export class AdminHomepageSectionsComponent implements OnInit {
  sections: HomepageSection[] = [];
  isLoading = false;
  isSaving = false;
  showEditModal = false;
  editForm: FormGroup;
  editingSection: HomepageSection | null = null;

  successMessage = '';
  errorMessage = '';

  hasOrderChanged = false;

  sectionTypeLabels: Record<string, string> = {
    'HERO_SLIDER': 'Hero Slider',
    'FEATURED_LOCATIONS': 'Featured Locations',
    'UPCOMING_EVENTS': 'Upcoming Events',
    'PLACES': 'Where to Stay',
    'SOCIAL_MEDIA': 'Social Media'
  };

  sectionTypeIcons: Record<string, string> = {
    'HERO_SLIDER': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    'FEATURED_LOCATIONS': 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z',
    'UPCOMING_EVENTS': 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    'PLACES': 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    'SOCIAL_MEDIA': 'M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0h4a1 1 0 011 1v1a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4'
  };

  constructor(
    private apiService: AdminApiService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      id: [null],
      title: ['', Validators.required],
      subtitle: [''],
      isActive: [true],
      itemsCount: [6, [Validators.min(1), Validators.max(20)]],
      showViewAll: [true]
    });
  }

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoading = true;
    this.apiService.getHomepageSections().subscribe({
      next: (sections: HomepageSection[]) => {
        this.sections = sections;
        this.isLoading = false;
        this.hasOrderChanged = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load homepage sections';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  getSectionLabel(sectionType: string): string {
    return this.sectionTypeLabels[sectionType] || sectionType;
  }

  getSectionIcon(sectionType: string): string {
    return this.sectionTypeIcons[sectionType] || '';
  }

  parseConfig(configStr?: string): SectionConfig {
    if (!configStr) return {};
    try {
      return JSON.parse(configStr);
    } catch {
      return {};
    }
  }

  openEditModal(section: HomepageSection): void {
    this.editingSection = section;
    const config = this.parseConfig(section.config);
    this.editForm.patchValue({
      id: section.id,
      title: section.title,
      subtitle: section.subtitle || '',
      isActive: section.isActive,
      itemsCount: config.itemsCount || 6,
      showViewAll: config.showViewAll !== undefined ? config.showViewAll : true
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingSection = null;
  }

  saveSection(): void {
    if (this.editForm.invalid || !this.editingSection) return;

    const formValue = this.editForm.value;
    const existingConfig = this.parseConfig(this.editingSection.config);
    const updatedConfig: SectionConfig = {
      ...existingConfig,
      itemsCount: formValue.itemsCount,
      showViewAll: formValue.showViewAll
    };

    const updateData: HomepageSection = {
      ...this.editingSection,
      title: formValue.title,
      subtitle: formValue.subtitle,
      isActive: formValue.isActive,
      config: JSON.stringify(updatedConfig)
    };

    this.isLoading = true;
    this.apiService.updateHomepageSection(this.editingSection.id!, updateData).subscribe({
      next: () => {
        this.successMessage = 'Section updated successfully!';
        this.closeEditModal();
        this.loadSections();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to update section';
        this.isLoading = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  toggleActive(section: HomepageSection): void {
    if (!section.id) return;

    this.apiService.toggleHomepageSectionActive(section.id).subscribe({
      next: (updated) => {
        const index = this.sections.findIndex(s => s.id === section.id);
        if (index !== -1) {
          this.sections[index] = updated;
        }
        this.successMessage = `Section ${updated.isActive ? 'activated' : 'deactivated'} successfully!`;
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to toggle section status';
        this.hideMessageAfterDelay();
      }
    });
  }

  moveUp(index: number): void {
    if (index > 0) {
      const temp = this.sections[index];
      this.sections[index] = this.sections[index - 1];
      this.sections[index - 1] = temp;
      this.hasOrderChanged = true;
    }
  }

  moveDown(index: number): void {
    if (index < this.sections.length - 1) {
      const temp = this.sections[index];
      this.sections[index] = this.sections[index + 1];
      this.sections[index + 1] = temp;
      this.hasOrderChanged = true;
    }
  }

  saveOrder(): void {
    const sectionIds = this.sections.map(s => s.id!);
    this.isSaving = true;

    this.apiService.reorderHomepageSections(sectionIds).subscribe({
      next: () => {
        this.successMessage = 'Section order saved successfully!';
        this.isSaving = false;
        this.hasOrderChanged = false;
        this.loadSections();
        this.hideMessageAfterDelay();
      },
      error: () => {
        this.errorMessage = 'Failed to save section order';
        this.isSaving = false;
        this.hideMessageAfterDelay();
      }
    });
  }

  // Drag and Drop
  draggedIndex: number | null = null;
  dragOverIndex = -1;

  onDragStart(event: DragEvent, index: number): void {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverIndex = index;
  }

  onDragLeave(): void {
    this.dragOverIndex = -1;
  }

  onDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    this.dragOverIndex = -1;

    if (this.draggedIndex === null || this.draggedIndex === targetIndex) return;

    const [removed] = this.sections.splice(this.draggedIndex, 1);
    this.sections.splice(targetIndex, 0, removed);
    this.hasOrderChanged = true;
    this.draggedIndex = null;
  }

  onDragEnd(): void {
    this.draggedIndex = null;
    this.dragOverIndex = -1;
  }

  hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}
