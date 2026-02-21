export interface HeroSlide {
  id?: number;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonText?: string;
  buttonLink?: string;
  displayOrder: number;
  active: boolean;
  displayDuration: number; // Duration in milliseconds
  createdAt?: string;
  updatedAt?: string;
}
