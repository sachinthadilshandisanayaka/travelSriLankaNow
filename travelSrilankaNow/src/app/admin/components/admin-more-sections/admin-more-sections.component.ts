import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { FieldDefinition } from '../../../models/more-section.model';

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
  sectionForm: any = { name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, active: true, additionalFieldDefinitions: [] };

  // Field definitions
  fieldTypes: { value: string; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'date_range', label: 'Date Range' },
    { value: 'number_range', label: 'Number Range' },
    { value: 'select', label: 'Single Select' },
    { value: 'multi_select', label: 'Multi Select' }
  ];

  // Items view
  selectedSection: any = null;
  items: any[] = [];
  isLoadingItems = false;

  // Item modal
  showItemModal = false;
  isEditingItem = false;
  editingItemId: number | null = null;
  itemForm: any = { title: '', shortDescription: '', description: '', imageUrl: '', link: '', displayOrder: 0, active: true, additionalDetails: {} };

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
    this.sectionForm = { name: '', slug: '', description: '', imageUrl: '', displayOrder: 0, active: true, additionalFieldDefinitions: [] };
    this.isEditingSection = false;
    this.editingSectionId = null;
    this.showSectionModal = true;
  }

  openEditSection(section: any): void {
    this.sectionForm = { ...section, additionalFieldDefinitions: section.additionalFieldDefinitions ? [...section.additionalFieldDefinitions.map((f: any) => ({ ...f, options: f.options ? [...f.options] : [] }))] : [] };
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
    this.itemForm = { title: '', shortDescription: '', description: '', imageUrl: '', link: '', displayOrder: 0, active: true, additionalDetails: {} };
    // Pre-populate additionalDetails keys from section field definitions
    if (this.selectedSection?.additionalFieldDefinitions) {
      for (const field of this.selectedSection.additionalFieldDefinitions) {
        if (field.type === 'date_range') {
          this.itemForm.additionalDetails[field.key] = { from: '', to: '' };
        } else if (field.type === 'number_range') {
          this.itemForm.additionalDetails[field.key] = { min: null, max: null };
        } else if (field.type === 'multi_select') {
          this.itemForm.additionalDetails[field.key] = [];
        } else {
          this.itemForm.additionalDetails[field.key] = null;
        }
      }
    }
    this.isEditingItem = false;
    this.editingItemId = null;
    this.showItemModal = true;
  }

  openEditItem(item: any): void {
    this.itemForm = { ...item, additionalDetails: item.additionalDetails ? { ...item.additionalDetails } : {} };
    // Ensure all field definitions have corresponding entries
    if (this.selectedSection?.additionalFieldDefinitions) {
      for (const field of this.selectedSection.additionalFieldDefinitions) {
        if (this.itemForm.additionalDetails[field.key] === undefined) {
          if (field.type === 'date_range') {
            this.itemForm.additionalDetails[field.key] = { from: '', to: '' };
          } else if (field.type === 'number_range') {
            this.itemForm.additionalDetails[field.key] = { min: null, max: null };
          } else if (field.type === 'multi_select') {
            this.itemForm.additionalDetails[field.key] = [];
          } else {
            this.itemForm.additionalDetails[field.key] = null;
          }
        }
      }
    }
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

  // Field Definition Management
  addFieldDefinition(): void {
    if (!this.sectionForm.additionalFieldDefinitions) {
      this.sectionForm.additionalFieldDefinitions = [];
    }
    this.sectionForm.additionalFieldDefinitions.push({
      key: '',
      label: '',
      type: 'text',
      required: false,
      options: []
    });
  }

  removeFieldDefinition(index: number): void {
    this.sectionForm.additionalFieldDefinitions.splice(index, 1);
  }

  onFieldLabelChange(field: any): void {
    field.key = field.label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
  }

  onFieldTypeChange(field: any): void {
    if (field.type !== 'select' && field.type !== 'multi_select') {
      field.options = [];
    }
  }

  getOptionsString(field: any): string {
    return field.options ? field.options.join(', ') : '';
  }

  setOptionsFromString(field: any, value: string): void {
    field.options = value.split(',').map((o: string) => o.trim()).filter((o: string) => o);
  }

  hasSelectType(field: any): boolean {
    return field.type === 'select' || field.type === 'multi_select';
  }

  // Multi-select helpers for item form
  isOptionSelected(fieldKey: string, option: string): boolean {
    const val = this.itemForm.additionalDetails?.[fieldKey];
    return Array.isArray(val) && val.includes(option);
  }

  toggleMultiSelectOption(fieldKey: string, option: string): void {
    if (!this.itemForm.additionalDetails) this.itemForm.additionalDetails = {};
    if (!Array.isArray(this.itemForm.additionalDetails[fieldKey])) {
      this.itemForm.additionalDetails[fieldKey] = [];
    }
    const arr = this.itemForm.additionalDetails[fieldKey];
    const idx = arr.indexOf(option);
    if (idx > -1) {
      arr.splice(idx, 1);
    } else {
      arr.push(option);
    }
  }

  // Get field definitions from the selected section for item form
  getFieldDefinitions(): any[] {
    return this.selectedSection?.additionalFieldDefinitions || [];
  }

  // Check if an item has any additional details to display
  hasAdditionalDetails(item: any): boolean {
    if (!item.additionalDetails) return false;
    return Object.keys(item.additionalDetails).some(key => {
      const val = item.additionalDetails[key];
      if (val === null || val === undefined || val === '') return false;
      if (typeof val === 'object' && !Array.isArray(val)) {
        return Object.values(val).some(v => v !== null && v !== undefined && v !== '');
      }
      if (Array.isArray(val)) return val.length > 0;
      return true;
    });
  }

  // Format additional detail value for display on card
  formatDetailValue(value: any, fieldKey: string): string {
    if (value === null || value === undefined || value === '') return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') {
      if (value.from !== undefined && value.to !== undefined) {
        return `${value.from || '?'} - ${value.to || '?'}`;
      }
      if (value.min !== undefined && value.max !== undefined) {
        return `${value.min ?? '?'} - ${value.max ?? '?'}`;
      }
    }
    return String(value);
  }

  // Get label for a field key from section definitions
  getFieldLabel(fieldKey: string): string {
    const defs = this.selectedSection?.additionalFieldDefinitions || [];
    const def = defs.find((d: any) => d.key === fieldKey);
    return def?.label || fieldKey;
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
