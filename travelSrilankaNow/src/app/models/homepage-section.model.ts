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
  backgroundImage?: string;
  backgroundColor?: string;
  content?: string;
  template?: 'minimal' | 'dark' | 'image-overlay' | 'split';
  textColor?: string;
  textAlign?: string;
}
