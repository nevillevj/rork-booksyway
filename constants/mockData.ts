export interface AccommodationDetails {
  id: string;
  name: string;
  location: string;
  fullAddress: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  images: string[];
  amenities: string[];
  type: 'hotel' | 'apartment' | 'villa' | 'hostel';
  distance: string;
  description: string;
  hostName: string;
  hostImage: string;
  hostJoinedYear: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  hasFreeCancellation: boolean;
  maxGuests: number;
  bedrooms?: number;
  bathrooms?: number;
  reviews: Review[];
  coordinates: {
    latitude: number;
    longitude: number;
  };
  highlights: string[];
  nearbyAttractions: NearbyAttraction[];
  roomTypes: RoomType[];
}

export interface Review {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  categories: {
    cleanliness: number;
    communication: number;
    checkIn: number;
    accuracy: number;
    location: number;
    value: number;
  };
}

export interface NearbyAttraction {
  name: string;
  distance: string;
  type: 'restaurant' | 'attraction' | 'transport' | 'shopping';
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  maxGuests: number;
  price: number;
  images: string[];
  amenities: string[];
  available: boolean;
}

export const MOCK_ACCOMMODATIONS: AccommodationDetails[] = [
  {
    id: '1',
    name: 'Grand Hotel Central',
    location: 'City Center, Paris',
    fullAddress: '123 Rue de Rivoli, 75001 Paris, France',
    rating: 4.8,
    reviewCount: 1247,
    price: 189,
    originalPrice: 220,
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
    ],
    amenities: ['wifi', 'parking', 'breakfast', 'pool', 'gym', 'spa', 'room-service', 'concierge', 'bar', 'restaurant'],
    type: 'hotel',
    distance: '0.5 km from center',
    description: 'Experience luxury in the heart of Paris at Grand Hotel Central. Our elegant rooms offer stunning city views, premium amenities, and exceptional service. Located just steps from the Louvre and major attractions, this is the perfect base for your Parisian adventure. Enjoy our rooftop restaurant, spa services, and 24-hour concierge to make your stay unforgettable.',
    hostName: 'Hotel Management',
    hostImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    hostJoinedYear: 2015,
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    cancellationPolicy: 'Free cancellation until 24 hours before check-in',
    hasFreeCancellation: true,
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    coordinates: {
      latitude: 48.8566,
      longitude: 2.3522,
    },
    highlights: [
      'Prime location in city center',
      'Rooftop restaurant with panoramic views',
      'Full-service spa and wellness center',
      '24/7 concierge service',
      'Historic building with modern amenities'
    ],
    nearbyAttractions: [
      { name: 'Louvre Museum', distance: '0.3 km', type: 'attraction' },
      { name: 'Tuileries Garden', distance: '0.2 km', type: 'attraction' },
      { name: 'Châtelet Metro Station', distance: '0.1 km', type: 'transport' },
      { name: 'Le Grand Véfour', distance: '0.2 km', type: 'restaurant' },
      { name: 'Rue de Rivoli Shopping', distance: '0.1 km', type: 'shopping' },
    ],
    roomTypes: [
      {
        id: 'deluxe',
        name: 'Deluxe Room',
        description: 'Spacious room with city view and premium amenities',
        maxGuests: 2,
        price: 189,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
        ],
        amenities: ['wifi', 'minibar', 'safe', 'air-conditioning'],
        available: true,
      },
      {
        id: 'suite',
        name: 'Executive Suite',
        description: 'Luxurious suite with separate living area and panoramic views',
        maxGuests: 4,
        price: 320,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
          'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
        ],
        amenities: ['wifi', 'minibar', 'safe', 'air-conditioning', 'living-area', 'balcony'],
        available: true,
      },
    ],
    reviews: [
      {
        id: '1',
        userName: 'Sarah Johnson',
        userImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Absolutely amazing stay! The location is perfect, staff is incredibly friendly, and the rooms are beautiful. The breakfast was outstanding. Will definitely stay here again!',
        date: '2024-01-15',
        helpful: 12,
        categories: {
          cleanliness: 5,
          communication: 5,
          checkIn: 5,
          accuracy: 5,
          location: 5,
          value: 4,
        },
      },
      {
        id: '2',
        userName: 'Michael Chen',
        userImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face',
        rating: 4,
        comment: 'Great hotel with excellent service. The room was clean and comfortable. Only minor issue was the WiFi was a bit slow, but overall a wonderful experience.',
        date: '2024-01-10',
        helpful: 8,
        categories: {
          cleanliness: 5,
          communication: 4,
          checkIn: 4,
          accuracy: 4,
          location: 5,
          value: 4,
        },
      },
      {
        id: '3',
        userName: 'Emma Wilson',
        userImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Perfect location for exploring Paris! Walking distance to all major attractions. The concierge was extremely helpful with restaurant recommendations.',
        date: '2024-01-05',
        helpful: 15,
        categories: {
          cleanliness: 5,
          communication: 5,
          checkIn: 5,
          accuracy: 5,
          location: 5,
          value: 5,
        },
      },
      {
        id: '4',
        userName: 'David Rodriguez',
        userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face',
        rating: 4,
        comment: 'Beautiful hotel with great amenities. The spa was fantastic and the rooftop restaurant has amazing views. Highly recommend for a romantic getaway.',
        date: '2023-12-28',
        helpful: 9,
        categories: {
          cleanliness: 4,
          communication: 4,
          checkIn: 5,
          accuracy: 4,
          location: 5,
          value: 4,
        },
      },
    ],
  },
  {
    id: '2',
    name: 'Cozy Apartment Montmartre',
    location: 'Montmartre, Paris',
    fullAddress: '45 Rue des Abbesses, 75018 Paris, France',
    rating: 4.6,
    reviewCount: 324,
    price: 95,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
    ],
    amenities: ['wifi', 'kitchen', 'washer', 'heating'],
    type: 'apartment',
    distance: '2.1 km from center',
    description: 'Charming apartment in the heart of Montmartre, perfect for couples or solo travelers. Enjoy authentic Parisian living with modern comforts. Walking distance to Sacré-Cœur and local cafés.',
    hostName: 'Marie Dubois',
    hostImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    hostJoinedYear: 2018,
    checkInTime: '4:00 PM',
    checkOutTime: '10:00 AM',
    cancellationPolicy: 'Moderate cancellation policy',
    hasFreeCancellation: false,
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    coordinates: {
      latitude: 48.8846,
      longitude: 2.3376,
    },
    highlights: [
      'Authentic Montmartre experience',
      'Walking distance to Sacré-Cœur',
      'Fully equipped kitchen',
      'Quiet residential street',
      'Local cafés and bistros nearby'
    ],
    nearbyAttractions: [
      { name: 'Sacré-Cœur Basilica', distance: '0.4 km', type: 'attraction' },
      { name: 'Place du Tertre', distance: '0.3 km', type: 'attraction' },
      { name: 'Abbesses Metro Station', distance: '0.1 km', type: 'transport' },
      { name: 'Le Consulat', distance: '0.2 km', type: 'restaurant' },
    ],
    roomTypes: [
      {
        id: 'entire-place',
        name: 'Entire Apartment',
        description: 'Cozy one-bedroom apartment with full kitchen and living area',
        maxGuests: 2,
        price: 95,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        ],
        amenities: ['wifi', 'kitchen', 'washer', 'heating'],
        available: true,
      },
    ],
    reviews: [
      {
        id: '5',
        userName: 'Lisa Thompson',
        userImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face',
        rating: 5,
        comment: 'Perfect location in Montmartre! Marie was a wonderful host and the apartment had everything we needed. Loved the authentic Parisian feel.',
        date: '2024-01-20',
        helpful: 7,
        categories: {
          cleanliness: 5,
          communication: 5,
          checkIn: 5,
          accuracy: 5,
          location: 5,
          value: 5,
        },
      },
    ],
  },
];

export const AMENITY_ICONS: Record<string, any> = {
  wifi: 'Wifi',
  parking: 'Car',
  breakfast: 'Coffee',
  pool: '🏊',
  kitchen: '🍳',
  washer: '🧺',
  'room-service': '🛎️',
  spa: '💆',
  concierge: '🛎️',
  gym: '💪',
  bar: '🍸',
  restaurant: '🍽️',
  minibar: '🍾',
  safe: '🔒',
  'air-conditioning': '❄️',
  heating: '🔥',
  'living-area': '🛋️',
  balcony: '🏡',
};

export const ATTRACTION_ICONS: Record<string, string> = {
  restaurant: '🍽️',
  attraction: '🏛️',
  transport: '🚇',
  shopping: '🛍️',
};