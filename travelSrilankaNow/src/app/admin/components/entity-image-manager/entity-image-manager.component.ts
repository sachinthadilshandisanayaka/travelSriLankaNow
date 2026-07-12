import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-entity-image-manager',
  templateUrl: './entity-image-manager.component.html',
  styleUrls: ['./entity-image-manager.component.scss']
})
export class EntityImageManagerComponent implements OnChanges {
  @Input() entityType: string = '';
  @Input() primaryImageUrl: string = '';
  @Input() existingImages: string[] = [];
  @Input() folder: string = 'travel-sri-lanka';
  @Input() maxImages: number = 20;
  @Input() label: string = 'Images';

  @Output() primaryImageChanged = new EventEmitter<string>();
  @Output() imagesChanged = new EventEmitter<string[]>();

  images: string[] = [];
  dragIndex: number | null = null;
  dragOverIndex: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['existingImages'] && changes['existingImages'].currentValue) {
      this.images = [...changes['existingImages'].currentValue];
    }
  }

  getThumbnail(url: string, _size: number = 150): string {
    return url || '';
  }

  isPrimary(url: string): boolean {
    return url === this.primaryImageUrl;
  }

  setAsPrimary(url: string): void {
    this.primaryImageUrl = url;
    this.primaryImageChanged.emit(url);
  }

  removeImage(index: number): void {
    const removed = this.images[index];
    this.images.splice(index, 1);
    this.imagesChanged.emit([...this.images]);

    // If we removed the primary image, set first remaining as primary
    if (removed === this.primaryImageUrl) {
      const newPrimary = this.images.length > 0 ? this.images[0] : '';
      this.primaryImageUrl = newPrimary;
      this.primaryImageChanged.emit(newPrimary);
    }
  }

  onNewImagesUploaded(urls: string[]): void {
    if (!urls || urls.length === 0) return;

    this.images = [...this.images, ...urls];
    this.imagesChanged.emit([...this.images]);

    // If no primary image set, use the first uploaded one
    if (!this.primaryImageUrl && this.images.length > 0) {
      this.primaryImageUrl = this.images[0];
      this.primaryImageChanged.emit(this.primaryImageUrl);
    }
  }

  onSingleImageUploaded(url: string): void {
    if (!url) return;
    this.images = [...this.images, url];
    this.imagesChanged.emit([...this.images]);

    if (!this.primaryImageUrl) {
      this.primaryImageUrl = url;
      this.primaryImageChanged.emit(this.primaryImageUrl);
    }
  }

  // Drag and drop reorder
  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    this.dragOverIndex = index;
  }

  onDragLeave(): void {
    this.dragOverIndex = null;
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    if (this.dragIndex === null || this.dragIndex === dropIndex) {
      this.dragIndex = null;
      this.dragOverIndex = null;
      return;
    }

    const item = this.images[this.dragIndex];
    this.images.splice(this.dragIndex, 1);
    this.images.splice(dropIndex, 0, item);

    this.dragIndex = null;
    this.dragOverIndex = null;
    this.imagesChanged.emit([...this.images]);
  }

  onDragEnd(): void {
    this.dragIndex = null;
    this.dragOverIndex = null;
  }

  get canAddMore(): boolean {
    return this.images.length < this.maxImages;
  }
}
