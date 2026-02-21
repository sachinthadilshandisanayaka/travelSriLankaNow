export interface HomepageSection {
  id?: number;
  sectionType: 'HERO_SLIDER' | 'FEATURED_LOCATIONS' | 'UPCOMING_EVENTS' | 'PLACES' | 'SOCIAL_MEDIA';
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
