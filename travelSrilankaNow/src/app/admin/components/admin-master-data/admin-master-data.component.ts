import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { MasterDataService } from '../../../services/master-data.service';

interface MasterData {
  id?: number;
  type: string;
  code: string;
  displayName: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  color?: string;
  icon?: string;
}

@Component({
  selector: 'app-admin-master-data',
  templateUrl: './admin-master-data.component.html',
  styleUrls: ['./admin-master-data.component.scss']
})
export class AdminMasterDataComponent implements OnInit {
  masterDataList: MasterData[] = [];
  filteredList: MasterData[] = [];
  types: string[] = [];
  selectedType: string = '';
  isLoading = false;
  errorMessage = '';

  // Add/Edit modal state
  showModal = false;
  isEditing = false;
  currentItem: MasterData = this.getEmptyItem();

  // Delete confirmation modal state
  showDeleteModal = false;
  itemToDelete: MasterData | null = null;

  // Per-item toggle loading state
  togglingIds = new Set<number>();
  successMessage = '';

  // Type display names
  typeDisplayNames: { [key: string]: string } = {
    'EVENT_CATEGORY': 'Event Categories',
    'LOCATION_CATEGORY': 'Location Categories',
    'PLACE_TYPE': 'Place Types',
    'REGION': 'Regions',
    'PRICE_RANGE': 'Price Ranges',
    'GALLERY_CATEGORY': 'Gallery Categories',
    'GALLERY_TYPE': 'Gallery Types'
  };

  constructor(
    private adminApiService: AdminApiService,
    private masterDataService: MasterDataService
  ) {}

  ngOnInit(): void {
    this.loadTypes();
    this.loadData();
  }

  loadTypes(): void {
    this.adminApiService.getMasterDataTypes().subscribe({
      next: (types) => {
        this.types = types;
      },
      error: (error) => {
        console.error('Error loading types:', error);
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminApiService.getMasterData().subscribe({
      next: (data) => {
        this.masterDataList = data;
        this.filterByType();
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load master data';
        this.isLoading = false;
        console.error('Error loading master data:', error);
      }
    });
  }

  filterByType(): void {
    if (this.selectedType) {
      this.filteredList = this.masterDataList.filter(item => item.type === this.selectedType);
    } else {
      this.filteredList = [...this.masterDataList];
    }
  }

  onTypeChange(): void {
    this.filterByType();
  }

  getEmptyItem(): MasterData {
    return {
      type: this.selectedType || 'EVENT_CATEGORY',
      code: '',
      displayName: '',
      description: '',
      sortOrder: 0,
      isActive: true,
      color: '#3B82F6',
      icon: ''
    };
  }

  openAddModal(): void {
    this.isEditing = false;
    this.currentItem = this.getEmptyItem();
    this.showModal = true;
  }

  openEditModal(item: MasterData): void {
    this.isEditing = true;
    this.currentItem = { ...item };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentItem = this.getEmptyItem();
  }

  saveItem(): void {
    if (!this.currentItem.code || !this.currentItem.displayName || !this.currentItem.type) {
      return;
    }

    this.isLoading = true;

    if (this.isEditing && this.currentItem.id) {
      this.adminApiService.updateMasterData(this.currentItem.id, this.currentItem).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          this.masterDataService.clearCache(this.currentItem.type);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to update item';
          this.isLoading = false;
        }
      });
    } else {
      this.adminApiService.createMasterData(this.currentItem).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
          this.masterDataService.clearCache(this.currentItem.type);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to create item';
          this.isLoading = false;
        }
      });
    }
  }

  deleteItem(item: MasterData): void {
    if (!item.id) return;
    this.itemToDelete = item;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (!this.itemToDelete?.id) return;
    const item = this.itemToDelete;
    this.showDeleteModal = false;
    this.itemToDelete = null;

    this.adminApiService.deleteMasterData(item.id!).subscribe({
      next: () => {
        this.loadData();
        this.masterDataService.clearCache(item.type);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to delete item';
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.itemToDelete = null;
  }

  toggleActive(item: MasterData): void {
    if (!item.id || this.togglingIds.has(item.id)) return;

    const id = item.id;
    this.togglingIds.add(id);
    this.errorMessage = '';
    this.successMessage = '';

    // Optimistic UI update
    const previousState = item.isActive;
    item.isActive = !item.isActive;

    this.adminApiService.toggleMasterDataActive(id).subscribe({
      next: () => {
        this.togglingIds.delete(id);
        this.successMessage = `"${item.displayName}" has been ${item.isActive ? 'activated' : 'deactivated'}.`;
        this.masterDataService.clearCache(item.type);
        setTimeout(() => { this.successMessage = ''; }, 3000);
        // Silent background refresh to sync with server
        this.adminApiService.getMasterData().subscribe({
          next: (data) => {
            this.masterDataList = data;
            this.filterByType();
          },
          error: () => {}
        });
      },
      error: (error) => {
        // Revert optimistic update
        item.isActive = previousState;
        this.togglingIds.delete(id);
        this.errorMessage = error.error?.message || 'Failed to toggle status. Please try again.';
        console.error('Toggle error:', error);
      }
    });
  }

  getTypeDisplayName(type: string): string {
    return this.typeDisplayNames[type] || type;
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }
}
