import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-more-sections',
  templateUrl: './admin-more-sections.component.html',
  styleUrls: ['./admin-more-sections.component.scss']
})
export class AdminMoreSectionsComponent implements OnInit {
  // Sections
  sections: any[] = [];
  isLoading = true;

  // Section modal
  showSectionModal = false;
  isEditingSection = false;
  editingSectionId: number | null = null;
  sectionForm: any = { name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, active: true };

  // Items view
  selectedSection: any = null;
  items: any[] = [];
  isLoadingItems = false;

  // Item modal
  showItemModal = false;
  isEditingItem = false;
  editingItemId: number | null = null;
  itemForm: any = { title: '', shortDescription: '', description: '', imageUrl: '', link: '', displayOrder: 0, active: true };

  // Delete confirmation
  showDeleteConfirm = false;
  deleteTarget: { type: 'section' | 'item'; id: number; name: string } | null = null;

  // Messages
  successMessage = '';
  errorMessage = '';

  constructor(private adminApi: AdminApiService) {}

  // Image upload handlers
  onSectionImageUploaded(url: string): void {
    this.sectionForm.imageUrl = url;
  }

  onItemImageUploaded(url: string): void {
    this.itemForm.imageUrl = url;
  }

  getItemCount(section: any): number {
    return section.items?.length || 0;
  }

  private hideMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.isLoading = true;
    this.adminApi.getMoreSections(0, 100).subscribe({
      next: (response) => {
        this.sections = response.content;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load sections';
        this.isLoading = false;
      }
    });
  }

  generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  onSectionNameChange(): void {
    if (!this.isEditingSection) {
      this.sectionForm.slug = this.generateSlug(this.sectionForm.name);
    }
  }

  openAddSection(): void {
    this.sectionForm = { name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, active: true };
    this.isEditingSection = false;
    this.editingSectionId = null;
    this.showSectionModal = true;
  }

  openEditSection(section: any): void {
    this.sectionForm = { ...section };
    this.isEditingSection = true;
    this.editingSectionId = section.id;
    this.showSectionModal = true;
  }

  closeSectionModal(): void {
    this.showSectionModal = false;
  }

  saveSection(): void {
    if (!this.sectionForm.name || !this.sectionForm.slug) return;

    const obs = this.isEditingSection
      ? this.adminApi.updateMoreSection(this.editingSectionId!, this.sectionForm)
      : this.adminApi.createMoreSection(this.sectionForm);

    obs.subscribe({
      next: () => {
        this.successMessage = this.isEditingSection ? 'Section updated!' : 'Section created!';
        this.hideMessageAfterDelay();
        this.closeSectionModal();
        this.loadSections();
      },
      error: () => {
        this.errorMessage = 'Failed to save section';
        this.hideMessageAfterDelay();
      }
    });
  }

  toggleSectionActive(section: any): void {
    this.adminApi.toggleMoreSectionActive(section.id).subscribe({
      next: () => this.loadSections(),
      error: () => { this.errorMessage = 'Failed to toggle status'; this.hideMessageAfterDelay(); }
    });
  }

  // Items management
  selectSection(section: any): void {
    this.selectedSection = section;
    this.loadItems();
  }

  backToSections(): void {
    this.selectedSection = null;
    this.items = [];
  }

  loadItems(): void {
    if (!this.selectedSection) return;
    this.isLoadingItems = true;
    this.adminApi.getMoreSectionItems(this.selectedSection.id).subscribe({
      next: (items) => {
        this.items = items;
        this.isLoadingItems = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load items';
        this.isLoadingItems = false;
      }
    });
  }

  openAddItem(): void {
    this.itemForm = { title: '', shortDescription: '', description: '', imageUrl: '', link: '', displayOrder: 0, active: true };
    this.isEditingItem = false;
    this.editingItemId = null;
    this.showItemModal = true;
  }

  openEditItem(item: any): void {
    this.itemForm = { ...item };
    this.isEditingItem = true;
    this.editingItemId = item.id;
    this.showItemModal = true;
  }

  closeItemModal(): void {
    this.showItemModal = false;
  }

  saveItem(): void {
    if (!this.itemForm.title) return;

    const obs = this.isEditingItem
      ? this.adminApi.updateMoreSectionItem(this.editingItemId!, this.itemForm)
      : this.adminApi.createMoreSectionItem(this.selectedSection.id, this.itemForm);

    obs.subscribe({
      next: () => {
        this.successMessage = this.isEditingItem ? 'Item updated!' : 'Item created!';
        this.hideMessageAfterDelay();
        this.closeItemModal();
        this.loadItems();
      },
      error: () => {
        this.errorMessage = 'Failed to save item';
        this.hideMessageAfterDelay();
      }
    });
  }

  toggleItemActive(item: any): void {
    this.adminApi.toggleMoreSectionItemActive(item.id).subscribe({
      next: () => this.loadItems(),
      error: () => { this.errorMessage = 'Failed to toggle status'; this.hideMessageAfterDelay(); }
    });
  }

  // Delete
  confirmDelete(type: 'section' | 'item', id: number, name: string): void {
    this.deleteTarget = { type, id, name };
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTarget = null;
  }

  executeDelete(): void {
    if (!this.deleteTarget) return;

    const obs = this.deleteTarget.type === 'section'
      ? this.adminApi.deleteMoreSection(this.deleteTarget.id)
      : this.adminApi.deleteMoreSectionItem(this.deleteTarget.id);

    obs.subscribe({
      next: () => {
        this.successMessage = `${this.deleteTarget!.type === 'section' ? 'Section' : 'Item'} deleted!`;
        this.hideMessageAfterDelay();
        this.showDeleteConfirm = false;
        this.deleteTarget = null;
        if (this.selectedSection) {
          this.loadItems();
        } else {
          this.loadSections();
        }
      },
      error: () => {
        this.errorMessage = 'Failed to delete';
        this.hideMessageAfterDelay();
        this.showDeleteConfirm = false;
      }
    });
  }
}
