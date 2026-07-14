import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';
import { Media, MediaType, MediaStats } from '../../models/media.model';

@Component({
  selector: 'app-admin-media',
  templateUrl: './admin-media.component.html',
  styleUrls: ['./admin-media.component.scss']
})
export class AdminMediaComponent implements OnInit {
  items: Media[] = [];
  stats: MediaStats | null = null;

  isLoading = false;
  isUploading = false;
  showDeleteConfirm = false;
  deleteItemId: number | null = null;
  showUploadPanel = false;

  currentPage = 0;
  pageSize = 20;
  totalPages = 0;
  totalElements = 0;

  filterType = '';
  searchTerm = '';
  selectedItem: Media | null = null;

  successMessage = '';
  errorMessage = '';

  mediaTypes = [
    { value: '', label: 'All Types' },
    { value: 'HERO_SLIDE',      label: 'Hero Slides' },
    { value: 'PAGE_HEADER',     label: 'Page Headers' },
    { value: 'LOCATION',        label: 'Locations' },
    { value: 'LOCATION_GALLERY',label: 'Location Gallery' },
    { value: 'EVENT',           label: 'Events' },
    { value: 'PLACE',           label: 'Places' },
    { value: 'PLACE_GALLERY',   label: 'Place Gallery' },
    { value: 'GALLERY',         label: 'Gallery' },
    { value: 'GENERAL',         label: 'General' },
  ];

  constructor(private apiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadMedia();
    this.loadStats();
  }

  loadMedia(): void {
    this.isLoading = true;
    const obs = this.filterType
      ? this.apiService.getMediaByType(this.filterType as MediaType, this.currentPage, this.pageSize)
      : this.searchTerm
        ? this.apiService.searchMedia(this.searchTerm, this.currentPage, this.pageSize)
        : this.apiService.getAllMedia(this.currentPage, this.pageSize);

    obs.subscribe({
      next: (res: any) => {
        this.items = res.data || res.content || [];
        this.totalElements = res.total || res.totalElements || 0;
        this.totalPages = res.pages || res.totalPages || 0;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load media';
        this.isLoading = false;
        this.hideMessages();
      }
    });
  }

  loadStats(): void {
    this.apiService.getMediaStats().subscribe({
      next: (stats) => { this.stats = stats; },
      error: () => {}
    });
  }

  onFilterChange(): void {
    this.currentPage = 0;
    this.searchTerm = '';
    this.loadMedia();
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.filterType = '';
    this.currentPage = 0;
    this.loadMedia();
  }

  clearFilter(): void {
    this.filterType = '';
    this.searchTerm = '';
    this.currentPage = 0;
    this.loadMedia();
  }

  onImageUploaded(url: string): void {
    if (url) {
      this.successMessage = 'Image uploaded successfully!';
      this.showUploadPanel = false;
      this.loadMedia();
      this.loadStats();
      this.hideMessages();
    }
  }

  confirmDelete(id: number): void {
    this.deleteItemId = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteItemId = null;
  }

  deleteMedia(): void {
    if (this.deleteItemId === null) return;
    this.isLoading = true;
    this.apiService.deleteMedia(this.deleteItemId).subscribe({
      next: () => {
        this.successMessage = 'Media deleted successfully!';
        this.showDeleteConfirm = false;
        this.deleteItemId = null;
        if (this.selectedItem?.id === this.deleteItemId) this.selectedItem = null;
        this.loadMedia();
        this.loadStats();
        this.hideMessages();
      },
      error: () => {
        this.errorMessage = 'Failed to delete media';
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.hideMessages();
      }
    });
  }

  selectItem(item: Media): void {
    this.selectedItem = this.selectedItem?.id === item.id ? null : item;
  }

  goToPage(page: number): void { this.currentPage = page; this.loadMedia(); }
  prevPage(): void { if (this.currentPage > 0) { this.currentPage--; this.loadMedia(); } }
  nextPage(): void { if (this.currentPage < this.totalPages - 1) { this.currentPage++; this.loadMedia(); } }

  formatSize(bytes: number): string {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  typeLabel(type: string): string {
    return this.mediaTypes.find(t => t.value === type)?.label || type;
  }

  private hideMessages(): void {
    setTimeout(() => { this.successMessage = ''; this.errorMessage = ''; }, 3000);
  }
}
