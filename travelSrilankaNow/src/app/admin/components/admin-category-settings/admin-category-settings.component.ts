import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

interface CategoryItem {
  id: number;
  type: string;
  code: string;
  displayName: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  color: string;
  icon: string;
}

interface EventImage {
  id: number;
  title: string;
  imageUrl: string;
}

interface CategoryState {
  editing: CategoryItem;
  events: EventImage[];
  showPicker: boolean;
  loadingEvents: boolean;
}

@Component({
  selector: 'app-admin-category-settings',
  templateUrl: './admin-category-settings.component.html',
  styleUrls: ['./admin-category-settings.component.scss']
})
export class AdminCategorySettingsComponent implements OnInit {
  categories: CategoryItem[] = [];
  states: { [id: number]: CategoryState } = {};

  savingIds = new Set<number>();
  togglingIds = new Set<number>();
  togglingMaster = false;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private adminApiService: AdminApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  get masterEnabled(): boolean {
    return this.categories.some(c => c.isActive);
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.adminApiService.getMasterData().subscribe({
      next: (data) => {
        this.categories = data
          .filter((item: any) => item.type === 'EVENT_CATEGORY')
          .sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0));

        this.states = {};
        this.categories.forEach(item => {
          this.states[item.id] = {
            editing: { ...item },
            events: [],
            showPicker: false,
            loadingEvents: true
          };
        });
        this.isLoading = false;
        this.loadAllCategoryEvents();
      },
      error: () => {
        this.errorMessage = 'Failed to load category data. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private loadAllCategoryEvents(): void {
    this.categories.forEach(cat => {
      this.adminApiService.getEvents(0, 12, 'displayOrder,asc', undefined, cat.code).subscribe({
        next: (response) => {
          if (!this.states[cat.id]) { return; }
          const events: EventImage[] = (response.content || [])
            .filter((e: any) => !!e.imageUrl)
            .map((e: any) => ({ id: e.id, title: e.title, imageUrl: e.imageUrl }));
          this.states[cat.id].events = events;
          this.states[cat.id].loadingEvents = false;
          // Auto-populate icon from first event image if not already set
          if (!this.states[cat.id].editing.icon && events.length > 0) {
            this.states[cat.id].editing.icon = events[0].imageUrl;
          }
        },
        error: () => {
          if (this.states[cat.id]) {
            this.states[cat.id].loadingEvents = false;
          }
        }
      });
    });
  }

  selectImage(catId: number, imageUrl: string): void {
    if (!this.states[catId]) { return; }
    this.states[catId].editing.icon = imageUrl;
    this.states[catId].showPicker = false;
  }

  togglePicker(catId: number): void {
    if (!this.states[catId]) { return; }
    this.states[catId].showPicker = !this.states[catId].showPicker;
  }

  saveItem(id: number): void {
    if (this.savingIds.has(id)) { return; }
    const state = this.states[id];
    if (!state) { return; }

    this.savingIds.add(id);
    this.errorMessage = '';
    this.successMessage = '';

    this.adminApiService.updateMasterData(id, state.editing).subscribe({
      next: (updated) => {
        const idx = this.categories.findIndex(c => c.id === id);
        const saved: CategoryItem = updated || { ...state.editing };
        if (idx !== -1) {
          this.categories[idx] = saved;
          this.states[id].editing = { ...saved };
        }
        this.savingIds.delete(id);
        this.successMessage = '"' + state.editing.displayName + '" saved successfully.';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        this.savingIds.delete(id);
        this.errorMessage = (err.error && err.error.message) || 'Failed to save changes.';
      }
    });
  }

  toggleActive(id: number): void {
    if (this.togglingIds.has(id)) { return; }
    const cat = this.categories.find(c => c.id === id);
    if (!cat) { return; }

    this.togglingIds.add(id);
    const prev = cat.isActive;
    cat.isActive = !cat.isActive;
    if (this.states[id]) { this.states[id].editing.isActive = cat.isActive; }

    this.adminApiService.toggleMasterDataActive(id).subscribe({
      next: () => {
        this.togglingIds.delete(id);
        this.successMessage = '"' + cat.displayName + '" is now ' + (cat.isActive ? 'visible' : 'hidden') + ' on the public page.';
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (err) => {
        cat.isActive = prev;
        if (this.states[id]) { this.states[id].editing.isActive = prev; }
        this.togglingIds.delete(id);
        this.errorMessage = (err.error && err.error.message) || 'Failed to update visibility.';
      }
    });
  }

  toggleMasterEnabled(): void {
    if (this.togglingMaster || this.categories.length === 0) { return; }
    const targetState = !this.masterEnabled;
    const toToggle = this.categories.filter(c => c.isActive !== targetState);
    if (toToggle.length === 0) { return; }

    this.togglingMaster = true;
    let remaining = toToggle.length;

    toToggle.forEach(cat => {
      cat.isActive = targetState;
      if (this.states[cat.id]) { this.states[cat.id].editing.isActive = targetState; }

      this.adminApiService.toggleMasterDataActive(cat.id).subscribe({
        next: () => {
          remaining--;
          if (remaining === 0) {
            this.togglingMaster = false;
            this.successMessage = 'Browse by Category section ' + (targetState ? 'enabled' : 'disabled') + '.';
            setTimeout(() => { this.successMessage = ''; }, 3000);
          }
        },
        error: () => {
          cat.isActive = !targetState;
          if (this.states[cat.id]) { this.states[cat.id].editing.isActive = !targetState; }
          remaining--;
          if (remaining === 0) {
            this.togglingMaster = false;
          }
        }
      });
    });
  }

  isSaving(id: number): boolean { return this.savingIds.has(id); }
  isToggling(id: number): boolean { return this.togglingIds.has(id); }
  trackById(_: number, item: CategoryItem): number { return item.id; }
}
