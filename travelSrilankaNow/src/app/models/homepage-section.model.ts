export interface HomepageSection {
  id?: number;
  sectionType: 'HERO_SLIDER' | 'FEATURED_LOCATIONS' | 'UPCOMING_EVENTS' | 'PLACES' | 'SOCIAL_MEDIA' | 'IMAGE_GALLERY_SLIDER' | 'CUSTOM_CONTENT';
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

export interface GallerySliderConfig {
  images: GallerySliderImage[];
  speed: number;
  pauseOnHover: boolean;
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
  // Legacy rich-text fallback (kept for backward compatibility)
  content?: string;
  textColor?: string;
  textAlign?: string;
}
