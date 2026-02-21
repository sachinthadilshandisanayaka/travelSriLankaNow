import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AdminApiService } from '../../services/admin-api.service';

interface OrderableItem {
  id: number;
  name: string;
  title?: string;
  imageUrl: string;
  category?: string;
  type?: string;
  featured: boolean;
  displayOrder?: number;
}

@Component({
  selector: 'app-admin-item-order',
  templateUrl: './admin-item-order.component.html',
  styleUrls: ['./admin-item-order.component.scss']
})
export class AdminItemOrderComponent implements OnInit, OnDestroy {
  itemType: 'locations' | 'events' | 'places' | 'gallery' = 'locations';

  // Available items (left panel)
  availableItems: OrderableItem[] = [];
  searchTerm = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  isLoading = false;

  // Ordered items (right panel)
  orderedItems: OrderableItem[] = [];
  initialFeaturedIds: number[] = [];

  // Drag state
  draggedItem: OrderableItem | null = null;
  dragOverIndex = -1;

  // UI state
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminApi: AdminApiService
  ) {}

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const type = params['type'];
      if (['locations', 'events', 'places', 'gallery'].includes(type)) {
        this.itemType = type;
        this.loadItems();
        this.loadFeaturedItems();
      } else {
        this.router.navigate(['/admin/dashboard']);
      }
    });

    // Debounced search
    this.searchSubject.pipe(
      debounceTime(300),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = 0;
      this.loadItems();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Available item types for the selector
  itemTypes: Array<{ value: 'locations' | 'events' | 'places' | 'gallery'; label: string; icon: string }> = [
    { value: 'locations', label: 'Locations', icon: 'location' },
    { value: 'events', label: 'Events', icon: 'calendar' },
    { value: 'places', label: 'Places', icon: 'building' },
    { value: 'gallery', label: 'Gallery', icon: 'image' }
  ];

  getTypeTitle(): string {
    const titles: Record<string, string> = {
      locations: 'Locations',
      events: 'Events',
      places: 'Places',
      gallery: 'Gallery'
    };
    return titles[this.itemType] || 'Items';
  }

  switchType(type: 'locations' | 'events' | 'places' | 'gallery'): void {
    if (type !== this.itemType) {
      this.router.navigate(['/admin/order', type]);
    }
  }

  loadItems(): void {
    this.isLoading = true;
    let observable;

    switch (this.itemType) {
      case 'locations':
        observable = this.adminApi.getLocations(this.currentPage, this.pageSize);
        break;
      case 'events':
        observable = this.adminApi.getEvents(this.currentPage, this.pageSize);
        break;
      case 'places':
        observable = this.adminApi.getPlaces(this.currentPage, this.pageSize);
        break;
      case 'gallery':
        observable = this.adminApi.getGalleryItems(this.currentPage, this.pageSize);
        break;
    }

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.availableItems = response.content.map((item: any) => this.mapToOrderableItem(item));
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load items';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadFeaturedItems(): void {
    // Load featured items and sort by displayOrder
    let observable;

    switch (this.itemType) {
      case 'locations':
        observable = this.adminApi.getLocations(0, 100, 'displayOrder,asc');
        break;
      case 'events':
        observable = this.adminApi.getEvents(0, 100, 'displayOrder,asc');
        break;
      case 'places':
        observable = this.adminApi.getPlaces(0, 100, 'displayOrder,asc');
        break;
      case 'gallery':
        observable = this.adminApi.getGalleryItems(0, 100, 'displayOrder,asc');
        break;
    }

    observable.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.orderedItems = response.content
          .filter((item: any) => item.featured)
          .map((item: any) => this.mapToOrderableItem(item))
          .sort((a: OrderableItem, b: OrderableItem) => (a.displayOrder || 999) - (b.displayOrder || 999));
        // Track initial featured IDs so we can unfeatured removed items on save
        this.initialFeaturedIds = this.orderedItems.map(item => item.id);
      },
      error: (err) => {
        console.error('Failed to load featured items', err);
      }
    });
  }

  mapToOrderableItem(item: any): OrderableItem {
    return {
      id: item.id,
      name: item.name || item.title || 'Untitled',
      title: item.title,
      imageUrl: item.imageUrl || item.url || '',
      category: item.category,
      type: item.type,
      featured: item.featured || false,
      displayOrder: item.displayOrder || 0
    };
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadItems();
    }
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  isInOrderedList(item: OrderableItem): boolean {
    return this.orderedItems.some(o => o.id === item.id);
  }

  addToOrder(item: OrderableItem): void {
    if (!this.isInOrderedList(item)) {
      this.orderedItems.push({ ...item, featured: true });
    }
  }

  removeFromOrder(index: number): void {
    this.orderedItems.splice(index, 1);
  }

  moveUp(index: number): void {
    if (index > 0) {
      const temp = this.orderedItems[index];
      this.orderedItems[index] = this.orderedItems[index - 1];
      this.orderedItems[index - 1] = temp;
    }
  }

  moveDown(index: number): void {
    if (index < this.orderedItems.length - 1) {
      const temp = this.orderedItems[index];
      this.orderedItems[index] = this.orderedItems[index + 1];
      this.orderedItems[index + 1] = temp;
    }
  }

  // Drag and Drop
  onDragStart(event: DragEvent, item: OrderableItem, fromOrdered: boolean = false): void {
    this.draggedItem = item;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item.id.toString());
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

    if (!this.draggedItem) return;

    // Check if item is already in list
    const existingIndex = this.orderedItems.findIndex(o => o.id === this.draggedItem!.id);

    if (existingIndex >= 0) {
      // Reorder within list
      const [removed] = this.orderedItems.splice(existingIndex, 1);
      this.orderedItems.splice(targetIndex, 0, removed);
    } else {
      // Add from available list
      this.orderedItems.splice(targetIndex, 0, { ...this.draggedItem, featured: true });
    }

    this.draggedItem = null;
  }

  onDropToList(event: DragEvent): void {
    event.preventDefault();
    this.dragOverIndex = -1;

    if (!this.draggedItem) return;

    if (!this.isInOrderedList(this.draggedItem)) {
      this.orderedItems.push({ ...this.draggedItem, featured: true });
    }

    this.draggedItem = null;
  }

  onDragEnd(): void {
    this.draggedItem = null;
    this.dragOverIndex = -1;
  }

  async saveOrder(): Promise<void> {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Find items that were removed from the ordered list
      const currentOrderedIds = this.orderedItems.map(item => item.id);
      const removedIds = this.initialFeaturedIds.filter(id => !currentOrderedIds.includes(id));

      // Unfeatured removed items
      const unfeaturedPromises = removedIds.map(id => {
        const updateData = { displayOrder: 0, featured: false };
        switch (this.itemType) {
          case 'locations':
            return this.adminApi.updateLocation(id, updateData).toPromise();
          case 'events':
            return this.adminApi.updateEvent(id, updateData).toPromise();
          case 'places':
            return this.adminApi.updatePlace(id, updateData).toPromise();
          case 'gallery':
            return this.adminApi.updateGalleryItem(id, updateData).toPromise();
        }
      });

      // Update each item with its new display order
      const updatePromises = this.orderedItems.map((item, index) => {
        const updateData = {
          displayOrder: index + 1,
          featured: true
        };

        switch (this.itemType) {
          case 'locations':
            return this.adminApi.updateLocation(item.id, updateData).toPromise();
          case 'events':
            return this.adminApi.updateEvent(item.id, updateData).toPromise();
          case 'places':
            return this.adminApi.updatePlace(item.id, updateData).toPromise();
          case 'gallery':
            return this.adminApi.updateGalleryItem(item.id, updateData).toPromise();
        }
      });

      await Promise.all([...unfeaturedPromises, ...updatePromises]);

      // Update tracked IDs for subsequent saves
      this.initialFeaturedIds = currentOrderedIds;

      this.successMessage = 'Display order saved successfully!';
      setTimeout(() => this.successMessage = '', 3000);

      // Reload to reflect changes
      this.loadItems();

    } catch (err) {
      this.errorMessage = 'Failed to save order. Please try again.';
      console.error(err);
    } finally {
      this.isSaving = false;
    }
  }

}
