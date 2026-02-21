import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Media, MediaType, UploadProgress, CropData, RECOMMENDED_ASPECTS } from '../../models/media.model';
import { MediaService } from '../../services/media.service';

export interface UploadResult {
  media: Media;
  url: string;
}

@Component({
  selector: 'app-advanced-image-upload',
  templateUrl: './advanced-image-upload.component.html',
  styleUrls: ['./advanced-image-upload.component.scss']
})
export class AdvancedImageUploadComponent {
  @Input() label = 'Image';
  @Input() mediaType: MediaType = MediaType.GENERAL;
  @Input() multiple = false;
  @Input() currentImageUrl = '';
  @Input() currentImages: string[] = [];
  @Input() showEditor = true;
  @Input() showPreview = true;
  @Input() maxFiles = 10;
  @Input() acceptedTypes = 'image/jpeg,image/png,image/gif,image/webp';
  @Input() maxSizeMB = 10;
  @Input() previewMode: 'card' | 'list' | 'grid' = 'card';

  @Output() imageUploaded = new EventEmitter<UploadResult>();
  @Output() imagesUploaded = new EventEmitter<UploadResult[]>();
  @Output() imageRemoved = new EventEmitter<number>();
  @Output() uploadError = new EventEmitter<string>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  // State
  isDragOver = false;
  isUploading = false;
  uploadProgress: UploadProgress[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];

  // Editor state
  showImageEditor = false;
  editingFile: File | null = null;
  editingImageUrl: string | null = null;
  editingIndex = -1;

  // Uploaded media
  uploadedMedia: Media[] = [];

  constructor(private mediaService: MediaService) {}

  get recommendedAspects(): string[] {
    return RECOMMENDED_ASPECTS[this.mediaType] || ['free'];
  }

  get hasCurrentImage(): boolean {
    return !!this.currentImageUrl || this.currentImages.length > 0;
  }

  get totalProgress(): number {
    if (this.uploadProgress.length === 0) return 0;
    const total = this.uploadProgress.reduce((sum, p) => sum + p.progress, 0);
    return Math.round(total / this.uploadProgress.length);
  }

  // Drag and drop handlers
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.handleFiles(Array.from(files));
    }
  }

  // File input handler
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
    // Reset input to allow selecting same file again
    input.value = '';
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  private handleFiles(files: File[]) {
    // Filter valid files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = this.mediaService.validateFile(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    // Check max files limit
    if (!this.multiple && validFiles.length > 1) {
      validFiles.splice(1);
    } else if (this.multiple && validFiles.length > this.maxFiles) {
      validFiles.splice(this.maxFiles);
      errors.push(`Maximum ${this.maxFiles} files allowed`);
    }

    // Show errors
    if (errors.length > 0) {
      this.uploadError.emit(errors.join('\n'));
    }

    if (validFiles.length === 0) return;

    // Generate previews
    this.selectedFiles = validFiles;
    this.generatePreviews(validFiles);

    // If editor is enabled and single file, open editor
    if (this.showEditor && !this.multiple && validFiles.length === 1) {
      this.openEditor(validFiles[0], 0);
    } else {
      // Direct upload without editing
      this.uploadFiles(validFiles);
    }
  }

  private generatePreviews(files: File[]) {
    this.previewUrls = [];

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Editor methods
  openEditor(file: File, index: number) {
    this.editingFile = file;
    this.editingImageUrl = null; // Clear URL when editing a file
    this.editingIndex = index;
    this.showImageEditor = true;
  }

  onEditorSave(result: { file: File; cropData?: CropData; rotation: number }) {
    this.showImageEditor = false;

    // Check if editing existing image (index -1) or a newly selected file
    if (this.editingIndex === -1) {
      // Editing existing image - add to selected files and upload
      this.selectedFiles = [result.file];

      // Update preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls = [e.target?.result as string];
      };
      reader.readAsDataURL(result.file);
    } else if (this.editingIndex >= 0 && this.editingIndex < this.selectedFiles.length) {
      // Replace the file with edited version
      this.selectedFiles[this.editingIndex] = result.file;

      // Update preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrls[this.editingIndex] = e.target?.result as string;
      };
      reader.readAsDataURL(result.file);
    }

    // Upload the edited file - the file is already processed by the editor (cropped/rotated)
    // so we use the standard upload without transformation parameters
    this.uploadSingleFile(result.file);

    this.editingFile = null;
    this.editingImageUrl = null;
    this.editingIndex = -1;
  }

  onEditorCancel() {
    this.showImageEditor = false;
    this.editingFile = null;
    this.editingImageUrl = null;
    this.editingIndex = -1;

    // Clear selection if no files uploaded yet (only for new file selection, not existing image edit)
    if (this.uploadedMedia.length === 0 && this.editingIndex !== -1) {
      this.selectedFiles = [];
      this.previewUrls = [];
    }
  }

  onEditorSkip(file: File) {
    // Upload the original file without any editing
    this.showImageEditor = false;

    // Update selected files and preview
    this.selectedFiles = [file];
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrls = [e.target?.result as string];
    };
    reader.readAsDataURL(file);

    // Upload the original file directly
    this.uploadSingleFile(file);

    this.editingFile = null;
    this.editingImageUrl = null;
    this.editingIndex = -1;
  }

  // Upload methods
  private uploadFiles(files: File[]) {
    if (files.length === 0) return;

    this.isUploading = true;
    this.uploadProgress = files.map(file => ({
      file,
      progress: 0,
      status: 'pending' as const
    }));

    if (this.multiple) {
      this.uploadMultiple(files);
    } else {
      this.uploadSingleFile(files[0]);
    }
  }

  private uploadSingleFile(file: File) {
    this.isUploading = true;
    this.uploadProgress = [{
      file,
      progress: 0,
      status: 'pending'
    }];

    // Always use standard upload - the image editor already processes (crops/rotates) the file
    const upload$ = this.mediaService.uploadImage(file, this.mediaType);

    upload$.subscribe({
      next: (progress) => {
        this.uploadProgress[0] = progress;

        if (progress.status === 'completed' && progress.media) {
          this.uploadedMedia = [progress.media];
          this.imageUploaded.emit({
            media: progress.media,
            url: progress.media.url
          });
        }
      },
      error: (error) => {
        this.uploadProgress[0].status = 'error';
        this.uploadProgress[0].error = error.message;
        this.uploadError.emit(error.message);
      },
      complete: () => {
        this.isUploading = false;
      }
    });
  }

  private uploadMultiple(files: File[]) {
    let completedCount = 0;
    const results: UploadResult[] = [];

    files.forEach((file, index) => {
      this.mediaService.uploadImage(file, this.mediaType).subscribe({
        next: (progress) => {
          this.uploadProgress[index] = progress;

          if (progress.status === 'completed' && progress.media) {
            this.uploadedMedia.push(progress.media);
            results.push({
              media: progress.media,
              url: progress.media.url
            });
          }
        },
        error: (error) => {
          this.uploadProgress[index].status = 'error';
          this.uploadProgress[index].error = error.message;
          completedCount++;
          this.checkUploadComplete(completedCount, files.length, results);
        },
        complete: () => {
          completedCount++;
          this.checkUploadComplete(completedCount, files.length, results);
        }
      });
    });
  }

  private checkUploadComplete(completed: number, total: number, results: UploadResult[]) {
    if (completed === total) {
      this.isUploading = false;
      if (results.length > 0) {
        this.imagesUploaded.emit(results);
      }
    }
  }

  // Remove/clear methods
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
    this.uploadProgress.splice(index, 1);

    if (index < this.uploadedMedia.length) {
      this.uploadedMedia.splice(index, 1);
    }
  }

  removeCurrentImage(index: number = 0) {
    this.imageRemoved.emit(index);
  }

  clearAll() {
    this.selectedFiles = [];
    this.previewUrls = [];
    this.uploadProgress = [];
    this.uploadedMedia = [];
  }

  // State for loading existing image
  isLoadingExistingImage = false;

  // Edit existing image - fetch as blob first to avoid CORS issues
  editCurrentImage() {
    if (this.currentImageUrl) {
      this.isLoadingExistingImage = true;

      // Fetch the image as blob and convert to File
      this.fetchImageAsFile(this.currentImageUrl)
        .then(file => {
          this.isLoadingExistingImage = false;
          this.editingFile = file;
          this.editingImageUrl = null;
          this.editingIndex = -1;
          this.showImageEditor = true;
        })
        .catch(error => {
          this.isLoadingExistingImage = false;
          console.error('Failed to load image for editing:', error);
          this.uploadError.emit('Failed to load image for editing. Please try uploading a new image.');
        });
    }
  }

  private async fetchImageAsFile(url: string): Promise<File> {
    try {
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-cache'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();

      // Extract filename from URL or use default
      let filename = 'image.jpg';
      const urlParts = url.split('/');
      const lastPart = urlParts[urlParts.length - 1].split('?')[0];
      if (lastPart && lastPart.includes('.')) {
        filename = lastPart;
      }

      // Create File from blob
      return new File([blob], filename, { type: blob.type || 'image/jpeg' });
    } catch (error) {
      // Try with no-cors as fallback (will create opaque response)
      throw error;
    }
  }

  // Helpers
  formatFileSize(bytes: number): string {
    return this.mediaService.formatFileSize(bytes);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'completed': return '✓';
      case 'error': return '✕';
      case 'uploading': return '↑';
      default: return '○';
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }
}
