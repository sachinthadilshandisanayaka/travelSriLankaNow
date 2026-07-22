export type PricingType = 'PER_PERSON' | 'GROUP' | 'FULL_EVENT';

export interface EventLocation {
  id?: number;
  locationRefId?: number;
  name: string;
  description?: string;
  visitOrder: number;
  durationHere?: string;
}

export interface EventPricing {
  id?: number;
  currencyCode: string;
  amount: number;
  pricingType: PricingType;
  groupSize?: number;
  label?: string;
  isPrimary: boolean;
  displayOrder: number;
}

export interface Event {
  id: number;
  title: string;
  slug?: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  images: string[];
  category: 'cultural' | 'adventure' | 'food' | 'festival' | 'tour';
  location: string;
  eventLocations: EventLocation[];
  pricings: EventPricing[];
  dates: EventDate[];
  price: number;
  duration: string;
  maxParticipants: number;
  availableSpots: number;
  included: string[];
  requirements: string[];
  rating: number;
  featured: boolean;
  type: string;
  name: string;
  additionalDetails?: { [key: string]: any };
}

export interface EventDate {
  id: number;
  date: Date;
  startTime: string;
  endTime: string;
  availableSpots: number;
}

export interface EventBooking {
  id?: number;
  eventId: number;
  eventDateId: number;
  participantName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  specialRequests?: string;
  totalPrice: number;
  bookingDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled';
}
