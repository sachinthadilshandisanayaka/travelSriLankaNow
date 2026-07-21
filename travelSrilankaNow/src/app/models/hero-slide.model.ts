export interface SlideTextStyle {
  fontFamily?: string;
  fontSize?: string;      // e.g. "3.5rem"
  fontWeight?: string;
  color?: string;
  textShadow?: string;
  letterSpacing?: string;
  textTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: string;
  // Outline / stroke
  textStroke?: string;    // e.g. "2px #ffffff"
  fillMode?: 'filled' | 'hollow' | 'semi'; // hollow = color:transparent
}

export interface GalleryImage {
  imageUrl: string;
  label: string;
  link: string;
  contentType: string;
}

export interface HeroSlideGalleryItem {
  id?: number;
  contentType: string;
  contentId: number;
  imageUrl: string;
  label: string;
  link: string;
  displayOrder: number;
}

export interface HeroSlideGallery {
  id?: number;
  heroSlideId?: number;
  enabled: boolean;
  items: HeroSlideGalleryItem[];
}

export interface ContentTypeInfo {
  key: string;
  displayName: string;
  icon: string;
}

export interface ContentItem {
  id: number;
  name: string;
  imageUrl: string;
  link: string;
}

export interface HeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  videoUrl?: string;
  titleStyle?: SlideTextStyle;
  subtitleStyle?: SlideTextStyle;
  contentAlign?: 'left' | 'center' | 'right';
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  active: boolean;
  displayDuration: number;
  createdAt?: string;
  updatedAt?: string;
  galleryImages?: GalleryImage[];
}

export interface HeroSearchTab {
  key: 'packages' | 'events' | 'locations' | 'places';
  label: string;
  enabled: boolean;
  categoryLabel?: string;
}

export interface HeroSearchConfig {
  enabled: boolean;
  searchButtonText?: string;
  tabs: HeroSearchTab[];
}
