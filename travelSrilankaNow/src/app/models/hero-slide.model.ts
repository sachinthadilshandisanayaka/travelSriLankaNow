export interface HeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  mediaType?: 'image' | 'video'; // defaults to 'image'
  videoUrl?: string;             // direct MP4/WebM URL when mediaType = 'video'
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  active: boolean;
  displayDuration: number; // Duration in milliseconds
  createdAt?: string;
  updatedAt?: string;
}
