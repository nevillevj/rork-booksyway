import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  SlidersHorizontal,
  Wifi,
  Car,
  Coffee,
  X,
} from 'lucide-react-native';

interface Accommodation {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  amenities: string[];
  type: 'hotel' | 'apartment' | 'villa' | 'hostel';
  distance: string;
  isFavorite: boolean;
  isPopular?: boolean;
  hasFreeCancellation?: boolean;
}

interface FilterOptions {
  priceRange: [number, number];
  rating: number;
  amenities: string[];
  propertyType: string[];
}

const MOCK_ACCOMMODATIONS: Accommodation[] = [
  {
    id: '1',
    name: 'Grand Hotel Central',
    location: 'City Center, Paris',
    rating: 4.8,
    reviewCount: 1247,
    price: 189,
    originalPrice: 220,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    amenities: ['wifi', 'parking', 'breakfast', 'pool'],
    type: 'hotel',
    distance: '0.5 km from center',
    isFavorite: false,
    isPopular: true,
    hasFreeCancellation: true,
  },
  {
    id: '2',
    name: 'Cozy Apartment Montmartre',
    location: 'Montmartre, Paris',
    rating: 4.6,
    reviewCount: 892,
    price: 95,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    amenities: ['wifi', 'kitchen', 'washer'],
    type: 'apartment',
    distance: '2.1 km from center',
    isFavorite: true,
    hasFreeCancellation: false,
  },
  {
    id: '3',
    name: 'Luxury Seine View Suite',
    location: 'Latin Quarter, Paris',
    rating: 4.9,
    reviewCount: 456,
    price: 285,
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop',
    amenities: ['wifi', 'room-service', 'spa', 'concierge'],
    type: 'hotel',
    distance: '0.8 km from center',
    isFavorite: false,
    isPopular: true,
    hasFreeCancellation: true,
  },
  {
    id: '4',
    name: 'Budget Hostel Republique',
    location: 'République, Paris',
    rating: 4.2,
    reviewCount: 2341,
    price: 35,
    imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
    amenities: ['wifi', 'shared-kitchen', 'lockers'],
    type: 'hostel',
    distance: '1.5 km from center',
    isFavorite: false,
    hasFreeCancellation: true,
  },
  {
    id: '5',
    name: 'Modern Loft Le Marais',
    location: 'Le Marais, Paris',
    rating: 4.7,
    reviewCount: 623,
    price: 145,
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    amenities: ['wifi', 'kitchen', 'balcony', 'washer'],
    type: 'apartment',
    distance: '1.2 km from center',
    isFavorite: false,
    hasFreeCancellation: false,
  },
  {
    id: '6',
    name: 'Boutique Hotel Champs',
    location: 'Champs-Élysées, Paris',
    rating: 4.5,
    reviewCount: 1089,
    price: 210,
    originalPrice: 250,
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop',
    amenities: ['wifi', 'gym', 'bar', 'concierge'],
    type: 'hotel',
    distance: '0.3 km from center',
    isFavorite: true,
    hasFreeCancellation: true,
  },
];

const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  breakfast: Coffee,
  pool: '🏊',
  kitchen: '🍳',
  washer: '🧺',
  'room-service': '🛎️',
  spa: '💆',
  concierge: '🛎️',
  'shared-kitchen': '🍳',
  lockers: '🔒',
  balcony: '🏠',
  gym: '💪',
  bar: '🍸',
};

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [favorites, setFavorites] = useState<string[]>(['2', '6']);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    propertyType: [],
  });

  const searchParams = useMemo(() => {
    if (!params.location) return null;
    
    return {
      location: params.location as string,
      checkIn: params.checkIn ? new Date(params.checkIn as string) : null,
      checkOut: params.checkOut ? new Date(params.checkOut as string) : null,
      adults: parseInt(params.adults as string) || 2,
      children: parseInt(params.children as string) || 0,
      rooms: parseInt(params.rooms as string) || 1,
    };
  }, [params]);

  const filteredAndSortedAccommodations = useMemo(() => {
    let filtered = MOCK_ACCOMMODATIONS.filter(acc => {
      // Price filter
      if (acc.price < filters.priceRange[0] || acc.price > filters.priceRange[1]) {
        return false;
      }
      
      // Rating filter
      if (acc.rating < filters.rating) {
        return false;
      }
      
      // Property type filter
      if (filters.propertyType.length > 0 && !filters.propertyType.includes(acc.type)) {
        return false;
      }
      
      // Amenities filter
      if (filters.amenities.length > 0) {
        const hasAllAmenities = filters.amenities.every(amenity => {
          if (!amenity || typeof amenity !== 'string' || amenity.length === 0) {
            return false;
          }
          const sanitizedAmenity = amenity.trim().slice(0, 50);
          return acc.amenities.includes(sanitizedAmenity);
        });
        if (!hasAllAmenities) {
          return false;
        }
      }
      
      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          return parseFloat(a.distance) - parseFloat(b.distance);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, sortBy]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const calculateNights = () => {
    if (!searchParams?.checkIn || !searchParams?.checkOut) return 1;
    const diffTime = searchParams.checkOut.getTime() - searchParams.checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const renderAccommodationCard = ({ item }: { item: Accommodation }) => {
    const isFavorite = favorites.includes(item.id);
    const nights = calculateNights();
    
    const handleCardPress = () => {
      const detailParams = new URLSearchParams({
        id: item.id,
        checkIn: searchParams?.checkIn?.toISOString() || '',
        checkOut: searchParams?.checkOut?.toISOString() || '',
        adults: searchParams?.adults.toString() || '2',
        children: searchParams?.children.toString() || '0',
        rooms: searchParams?.rooms.toString() || '1',
      });
      
      router.push(`/accommodation/${item.id}?${detailParams.toString()}`);
    };
    
    return (
      <TouchableOpacity style={styles.accommodationCard} onPress={handleCardPress}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.accommodationImage} />
          <TouchableOpacity 
            style={styles.favoriteButton}
            onPress={() => toggleFavorite(item.id)}
          >
            <Heart 
              size={20} 
              color={isFavorite ? '#FF6B6B' : '#fff'} 
              fill={isFavorite ? '#FF6B6B' : 'transparent'}
            />
          </TouchableOpacity>
          {item.isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Popular</Text>
            </View>
          )}
        </View>
        
        <View style={styles.accommodationInfo}>
          <View style={styles.accommodationHeader}>
            <Text style={styles.accommodationName} numberOfLines={1}>
              {item.name}
            </Text>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
          </View>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          
          <Text style={styles.distance}>{item.distance}</Text>
          
          <View style={styles.amenitiesContainer}>
            {item.amenities.slice(0, 3).map((amenity) => {
              if (!amenity || typeof amenity !== 'string' || amenity.length === 0) {
                return null;
              }
              
              const sanitizedAmenity = amenity.trim().slice(0, 50);
              const IconComponent = AMENITY_ICONS[sanitizedAmenity];
              
              return (
                <View key={`${item.id}-${sanitizedAmenity}`} style={styles.amenityItem}>
                  {typeof IconComponent === 'string' ? (
                    <Text style={styles.amenityEmoji}>{IconComponent}</Text>
                  ) : (
                    <IconComponent size={12} color="#666" />
                  )}
                </View>
              );
            })}
            {item.amenities.length > 3 && (
              <Text style={styles.moreAmenities}>+{item.amenities.length - 3}</Text>
            )}
          </View>
          
          {item.hasFreeCancellation && (
            <Text style={styles.cancellationText}>Free cancellation</Text>
          )}
          
          <View style={styles.priceContainer}>
            <View style={styles.priceInfo}>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>${item.originalPrice}</Text>
              )}
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.priceUnit}>per night</Text>
            </View>
            <Text style={styles.totalPrice}>
              ${item.price * nights} total
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!searchParams) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Invalid search parameters</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{searchParams.location}</Text>
          <Text style={styles.headerSubtitle}>
            {formatDate(searchParams.checkIn)} - {formatDate(searchParams.checkOut)} · {' '}
            {searchParams.adults + searchParams.children} guest{searchParams.adults + searchParams.children !== 1 ? 's' : ''} · {' '}
            {searchParams.rooms} room{searchParams.rooms !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Filter and Sort Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={16} color="#007AFF" />
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'price' && styles.sortButtonActive]}
          onPress={() => setSortBy('price')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'price' && styles.sortButtonTextActive]}>
            Price
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'rating' && styles.sortButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'rating' && styles.sortButtonTextActive]}>
            Rating
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'distance' && styles.sortButtonTextActive]}>
            Distance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          {filteredAndSortedAccommodations.length} properties found
        </Text>
      </View>

      {/* Accommodations List */}
      <FlatList
        data={filteredAndSortedAccommodations}
        renderItem={renderAccommodationCard}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filtersModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filtersContent}>
              <Text style={styles.filterSectionTitle}>Price Range</Text>
              <Text style={styles.filterDescription}>
                ${filters.priceRange[0]} - ${filters.priceRange[1]} per night
              </Text>
              
              <Text style={styles.filterSectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingFilters}>
                {[0, 3, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingFilter,
                      filters.rating === rating && styles.ratingFilterActive
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, rating }))}
                  >
                    <Text style={[
                      styles.ratingFilterText,
                      filters.rating === rating && styles.ratingFilterTextActive
                    ]}>
                      {rating === 0 ? 'Any' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.filterSectionTitle}>Property Type</Text>
              <View style={styles.propertyTypeFilters}>
                {['hotel', 'apartment', 'villa', 'hostel'].map((type) => {
                  if (!type || typeof type !== 'string' || type.length === 0) {
                    return null;
                  }
                  
                  const sanitizedType = type.trim().slice(0, 20);
                  
                  return (
                    <TouchableOpacity
                      key={sanitizedType}
                      style={[
                        styles.propertyTypeFilter,
                        filters.propertyType.includes(sanitizedType) && styles.propertyTypeFilterActive
                      ]}
                      onPress={() => {
                        setFilters(prev => ({
                          ...prev,
                          propertyType: prev.propertyType.includes(sanitizedType)
                            ? prev.propertyType.filter(t => t !== sanitizedType)
                            : [...prev.propertyType, sanitizedType]
                        }));
                      }}
                    >
                      <Text style={[
                        styles.propertyTypeFilterText,
                        filters.propertyType.includes(sanitizedType) && styles.propertyTypeFilterTextActive
                      ]}>
                        {sanitizedType.charAt(0).toUpperCase() + sanitizedType.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
            
            <View style={styles.filtersFooter}>
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={() => setFilters({
                  priceRange: [0, 500],
                  rating: 0,
                  amenities: [],
                  propertyType: [],
                })}
              >
                <Text style={styles.clearFiltersButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.applyFiltersButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 20,
    marginRight: 12,
  },
  filterButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
  },
  sortButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: 'white',
  },
  resultsHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  accommodationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
  },
  accommodationImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  accommodationInfo: {
    padding: 16,
  },
  accommodationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  accommodationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  amenityItem: {
    marginRight: 8,
  },
  amenityEmoji: {
    fontSize: 12,
  },
  moreAmenities: {
    fontSize: 12,
    color: '#666',
  },
  cancellationText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  originalPrice: {
    fontSize: 14,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filtersModal: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  filtersContent: {
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
    marginTop: 16,
  },
  filterDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  ratingFilters: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ratingFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    marginRight: 8,
  },
  ratingFilterActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingFilterText: {
    fontSize: 14,
    color: '#666',
  },
  ratingFilterTextActive: {
    color: 'white',
  },
  propertyTypeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  propertyTypeFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  propertyTypeFilterActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  propertyTypeFilterText: {
    fontSize: 14,
    color: '#666',
  },
  propertyTypeFilterTextActive: {
    color: 'white',
  },
  filtersFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  clearFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  clearFiltersButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  applyFiltersButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  applyFiltersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});