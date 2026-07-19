export type PricingType = 'PER_PERSON' | 'GROUP' | 'FULL_EVENT';

export interface PackageLocation {
  id?: number;
  locationRefId?: number;
  name: string;
  description?: string;
  visitOrder: number;
  durationHere?: string;
  createdAt?: string;
}

export interface PackagePricing {
  id?: number;
  currencyCode: string;
  amount: number;
  pricingType: PricingType;
  groupSize?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  label?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  category: 'cultural' | 'adventure' | 'food' | 'festival' | 'tour';
  location: string;
  packageLocations: PackageLocation[];
  pricings: PackagePricing[];
  dates: PackageDate[];
  price: number;
  duration: string;
  maxParticipants: number;
  availableSpots: number;
  included: string[];
  requirements: string[];
  rating: number;
  featured: boolean;
  displayOrder: number;
  additionalDetails?: { [key: string]: any };
}

export interface PackageDate {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  availableSpots: number;
}

export interface PackageBooking {
  id?: number;
  packageId: number;
  packageDateId: number;
  participantName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  specialRequests?: string;
  totalPrice: number;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}
