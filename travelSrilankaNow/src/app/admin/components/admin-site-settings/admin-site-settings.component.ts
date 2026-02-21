import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminApiService } from '../../services/admin-api.service';

export interface SiteSetting {
  id?: number;
  category: string;
  key: string;
  label: string;
  value: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: 'app-admin-site-settings',
  templateUrl: './admin-site-settings.component.html',
  styleUrls: ['./admin-site-settings.component.scss']
})
export class AdminSiteSettingsComponent implements OnInit {
  settings: SiteSetting[] = [];
  isLoading = false;
  showModal = false;
  isEditMode = false;
  settingForm!: FormGroup;
  selectedSettingId: number | null = null;

  showDeleteConfirm = false;
  deleteTargetId: number | null = null;

  successMessage = '';
  errorMessage = '';

  categories = [
    { value: 'CONTACT_EMAIL', label: 'Contact Email' },
    { value: 'CONTACT_PHONE', label: 'Contact Phone' },
    { value: 'CONTACT_ADDRESS', label: 'Contact Address' },
    { value: 'SOCIAL_MEDIA', label: 'Social Media' },
    { value: 'BUSINESS_HOURS', label: 'Business Hours' },
    { value: 'GENERAL', label: 'General' }
  ];

  iconOptions = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'location', label: 'Location' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'clock', label: 'Clock' },
    { value: 'globe', label: 'Globe' },
    { value: 'info', label: 'Info' }
  ];

  constructor(
    private adminApiService: AdminApiService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  initForm(): void {
    this.settingForm = this.fb.group({
      category: ['GENERAL', Validators.required],
      key: ['', [Validators.required, Validators.pattern(/^[a-z_]+$/)]],
      label: ['', Validators.required],
      value: ['', Validators.required],
      icon: [''],
      sortOrder: [1, [Validators.required, Validators.min(1)]],
      isActive: [true]
    });
  }

  loadSettings(): void {
    this.isLoading = true;
    this.adminApiService.getSiteSettings().subscribe({
      next: (data) => {
        this.settings = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load settings';
        this.isLoading = false;
        console.error('Error loading settings:', error);
      }
    });
  }

  openAddModal(): void {
    this.isEditMode = false;
    this.selectedSettingId = null;
    this.settingForm.reset({
      category: 'GENERAL',
      key: '',
      label: '',
      value: '',
      icon: '',
      sortOrder: 1,
      isActive: true
    });
    this.settingForm.get('key')?.enable();
    this.showModal = true;
  }

  openEditModal(setting: SiteSetting): void {
    this.isEditMode = true;
    this.selectedSettingId = setting.id || null;
    this.settingForm.patchValue({
      category: setting.category,
      key: setting.key,
      label: setting.label,
      value: setting.value,
      icon: setting.icon || '',
      sortOrder: setting.sortOrder,
      isActive: setting.isActive
    });
    this.settingForm.get('key')?.disable();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.settingForm.reset();
  }

  saveSetting(): void {
    if (this.settingForm.invalid) return;

    this.isLoading = true;
    const formValue = this.settingForm.getRawValue();

    const setting: SiteSetting = {
      ...formValue,
      id: this.selectedSettingId
    };

    const request = this.isEditMode && this.selectedSettingId
      ? this.adminApiService.updateSiteSetting(this.selectedSettingId, setting)
      : this.adminApiService.createSiteSetting(setting);

    request.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Setting updated successfully' : 'Setting created successfully';
        this.closeModal();
        this.loadSettings();
        this.clearMessageAfterDelay();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to save setting';
        this.isLoading = false;
        this.clearMessageAfterDelay();
      }
    });
  }

  confirmDelete(id: number): void {
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteTargetId = null;
  }

  deleteSetting(): void {
    if (!this.deleteTargetId) return;

    this.isLoading = true;
    this.adminApiService.deleteSiteSetting(this.deleteTargetId).subscribe({
      next: () => {
        this.successMessage = 'Setting deleted successfully';
        this.showDeleteConfirm = false;
        this.deleteTargetId = null;
        this.loadSettings();
        this.clearMessageAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Failed to delete setting';
        this.isLoading = false;
        this.clearMessageAfterDelay();
      }
    });
  }

  toggleStatus(setting: SiteSetting): void {
    if (!setting.id) return;

    this.adminApiService.toggleSiteSettingStatus(setting.id).subscribe({
      next: (updatedSetting) => {
        const index = this.settings.findIndex(s => s.id === setting.id);
        if (index !== -1) {
          this.settings[index] = updatedSetting;
        }
        this.successMessage = `Setting ${updatedSetting.isActive ? 'activated' : 'deactivated'} successfully`;
        this.clearMessageAfterDelay();
      },
      error: (error) => {
        this.errorMessage = 'Failed to toggle setting status';
        this.clearMessageAfterDelay();
      }
    });
  }

  getCategoryLabel(category: string): string {
    const cat = this.categories.find(c => c.value === category);
    return cat ? cat.label : category;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'CONTACT_EMAIL': 'admin-badge--blue',
      'CONTACT_PHONE': 'admin-badge--green',
      'CONTACT_ADDRESS': 'admin-badge--purple',
      'SOCIAL_MEDIA': 'admin-badge--pink',
      'BUSINESS_HOURS': 'admin-badge--orange',
      'GENERAL': 'admin-badge--gray'
    };
    return colors[category] || 'admin-badge--gray';
  }

  getGroupedSettings(): { category: string; label: string; settings: SiteSetting[] }[] {
    const grouped: { [key: string]: SiteSetting[] } = {};

    this.settings.forEach(setting => {
      if (!grouped[setting.category]) {
        grouped[setting.category] = [];
      }
      grouped[setting.category].push(setting);
    });

    return Object.keys(grouped).map(category => ({
      category,
      label: this.getCategoryLabel(category),
      settings: grouped[category].sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  }

  private clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = '';
      this.errorMessage = '';
    }, 3000);
  }
}
