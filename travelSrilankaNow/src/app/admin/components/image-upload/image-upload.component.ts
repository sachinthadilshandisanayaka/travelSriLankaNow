import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CloudinaryService, UploadProgress } from '../../../services/cloudinary.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.scss']
})
export class ImageUploadComponent implements OnInit {
  @Input() currentImageUrl: string = '';
  @Input() folder: string = 'travel-sri-lanka';
  @Input() label: string = 'Image';
  @Input() multiple: boolean = false;
  @Input() currentImages: string[] = [];

  @Output() imageUploaded = new EventEmitter<string>();
  @Output() imagesUploaded = new EventEmitter<string[]>();
  @Output() imageRemoved = new EventEmitter<number>();

  isDragOver = false;
  isUploading = false;
  uploadProgress = 0;
  errorMessage = '';
  previewUrl = '';

  multipleProgress: UploadProgress[] = [];

  constructor(private cloudinaryService: CloudinaryService) {}

  ngOnInit(): void {
    if (this.currentImageUrl) {
      this.previewUrl = this.currentImageUrl;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      if (this.multiple) {
        this.uploadMultipleFiles(Array.from(files));
      } else {
        this.uploadFile(files[0]);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.multiple) {
        this.uploadMultipleFiles(Array.from(input.files));
      } else {
        this.uploadFile(input.files[0]);
      }
    }
  }

  uploadFile(file: File): void {
    if (!this.validateFile(file)) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.errorMessage = '';

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);

    this.cloudinaryService.uploadImage(file, this.folder).subscribe({
      next: (progress) => {
        this.uploadProgress = progress.progress;
        if (progress.status === 'completed' && progress.url) {
          this.previewUrl = progress.url;
          this.imageUploaded.emit(progress.url);
          this.isUploading = false;
        } else if (progress.status === 'error') {
          this.errorMessage = progress.error || 'Upload failed';
          this.isUploading = false;
          this.previewUrl = '';
        }
      },
      error: (error) => {
        this.errorMessage = 'Upload failed. Please try again.';
        this.isUploading = false;
        this.previewUrl = '';
      }
    });
  }

  uploadMultipleFiles(files: File[]): void {
    const validFiles = files.filter(file => this.validateFile(file));
    if (validFiles.length === 0) return;

    this.isUploading = true;
    this.errorMessage = '';
    this.multipleProgress = validFiles.map(() => ({ progress: 0, status: 'uploading' as const }));

    this.cloudinaryService.uploadMultipleImages(validFiles, this.folder).subscribe({
      next: (progressArray) => {
        this.multipleProgress = progressArray;
        const allCompleted = progressArray.every(p => p.status === 'completed' || p.status === 'error');

        if (allCompleted) {
          const uploadedUrls = progressArray
            .filter(p => p.status === 'completed' && p.url)
            .map(p => p.url as string);

          this.imagesUploaded.emit(uploadedUrls);
          this.isUploading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Upload failed. Please try again.';
        this.isUploading = false;
      }
    });
  }

  validateFile(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.';
      return false;
    }

    if (file.size > maxSize) {
      this.errorMessage = 'File too large. Maximum size is 10MB.';
      return false;
    }

    return true;
  }

  removeImage(): void {
    this.previewUrl = '';
    this.currentImageUrl = '';
    this.imageUploaded.emit('');
  }

  removeMultipleImage(index: number): void {
    this.imageRemoved.emit(index);
  }

  clearError(): void {
    this.errorMessage = '';
  }
}
