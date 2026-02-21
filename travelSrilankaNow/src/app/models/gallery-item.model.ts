export interface GalleryItem {
  id: number;
  type: 'image' | 'video';
  url: string;
  thumbnailUrl: string;
  title: string;
  description?: string;
  category: 'beach' | 'mountain' | 'cultural' | 'wildlife' | 'food' | 'people' | 'architecture';
  location?: string;
  tags: string[];
  photographer?: string;
  uploadDate: Date;
  featured: boolean;
}
