export interface SocialMediaContent {
  id?: number;
  platform: 'INSTAGRAM' | 'FACEBOOK' | 'TWITTER' | 'YOUTUBE' | 'TIKTOK';
  url: string;
  thumbnailUrl: string;
  title?: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
