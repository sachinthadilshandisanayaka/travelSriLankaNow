export interface Place {
  id: number;
  name: string;
  type: 'hotel' | 'restaurant' | 'cafe' | 'guesthouse' | 'resort';
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  location: string;
  region: 'north' | 'south' | 'east' | 'west' | 'central';
  rating: number;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  price?: number;
  cuisine?: string[];
  amenities: string[];
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  openingHours?: string;
  featured: boolean;
  additionalDetails?: { [key: string]: any };
}
