export interface Location {
  id: number;
  name: string;
  slug?: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  category: 'beach' | 'mountain' | 'cultural' | 'wildlife' | 'city';
  region: 'north' | 'south' | 'east' | 'west' | 'central';
  activities: string[];
  bestTimeToVisit: string;
  rating: number;
  featured: boolean;
  highlights: string[];
  additionalDetails?: { [key: string]: any };
}
