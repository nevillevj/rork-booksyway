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
  ActivityIndicator,
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
import { trpc } from '@/lib/trpc';
import { useFavorites } from '@/contexts/FavoritesContext';

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
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('price');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [0, 500],
    rating: 0,
    amenities: [],
    propertyType: [],
  });

  // Simple city name to city code mapping
  const getCityCode = (locationName: string): string => {
    const cityMapping: Record<string, string> = {
      'New York': 'NYC',
      'Paris': 'PAR',
      'London': 'LON',
      'Tokyo': 'TYO',
      'Dubai': 'DXB',
      'Barcelona': 'BCN',
      'Rome': 'ROM',
      'Amsterdam': 'AMS',
      'Sydney': 'SYD',
      'Bangkok': 'BKK',
      'Los Angeles': 'LAX',
      'San Francisco': 'SFO',
      'Miami': 'MIA',
      'Chicago': 'CHI',
      'Boston': 'BOS',
      'Las Vegas': 'LAS',
      'Berlin': 'BER',
      'Madrid': 'MAD',
      'Vienna': 'VIE',
      'Prague': 'PRG'
    };
    
    // Try exact match first
    if (cityMapping[locationName]) {
      return cityMapping[locationName];
    }
    
    // Try partial match
    const partialMatch = Object.keys(cityMapping).find(city => 
      city.toLowerCase().includes(locationName.toLowerCase()) ||
      locationName.toLowerCase().includes(city.toLowerCase())
    );
    
    if (partialMatch) {
      return cityMapping[partialMatch];
    }
    
    // Default fallback
    return 'NYC';
  };

  const searchParams = useMemo(() => {
    if (!params.location) return null;
    
    const locationName = params.location as string;
    const cityCode = params.cityCode as string || getCityCode(locationName);
    
    return {
      location: locationName,
      cityCode: cityCode,
      checkIn: params.checkIn ? new Date(params.checkIn as string) : null,
      checkOut: params.checkOut ? new Date(params.checkOut as string) : null,
      adults: parseInt(params.adults as string) || 2,
      children: parseInt(params.children as string) || 0,
      rooms: parseInt(params.rooms as string) || 1,
    };
  }, [params]);

  // Format dates for API call
  const formatDateForAPI = (date: Date | null) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  // Search hotels using tRPC
  const hotelsQuery = trpc.example.searchHotels.useQuery(
    {
      cityCode: searchParams?.cityCode || 'NYC',
      checkin: formatDateForAPI(searchParams?.checkIn || null),
      checkout: formatDateForAPI(searchParams?.checkOut || null),
      adults: searchParams?.adults || 2,
      children: searchParams?.children || 0,
      rooms: searchParams?.rooms || 1,
    },
    {
      enabled: !!searchParams && !!searchParams.checkIn && !!searchParams.checkOut && 
               formatDateForAPI(searchParams?.checkIn || null) !== '' && 
               formatDateForAPI(searchParams?.checkOut || null) !== '',
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    }
  );

  // Debug logging
  console.log('ResultsScreen: searchParams:', searchParams);
  console.log('ResultsScreen: hotelsQuery enabled:', !!searchParams && !!searchParams.checkIn && !!searchParams.checkOut && 
               formatDateForAPI(searchParams?.checkIn || null) !== '' && 
               formatDateForAPI(searchParams?.checkOut || null) !== '');
  console.log('ResultsScreen: hotelsQuery isLoading:', hotelsQuery.isLoading);
  console.log('ResultsScreen: hotelsQuery data:', hotelsQuery.data);

  const filteredAndSortedAccommodations = useMemo(() => {
    const hotels = hotelsQuery.data?.data?.hotels || [];
    
    let filtered = hotels.filter((acc: any) => {
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
    filtered.sort((a: any, b: any) => {
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
  }, [hotelsQuery.data, filters, sortBy]);

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

  const handleToggleFavorite = async (item: any) => {
    const favoriteItem = {
      id: item.id,
      name: item.name,
      location: item.location,
      rating: item.rating,
      reviewCount: item.reviewCount,
      price: item.price,
      originalPrice: item.originalPrice,
      imageUrl: item.imageUrl,
      type: item.type,
      distance: item.distance,
      amenities: item.amenities || [],
      isPopular: item.isPopular,
      hasFreeCancellation: item.hasFreeCancellation,
    };
    
    await toggleFavorite(favoriteItem);
  };

  const renderAccommodationCard = ({ item }: { item: Accommodation }) => {
    const isItemFavorite = isFavorite(item.id);
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
            onPress={() => handleToggleFavorite(item)}
          >
            <Heart 
              size={20} 
              color={isItemFavorite ? '#FF6B6B' : '#fff'} 
              fill={isItemFavorite ? '#FF6B6B' : 'transparent'}
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Invalid search parameters</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (hotelsQuery.isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{searchParams.location}</Text>
            <Text style={styles.headerSubtitle}>Searching hotels...</Text>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Finding the best hotels for you...</Text>
        </View>
      </View>
    );
  }

  if (hotelsQuery.error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1a1a1a" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{searchParams.location}</Text>
            <Text style={styles.headerSubtitle}>Search failed</Text>
          </View>
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to search hotels</Text>
          <Text style={styles.errorSubtext}>{hotelsQuery.error.message}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => hotelsQuery.refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
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
          {hotelsQuery.data?.data?.totalCount && hotelsQuery.data.data.totalCount > filteredAndSortedAccommodations.length && 
            ` (${hotelsQuery.data.data.totalCount} total available)`
          }
        </Text>
        {hotelsQuery.data?.success === false && (
          <View style={styles.apiErrorContainer}>
            <Text style={styles.apiErrorText}>
              {hotelsQuery.data.data?.fallback ? '⚠️ ' : '❌ '}
              {hotelsQuery.data.message}
            </Text>
            {hotelsQuery.data.data?.fallback && (
              <Text style={styles.fallbackText}>
                Showing sample hotels while we work on connecting to live data
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Accommodations List */}
      {filteredAndSortedAccommodations.length > 0 ? (
        <FlatList
          data={filteredAndSortedAccommodations}
          renderItem={renderAccommodationCard}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No hotels found</Text>
          <Text style={styles.noResultsSubtext}>
            Try adjusting your search criteria or filters
          </Text>
        </View>
      )}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  apiErrorContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFEAA7',
  },
  apiErrorText: {
    fontSize: 12,
    color: '#856404',
    fontWeight: '600',
  },
  fallbackText: {
    fontSize: 11,
    color: '#6C757D',
    marginTop: 4,
    fontStyle: 'italic',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cancelSearchButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#666',
    borderRadius: 8,
  },
  cancelSearchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});