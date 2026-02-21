import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CropData, ASPECT_RATIOS, RECOMMENDED_ASPECTS, MediaType } from '../../models/media.model';

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() imageFile!: File;
  @Input() imageUrl?: string; // Support loading from URL
  @Input() mediaType: MediaType = MediaType.GENERAL;
  @Input() initialCropData?: CropData;

  @Output() save = new EventEmitter<{ file: File; cropData?: CropData; rotation: number }>();
  @Output() cancel = new EventEmitter<void>();
  @Output() skipEdit = new EventEmitter<File>(); // Emit original file without editing

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('previewCanvas') previewCanvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('container') containerRef!: ElementRef<HTMLDivElement>;

  // Image state
  originalImage: HTMLImageElement | null = null;
  imageLoaded = false;
  loading = true;
  loadError: string | null = null;

  // Editor state
  rotation = 0;
  zoom = 1;
  flipH = false;
  flipV = false;

  // Crop state
  cropMode = true;
  cropBox: CropBox = { x: 0, y: 0, width: 0, height: 0 };
  isDragging = false;
  isResizing = false;
  resizeHandle = '';
  dragStart = { x: 0, y: 0 };
  cropStart = { x: 0, y: 0, width: 0, height: 0 };

  // Aspect ratio
  selectedAspect = 'free';
  aspectRatios = ASPECT_RATIOS;
  recommendedAspects: string[] = [];

  // Canvas dimensions
  canvasWidth = 800;
  canvasHeight = 600;
  scale = 1;

  // Preview
  showPreview = false;

  // UI state
  sidebarCollapsed = false;

  // Event listener references for proper cleanup
  private boundMouseMove: (e: MouseEvent) => void;
  private boundMouseUp: () => void;
  private boundKeyDown: (e: KeyboardEvent) => void;

  constructor(
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseUp = this.onMouseUp.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
  }

  ngOnInit() {
    this.recommendedAspects = RECOMMENDED_ASPECTS[this.mediaType] || ['free'];
    if (this.recommendedAspects.length > 0 && this.recommendedAspects[0] !== 'free') {
      this.selectedAspect = this.recommendedAspects[0];
    }
  }

  ngAfterViewInit() {
    this.setupEventListeners();
    // Start loading image
    this.loadImage();
  }

  ngOnDestroy() {
    this.removeEventListeners();
  }

  loadImage() {
    this.loading = true;
    this.loadError = null;

    if (this.imageFile) {
      this.loadFromFile(this.imageFile);
    } else if (this.imageUrl) {
      this.loadFromUrl(this.imageUrl);
    } else {
      this.loading = false;
      this.loadError = 'No image provided';
    }
  }

  private loadFromFile(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        this.loadImageFromDataUrl(dataUrl);
      } else {
        this.handleLoadError('Failed to read file');
      }
    };

    reader.onerror = () => {
      this.handleLoadError('Error reading file');
    };

    reader.readAsDataURL(file);
  }

  private loadFromUrl(url: string) {
    // For Cloudinary and other CDN images, we need to handle CORS properly
    // First, try loading with crossOrigin anonymous for canvas export capability
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Add cache-busting to avoid CORS caching issues
    const cacheBustedUrl = url.includes('?')
      ? `${url}&_t=${Date.now()}`
      : `${url}?_t=${Date.now()}`;

    img.onload = () => {
      // Test if we can actually draw to canvas (CORS check)
      try {
        const testCanvas = document.createElement('canvas');
        testCanvas.width = 10;
        testCanvas.height = 10;
        const testCtx = testCanvas.getContext('2d');
        if (testCtx) {
          testCtx.drawImage(img, 0, 0, 10, 10);
          // Try to read data - this will throw if CORS blocked
          testCanvas.toDataURL();
        }
        // CORS check passed
        this.originalImage = img;
        this.ngZone.run(() => this.onImageLoaded());
      } catch (corsError) {
        console.warn('CORS check failed, trying fetch approach...');
        this.loadFromUrlViaFetch(url);
      }
    };

    img.onerror = () => {
      console.warn('Direct image load failed, trying fetch approach...');
      this.loadFromUrlViaFetch(url);
    };

    img.src = cacheBustedUrl;
  }

  private loadFromUrlViaFetch(url: string) {
    // Fetch the image as blob to bypass CORS restrictions
    fetch(url, {
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            this.loadImageFromDataUrl(dataUrl);
          } else {
            this.tryFallbackLoad(url);
          }
        };
        reader.onerror = () => {
          this.tryFallbackLoad(url);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        this.tryFallbackLoad(url);
      });
  }

  private tryFallbackLoad(url: string) {
    // Final fallback: load without crossOrigin (won't be able to export, but at least shows the image)
    console.warn('Trying fallback load without CORS...');
    const img = new Image();

    img.onload = () => {
      this.originalImage = img;
      this.ngZone.run(() => this.onImageLoaded());
    };

    img.onerror = () => {
      this.ngZone.run(() => this.handleLoadError('Failed to load image. Please try uploading the image file directly.'));
    };

    img.src = url;
  }

  private loadImageFromDataUrl(dataUrl: string) {
    const img = new Image();

    img.onload = () => {
      this.originalImage = img;
      this.onImageLoaded();
    };

    img.onerror = () => {
      this.handleLoadError('Failed to decode image');
    };

    img.src = dataUrl;
  }

  private onImageLoaded() {
    this.imageLoaded = true;
    this.loading = false;
    this.cdr.detectChanges();

    // Wait for Angular to render the container before initializing canvas
    setTimeout(() => {
      this.initializeCanvas();
      this.initializeCropBox();
      this.draw();
      this.cdr.detectChanges();
    }, 50);
  }

  private handleLoadError(message: string) {
    this.loading = false;
    this.loadError = message;
    this.cdr.detectChanges();
    console.error('Image Editor:', message);
  }

  private initializeCanvas() {
    if (!this.originalImage) {
      console.error('Image Editor: No original image');
      return;
    }

    // Get container dimensions - use fallback if container not available
    let maxWidth = 800;
    let maxHeight = 500;

    if (this.containerRef?.nativeElement) {
      const container = this.containerRef.nativeElement;
      const rect = container.getBoundingClientRect();
      maxWidth = Math.max(rect.width - 64, 400);
      maxHeight = Math.max(rect.height - 64, 300);
    }

    // Clamp to reasonable maximums
    maxWidth = Math.min(maxWidth, 1200);
    maxHeight = Math.min(maxHeight, 800);

    const imgWidth = this.originalImage.width;
    const imgHeight = this.originalImage.height;

    // Calculate scale to fit in container
    const scaleX = maxWidth / imgWidth;
    const scaleY = maxHeight / imgHeight;
    this.scale = Math.min(scaleX, scaleY, 1);

    this.canvasWidth = Math.round(imgWidth * this.scale);
    this.canvasHeight = Math.round(imgHeight * this.scale);

    // Ensure minimum dimensions
    this.canvasWidth = Math.max(this.canvasWidth, 200);
    this.canvasHeight = Math.max(this.canvasHeight, 150);
  }

  private initializeCropBox() {
    if (this.initialCropData) {
      this.cropBox = {
        x: this.initialCropData.x * this.scale,
        y: this.initialCropData.y * this.scale,
        width: this.initialCropData.width * this.scale,
        height: this.initialCropData.height * this.scale
      };
    } else {
      // Default to center 80% of image
      const margin = 0.1;
      this.cropBox = {
        x: this.canvasWidth * margin,
        y: this.canvasHeight * margin,
        width: this.canvasWidth * (1 - margin * 2),
        height: this.canvasHeight * (1 - margin * 2)
      };
    }

    this.applyAspectRatio();
  }

  private setupEventListeners() {
    document.addEventListener('mousemove', this.boundMouseMove);
    document.addEventListener('mouseup', this.boundMouseUp);
    document.addEventListener('keydown', this.boundKeyDown);
  }

  private removeEventListeners() {
    document.removeEventListener('mousemove', this.boundMouseMove);
    document.removeEventListener('mouseup', this.boundMouseUp);
    document.removeEventListener('keydown', this.boundKeyDown);
  }

  private draw() {
    if (!this.canvasRef || !this.originalImage) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image
    ctx.drawImage(this.originalImage, 0, 0, canvas.width, canvas.height);

    // Restore context
    ctx.restore();

    // Draw crop overlay
    if (this.cropMode) {
      this.drawCropOverlay(ctx);
    }
  }

  private drawCropOverlay(ctx: CanvasRenderingContext2D) {
    const { x, y, width, height } = this.cropBox;

    // Semi-transparent overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, this.canvasWidth, y); // Top
    ctx.fillRect(0, y + height, this.canvasWidth, this.canvasHeight - y - height); // Bottom
    ctx.fillRect(0, y, x, height); // Left
    ctx.fillRect(x + width, y, this.canvasWidth - x - width, height); // Right

    // Crop border
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    const thirdW = width / 3;
    const thirdH = height / 3;
    ctx.beginPath();
    ctx.moveTo(x + thirdW, y);
    ctx.lineTo(x + thirdW, y + height);
    ctx.moveTo(x + thirdW * 2, y);
    ctx.lineTo(x + thirdW * 2, y + height);
    ctx.moveTo(x, y + thirdH);
    ctx.lineTo(x + width, y + thirdH);
    ctx.moveTo(x, y + thirdH * 2);
    ctx.lineTo(x + width, y + thirdH * 2);
    ctx.stroke();

    // Resize handles
    const handleSize = 10;
    ctx.fillStyle = '#ffffff';
    const handles = [
      { x: x - handleSize / 2, y: y - handleSize / 2, cursor: 'nw' },
      { x: x + width / 2 - handleSize / 2, y: y - handleSize / 2, cursor: 'n' },
      { x: x + width - handleSize / 2, y: y - handleSize / 2, cursor: 'ne' },
      { x: x - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: 'w' },
      { x: x + width - handleSize / 2, y: y + height / 2 - handleSize / 2, cursor: 'e' },
      { x: x - handleSize / 2, y: y + height - handleSize / 2, cursor: 'sw' },
      { x: x + width / 2 - handleSize / 2, y: y + height - handleSize / 2, cursor: 's' },
      { x: x + width - handleSize / 2, y: y + height - handleSize / 2, cursor: 'se' }
    ];

    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
    });
  }

  onCanvasMouseDown(event: MouseEvent) {
    if (!this.cropMode) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check if clicking on resize handle
    const handle = this.getResizeHandle(x, y);
    if (handle) {
      this.isResizing = true;
      this.resizeHandle = handle;
    } else if (this.isInsideCropBox(x, y)) {
      this.isDragging = true;
    }

    this.dragStart = { x, y };
    this.cropStart = { ...this.cropBox };
  }

  private onMouseMove(event: MouseEvent) {
    if (!this.canvasRef) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (this.isDragging) {
      const dx = x - this.dragStart.x;
      const dy = y - this.dragStart.y;

      this.cropBox.x = Math.max(0, Math.min(this.canvasWidth - this.cropBox.width, this.cropStart.x + dx));
      this.cropBox.y = Math.max(0, Math.min(this.canvasHeight - this.cropBox.height, this.cropStart.y + dy));

      this.draw();
    } else if (this.isResizing) {
      this.handleResize(x, y);
      this.draw();
    } else {
      // Update cursor
      const handle = this.getResizeHandle(x, y);
      if (handle) {
        this.canvasRef.nativeElement.style.cursor = this.getCursorForHandle(handle);
      } else if (this.isInsideCropBox(x, y)) {
        this.canvasRef.nativeElement.style.cursor = 'move';
      } else {
        this.canvasRef.nativeElement.style.cursor = 'crosshair';
      }
    }
  }

  private onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
    this.resizeHandle = '';
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.onCancel();
    }
  }

  private getResizeHandle(x: number, y: number): string {
    const handleSize = 12;
    const { x: cx, y: cy, width, height } = this.cropBox;

    const handles: { [key: string]: { x: number; y: number } } = {
      'nw': { x: cx, y: cy },
      'n': { x: cx + width / 2, y: cy },
      'ne': { x: cx + width, y: cy },
      'w': { x: cx, y: cy + height / 2 },
      'e': { x: cx + width, y: cy + height / 2 },
      'sw': { x: cx, y: cy + height },
      's': { x: cx + width / 2, y: cy + height },
      'se': { x: cx + width, y: cy + height }
    };

    for (const [name, pos] of Object.entries(handles)) {
      if (Math.abs(x - pos.x) < handleSize && Math.abs(y - pos.y) < handleSize) {
        return name;
      }
    }

    return '';
  }

  private getCursorForHandle(handle: string): string {
    const cursors: { [key: string]: string } = {
      'nw': 'nw-resize', 'n': 'n-resize', 'ne': 'ne-resize',
      'w': 'w-resize', 'e': 'e-resize',
      'sw': 'sw-resize', 's': 's-resize', 'se': 'se-resize'
    };
    return cursors[handle] || 'default';
  }

  private isInsideCropBox(x: number, y: number): boolean {
    return x >= this.cropBox.x && x <= this.cropBox.x + this.cropBox.width &&
           y >= this.cropBox.y && y <= this.cropBox.y + this.cropBox.height;
  }

  private handleResize(x: number, y: number) {
    const dx = x - this.dragStart.x;
    const dy = y - this.dragStart.y;
    const aspectRatio = this.getAspectRatioValue();

    let newBox = { ...this.cropStart };

    switch (this.resizeHandle) {
      case 'se':
        newBox.width = Math.max(50, this.cropStart.width + dx);
        newBox.height = aspectRatio ? newBox.width / aspectRatio : Math.max(50, this.cropStart.height + dy);
        break;
      case 'sw':
        newBox.width = Math.max(50, this.cropStart.width - dx);
        newBox.x = this.cropStart.x + this.cropStart.width - newBox.width;
        newBox.height = aspectRatio ? newBox.width / aspectRatio : Math.max(50, this.cropStart.height + dy);
        break;
      case 'ne':
        newBox.width = Math.max(50, this.cropStart.width + dx);
        newBox.height = aspectRatio ? newBox.width / aspectRatio : Math.max(50, this.cropStart.height - dy);
        newBox.y = aspectRatio ? this.cropStart.y + this.cropStart.height - newBox.height : this.cropStart.y + this.cropStart.height - newBox.height;
        break;
      case 'nw':
        newBox.width = Math.max(50, this.cropStart.width - dx);
        newBox.height = aspectRatio ? newBox.width / aspectRatio : Math.max(50, this.cropStart.height - dy);
        newBox.x = this.cropStart.x + this.cropStart.width - newBox.width;
        newBox.y = this.cropStart.y + this.cropStart.height - newBox.height;
        break;
      case 'n':
        newBox.height = Math.max(50, this.cropStart.height - dy);
        newBox.y = this.cropStart.y + this.cropStart.height - newBox.height;
        if (aspectRatio) newBox.width = newBox.height * aspectRatio;
        break;
      case 's':
        newBox.height = Math.max(50, this.cropStart.height + dy);
        if (aspectRatio) newBox.width = newBox.height * aspectRatio;
        break;
      case 'e':
        newBox.width = Math.max(50, this.cropStart.width + dx);
        if (aspectRatio) newBox.height = newBox.width / aspectRatio;
        break;
      case 'w':
        newBox.width = Math.max(50, this.cropStart.width - dx);
        newBox.x = this.cropStart.x + this.cropStart.width - newBox.width;
        if (aspectRatio) newBox.height = newBox.width / aspectRatio;
        break;
    }

    // Constrain to canvas bounds
    newBox.x = Math.max(0, newBox.x);
    newBox.y = Math.max(0, newBox.y);
    newBox.width = Math.min(newBox.width, this.canvasWidth - newBox.x);
    newBox.height = Math.min(newBox.height, this.canvasHeight - newBox.y);

    this.cropBox = newBox;
  }

  private getAspectRatioValue(): number {
    if (this.selectedAspect === 'free') return 0;
    return ASPECT_RATIOS[this.selectedAspect as keyof typeof ASPECT_RATIOS]?.value || 0;
  }

  private applyAspectRatio() {
    const ratio = this.getAspectRatioValue();
    if (!ratio) return;

    // Adjust crop box to match aspect ratio
    const currentRatio = this.cropBox.width / this.cropBox.height;

    if (currentRatio > ratio) {
      // Too wide, reduce width
      this.cropBox.width = this.cropBox.height * ratio;
    } else {
      // Too tall, reduce height
      this.cropBox.height = this.cropBox.width / ratio;
    }

    this.draw();
  }

  // Public methods for UI controls
  onAspectChange(aspect: string) {
    this.selectedAspect = aspect;
    this.applyAspectRatio();
  }

  rotateLeft() {
    this.rotation = (this.rotation - 90) % 360;
    this.draw();
  }

  rotateRight() {
    this.rotation = (this.rotation + 90) % 360;
    this.draw();
  }

  flipHorizontal() {
    this.flipH = !this.flipH;
    this.draw();
  }

  flipVertical() {
    this.flipV = !this.flipV;
    this.draw();
  }

  zoomIn() {
    this.zoom = Math.min(3, this.zoom + 0.1);
    this.draw();
  }

  zoomOut() {
    this.zoom = Math.max(0.5, this.zoom - 0.1);
    this.draw();
  }

  resetZoom() {
    this.zoom = 1;
    this.draw();
  }

  reset() {
    this.rotation = 0;
    this.zoom = 1;
    this.flipH = false;
    this.flipV = false;
    this.initializeCropBox();
    this.draw();
  }

  togglePreview() {
    this.showPreview = !this.showPreview;
    if (this.showPreview) {
      this.generatePreview();
    }
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  onOverlayClick(event: MouseEvent) {
    // Close editor if clicking on the overlay background (not the content)
    if ((event.target as HTMLElement).classList.contains('image-editor-overlay')) {
      this.onCancel();
    }
  }

  onZoomSliderChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.zoom = parseInt(input.value, 10) / 100;
    this.draw();
  }

  private generatePreview() {
    if (!this.previewCanvasRef || !this.originalImage) return;

    const canvas = this.previewCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate actual crop dimensions (in original image coordinates)
    const cropData = this.getCropData();

    canvas.width = cropData.width;
    canvas.height = cropData.height;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    ctx.drawImage(
      this.originalImage,
      cropData.x, cropData.y, cropData.width, cropData.height,
      0, 0, canvas.width, canvas.height
    );

    ctx.restore();
  }

  private getCropData(): CropData {
    // Ensure scale is valid (avoid division by zero)
    const safeScale = this.scale > 0 ? this.scale : 1;

    // Calculate raw crop values
    let x = Math.round(this.cropBox.x / safeScale);
    let y = Math.round(this.cropBox.y / safeScale);
    let width = Math.round(this.cropBox.width / safeScale);
    let height = Math.round(this.cropBox.height / safeScale);

    // Get original image dimensions
    const imgWidth = this.originalImage?.width || width;
    const imgHeight = this.originalImage?.height || height;

    // Validate and clamp coordinates to image bounds
    x = Math.max(0, Math.min(x, imgWidth - 1));
    y = Math.max(0, Math.min(y, imgHeight - 1));

    // Ensure width and height are at least 1 and don't exceed image bounds
    width = Math.max(1, Math.min(width, imgWidth - x));
    height = Math.max(1, Math.min(height, imgHeight - y));

    return {
      x,
      y,
      width,
      height,
      aspect: this.selectedAspect
    };
  }

  private async generateEditedFile(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!this.originalImage) {
        reject(new Error('No image loaded'));
        return;
      }

      const cropData = this.getCropData();

      // Validate crop data
      if (cropData.width <= 0 || cropData.height <= 0) {
        reject(new Error('Invalid crop dimensions'));
        return;
      }

      if (cropData.x < 0 || cropData.y < 0) {
        reject(new Error('Invalid crop coordinates'));
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Ensure canvas dimensions are valid positive integers
      canvas.width = Math.max(1, Math.round(cropData.width));
      canvas.height = Math.max(1, Math.round(cropData.height));

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      ctx.drawImage(
        this.originalImage,
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, canvas.width, canvas.height
      );

      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          // Generate filename - handle both file and URL cases
          let baseName = 'image';
          if (this.imageFile?.name) {
            baseName = this.imageFile.name.replace(/\.[^/.]+$/, '');
          } else if (this.imageUrl) {
            // Extract filename from URL if possible
            const urlParts = this.imageUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1].split('?')[0];
            if (lastPart && lastPart.includes('.')) {
              baseName = lastPart.replace(/\.[^/.]+$/, '');
            }
          }
          const fileName = baseName + '_edited.jpg';
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          resolve(file);
        } else {
          reject(new Error('Could not generate image blob'));
        }
      }, 'image/jpeg', 0.92);
    });
  }

  async onSave() {
    try {
      const editedFile = await this.generateEditedFile();
      const cropData = this.getCropData();

      this.save.emit({
        file: editedFile,
        cropData,
        rotation: this.rotation
      });
    } catch (error) {
      console.error('Error saving edited image:', error);
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onSkipEdit() {
    // Emit the original file without any editing
    if (this.imageFile) {
      this.skipEdit.emit(this.imageFile);
    }
  }

  // Helper methods for template
  get cropDimensions(): string {
    const data = this.getCropData();
    return `${data.width} × ${data.height} px`;
  }

  get rotationLabel(): string {
    return `${this.rotation}°`;
  }

  get zoomLabel(): string {
    return `${Math.round(this.zoom * 100)}%`;
  }
}
