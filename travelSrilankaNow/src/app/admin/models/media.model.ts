/**
 * Enum representing different types/usages of media files.
 */
export enum MediaType {
  HERO_SLIDE = 'HERO_SLIDE',
  PAGE_HEADER = 'PAGE_HEADER',
  LOCATION = 'LOCATION',
  LOCATION_GALLERY = 'LOCATION_GALLERY',
  EVENT = 'EVENT',
  PLACE = 'PLACE',
  PLACE_GALLERY = 'PLACE_GALLERY',
  GALLERY = 'GALLERY',
  GENERAL = 'GENERAL'
}

/**
 * Interface representing a media file in the system.
 */
export interface Media {
  id: number;
  originalFilename: string;
  publicId: string;
  url: string;
  optimizedUrl?: string;
  thumbnailUrl?: string;
  mediumUrl?: string;
  mediaType: MediaType;
  format?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  altText?: string;
  caption?: string;
  folder?: string;
  entityReference?: string;
  isActive: boolean;
  sortOrder: number;
  cropData?: string;
  transformationData?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for upload progress tracking.
 */
export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  media?: Media;
  error?: string;
}

/**
 * Interface for crop data.
 */
export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspect?: string;
}

/**
 * Interface for transformation data.
 */
export interface TransformationData {
  rotate?: number;
  cropData?: CropData;
  filters?: string[];
}

/**
 * Interface for media upload options.
 */
export interface MediaUploadOptions {
  mediaType: MediaType;
  altText?: string;
  caption?: string;
  cropData?: CropData;
  rotate?: number;
}

/**
 * Interface for image editor state.
 */
export interface ImageEditorState {
  originalImage: string;
  editedImage?: string;
  cropData?: CropData;
  rotation: number;
  zoom: number;
  brightness: number;
  contrast: number;
}

/**
 * Aspect ratio presets for cropping.
 */
export const ASPECT_RATIOS = {
  'free': { label: 'Free', value: 0 },
  '1:1': { label: 'Square (1:1)', value: 1 },
  '4:3': { label: 'Standard (4:3)', value: 4 / 3 },
  '16:9': { label: 'Widescreen (16:9)', value: 16 / 9 },
  '3:2': { label: 'Photo (3:2)', value: 3 / 2 },
  '21:9': { label: 'Ultra Wide (21:9)', value: 21 / 9 },
  '9:16': { label: 'Portrait (9:16)', value: 9 / 16 },
  '2:3': { label: 'Portrait Photo (2:3)', value: 2 / 3 }
};

/**
 * Recommended aspect ratios by media type.
 */
export const RECOMMENDED_ASPECTS: Record<MediaType, string[]> = {
  [MediaType.HERO_SLIDE]: ['16:9', '21:9'],
  [MediaType.PAGE_HEADER]: ['16:9', '21:9'],
  [MediaType.LOCATION]: ['4:3', '3:2', '16:9'],
  [MediaType.LOCATION_GALLERY]: ['4:3', '3:2', '1:1'],
  [MediaType.EVENT]: ['16:9', '4:3'],
  [MediaType.PLACE]: ['4:3', '3:2', '16:9'],
  [MediaType.PLACE_GALLERY]: ['4:3', '3:2', '1:1'],
  [MediaType.GALLERY]: ['free', '4:3', '3:2', '1:1'],
  [MediaType.GENERAL]: ['free']
};

/**
 * Media storage statistics.
 */
export interface MediaStats {
  totalStorageBytes: number;
  totalStorageMB: number;
  countByType: Record<string, number>;
}
