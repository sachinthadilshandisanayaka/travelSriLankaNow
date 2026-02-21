export interface Event {
  id: number;
  title: string;
  description: string;
  shortDescription: string;
  imageUrl: string;
  category: 'cultural' | 'adventure' | 'food' | 'festival' | 'tour';
  location: string;
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
