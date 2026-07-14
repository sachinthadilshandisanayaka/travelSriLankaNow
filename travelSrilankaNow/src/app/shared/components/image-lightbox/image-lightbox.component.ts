import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';

@Component({
  selector: 'app-image-lightbox',
  templateUrl: './image-lightbox.component.html',
  styleUrls: ['./image-lightbox.component.scss']
})
export class ImageLightboxComponent {
  @Input() images: string[] = [];
  @Input() entityName: string = '';
  @Output() closed = new EventEmitter<void>();

  isOpen = false;
  currentIndex = 0;
  imageLoaded = false;

  open(index: number = 0): void {
    this.currentIndex = index;
    this.isOpen = true;
    this.imageLoaded = false;
    document.body.style.overflow = 'hidden';
  }

  close(): void {
    this.isOpen = false;
    document.body.style.overflow = '';
    this.closed.emit();
  }

  next(): void {
    if (this.currentIndex < this.images.length - 1) {
      this.currentIndex++;
      this.imageLoaded = false;
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.imageLoaded = false;
    }
  }

  onImageLoad(): void {
    this.imageLoaded = true;
  }

  getOptimizedUrl(url: string): string {
    return url || '';
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        this.close();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('lightbox__backdrop')) {
      this.close();
    }
  }
}
