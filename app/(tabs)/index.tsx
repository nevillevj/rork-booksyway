import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Star, MapPin, Heart } from 'lucide-react-native';
import { MOCK_ACCOMMODATIONS } from '@/constants/mockData';

interface FeaturedHotel {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  image: string;
  type: string;
}

const FEATURED_HOTELS: FeaturedHotel[] = MOCK_ACCOMMODATIONS.map(hotel => ({
  id: hotel.id,
  name: hotel.name,
  location: hotel.location,
  rating: hotel.rating,
  reviewCount: hotel.reviewCount,
  price: hotel.price,
  originalPrice: hotel.originalPrice,
  image: hotel.images[0],
  type: hotel.type,
}));

const POPULAR_DESTINATIONS = [
  {
    id: '1',
    name: 'Paris',
    country: 'France',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=300&fit=crop',
    hotels: '2,847 hotels',
  },
  {
    id: '2',
    name: 'London',
    country: 'United Kingdom',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop',
    hotels: '3,124 hotels',
  },
  {
    id: '3',
    name: 'New York',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
    hotels: '1,956 hotels',
  },
  {
    id: '4',
    name: 'Tokyo',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop',
    hotels: '2,234 hotels',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  console.log('HomeScreen: FEATURED_HOTELS length:', FEATURED_HOTELS.length);
  console.log('HomeScreen: First hotel:', FEATURED_HOTELS[0]);

  const handleHotelPress = (hotel: FeaturedHotel) => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);
    
    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: '2',
      children: '0',
      rooms: '1',
    });
    
    router.push(`/accommodation/${hotel.id}?${params.toString()}`);
  };

  const handleDestinationPress = (destination: any) => {
    router.push('/(tabs)/search');
  };

  const renderFeaturedHotel = ({ item }: { item: FeaturedHotel }) => (
    <TouchableOpacity 
      style={styles.hotelCard} 
      onPress={() => handleHotelPress(item)}
      testID={`featured-hotel-${item.id}`}
    >
      <View style={styles.hotelImageContainer}>
        <Image source={{ uri: item.image }} style={styles.hotelImage} />
        <TouchableOpacity style={styles.favoriteButton}>
          <Heart size={20} color="white" fill="rgba(255,255,255,0.3)" />
        </TouchableOpacity>
        {item.originalPrice && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{Math.round((1 - item.price / item.originalPrice) * 100)}%</Text>
          </View>
        )}
      </View>
      
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.hotelLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            <Star size={14} color="#FFD700" fill="#FFD700" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviewCount}>({item.reviewCount})</Text>
          </View>
        </View>
        
        <View style={styles.priceRow}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>${item.originalPrice}</Text>
          )}
          <Text style={styles.price}>${item.price}</Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderDestination = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.destinationCard} 
      onPress={() => handleDestinationPress(item)}
      testID={`destination-${item.id}`}
    >
      <Image source={{ uri: item.image }} style={styles.destinationImage} />
      <View style={styles.destinationOverlay}>
        <Text style={styles.destinationName}>{item.name}</Text>
        <Text style={styles.destinationCountry}>{item.country}</Text>
        <Text style={styles.destinationHotels}>{item.hotels}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.headerTitle}>Find your perfect stay</Text>
        </View>

        {/* Quick Search Button */}
        <TouchableOpacity 
          style={styles.quickSearchButton} 
          onPress={() => router.push('/(tabs)/search')}
          testID="quick-search-button"
        >
          <Text style={styles.quickSearchText}>Where are you going?</Text>
          <Text style={styles.quickSearchSubtext}>Search destinations, hotels & more</Text>
        </TouchableOpacity>

        {/* Featured Hotels */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Hotels</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          {FEATURED_HOTELS.length > 0 ? (
            <FlatList
              data={FEATURED_HOTELS}
              renderItem={renderFeaturedHotel}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hotelsList}
              ItemSeparatorComponent={() => <View style={styles.hotelSeparator} />}
              testID="featured-hotels-list"
            />
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>No featured hotels available</Text>
            </View>
          )}
        </View>

        {/* Popular Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={POPULAR_DESTINATIONS}
            renderItem={renderDestination}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsList}
            ItemSeparatorComponent={() => <View style={styles.destinationSeparator} />}
          />
        </View>

        {/* Special Offers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <View style={styles.offerCard}>
            <View style={styles.offerContent}>
              <Text style={styles.offerTitle}>🎉 Weekend Special</Text>
              <Text style={styles.offerDescription}>Save up to 25% on weekend stays</Text>
              <TouchableOpacity style={styles.offerButton}>
                <Text style={styles.offerButtonText}>Explore Deals</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  quickSearchButton: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickSearchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  quickSearchSubtext: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  hotelsList: {
    paddingHorizontal: 20,
  },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hotelImageContainer: {
    position: 'relative',
  },
  hotelImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  hotelInfo: {
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelLocation: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  destinationsList: {
    paddingHorizontal: 20,
  },
  destinationCard: {
    width: 160,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  destinationImage: {
    width: '100%',
    height: '100%',
  },
  destinationOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  destinationCountry: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  destinationHotels: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  offerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  offerContent: {
    alignItems: 'center',
  },
  offerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  offerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  offerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hotelSeparator: {
    width: 16,
  },
  destinationSeparator: {
    width: 12,
  },
  noDataContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
  },
});