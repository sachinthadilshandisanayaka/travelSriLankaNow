export type PageType = 'LOCATIONS' | 'EVENTS' | 'GALLERY' | 'PLACES';

export interface PageHeaderBackground {
  id?: number;
  pageType: PageType;
  imageUrl: string;
  title?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}
