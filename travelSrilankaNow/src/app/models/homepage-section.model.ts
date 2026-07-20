export interface HomepageSection {
  id?: number;
  sectionType: 'HERO_SLIDER' | 'FEATURED_LOCATIONS' | 'UPCOMING_EVENTS' | 'PLACES' | 'SOCIAL_MEDIA' | 'IMAGE_GALLERY_SLIDER' | 'CUSTOM_CONTENT' | 'PACKAGES';
  title: string;
  subtitle?: string;
  displayOrder: number;
  isActive: boolean;
  config?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HomepageSectionConfig {
  autoPlay?: boolean;
  displayDuration?: number;
  itemsCount?: number;
  showViewAll?: boolean;
}

export type GalleryStyle = 'slider' | 'masonry' | 'bento' | 'grid-tilt';

export interface GallerySliderConfig {
  images: GallerySliderImage[];
  speed: number;
  pauseOnHover: boolean;
  galleryStyle?: GalleryStyle;   // defaults to 'slider' when absent
  columns?: 2 | 3 | 4;          // masonry / grid-tilt column count
  gap?: 'tight' | 'normal' | 'wide';
  showTitles?: boolean;          // show image title overlay on hover
}

export interface GallerySliderImage {
  url: string;
  title?: string;
  sourceType?: string;
  sourceId?: number;
}

export interface CustomContentConfig {
  // Background & layout
  backgroundImage?: string;
  backgroundColor?: string;
  template?: 'minimal' | 'dark' | 'image-overlay' | 'split';
  minHeight?: string;
  padding?: string;
  verticalAlign?: 'top' | 'center' | 'bottom';
  backgroundEffect?: 'cover' | 'parallax' | 'contain' | 'tile';
  overlayColor?: string;
  overlayOpacity?: number;
  // Title
  title?: string;
  titleColor?: string;
  titleAlign?: 'left' | 'center' | 'right';
  titleSize?: string;
  // Description
  description?: string;
  descriptionColor?: string;
  descriptionAlign?: 'left' | 'center' | 'right';
  // CTA Button
  buttonText?: string;
  buttonUrl?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  // Split-layout specific
  splitImage?: string;           // image shown in the image column
  splitImagePosition?: 'left' | 'right';  // which side the image is on
  splitImageAlt?: string;
  // Legacy rich-text fallback (kept for backward compatibility)
  content?: string;
  textColor?: string;
  textAlign?: string;
}
