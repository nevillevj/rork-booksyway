import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Heart, Search, Calendar, Users, Bell, Car, Plane, MapPin as Attractions } from 'lucide-react-native';
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

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState('');
  const [checkInDate] = useState('Mon 22 Sept - Tue 23 Sept');
  const [guests] = useState('1 room · 2 adults · 0 children');
  
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
        <View style={styles.mobilePriceBadge}>
          <Text style={styles.mobilePriceText}>Mobile-only price</Text>
        </View>
      </View>
      
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.ratingLocationRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingBadgeText}>{item.rating}</Text>
          </View>
          <Text style={styles.reviewText}>Fabulous · {item.reviewCount} reviews</Text>
        </View>
        
        <View style={styles.locationRow}>
          <MapPin size={14} color="#666" />
          <Text style={styles.hotelLocation} numberOfLines={1}>{item.location}</Text>
        </View>
        
        <View style={styles.priceRow}>
          <Text style={styles.nightsText}>2 nights:</Text>
        </View>
        
        <View style={styles.finalPriceRow}>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>ZAR {item.originalPrice * 20}</Text>
          )}
          <Text style={styles.price}>ZAR {item.price * 20}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroSection, { paddingTop: insets.top + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.appTitle}>BooksyGo.com</Text>
            <TouchableOpacity style={styles.notificationButton}>
              <Bell color="white" size={24} />
            </TouchableOpacity>
          </View>

          {/* Service Tabs */}
          <View style={styles.serviceTabs}>
            <TouchableOpacity style={[styles.serviceTab, styles.activeServiceTab]}>
              <Text style={styles.activeServiceTabText}>Stays</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.serviceTab}>
              <Plane color="white" size={16} />
              <Text style={styles.serviceTabText}>Flights</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Services */}
          <View style={styles.additionalServices}>
            <TouchableOpacity style={styles.additionalService}>
              <Car color="white" size={20} />
              <Text style={styles.additionalServiceText}>Car rental</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.additionalService}>
              <Text style={styles.additionalServiceText}>🚕</Text>
              <Text style={styles.additionalServiceText}>Taxi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.additionalService}>
              <Attractions color="white" size={20} />
              <Text style={styles.additionalServiceText}>Attractions</Text>
            </TouchableOpacity>
          </View>

          {/* Search Form */}
          <View style={styles.searchForm}>
            <View style={styles.searchInputContainer}>
              <Search color="#666" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter your destination"
                value={destination}
                onChangeText={setDestination}
                placeholderTextColor="#999"
              />
            </View>
            
            <TouchableOpacity style={styles.dateInputContainer}>
              <Calendar color="#666" size={20} />
              <Text style={styles.dateInputText}>{checkInDate}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.guestInputContainer}>
              <Users color="#666" size={20} />
              <Text style={styles.guestInputText}>{guests}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={() => router.push('/(tabs)/search')}
            >
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekend Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Deals for the weekend</Text>
            <Text style={styles.sectionSubtitle}>Save on stays for 26 September - 28 September</Text>
          </View>
          
          {FEATURED_HOTELS.length > 0 ? (
            <FlatList
              data={FEATURED_HOTELS.slice(0, 2)}
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heroSection: {
    backgroundColor: '#FF6F3C',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    padding: 4,
  },
  serviceTabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  serviceTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 6,
  },
  activeServiceTab: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'white',
  },
  serviceTabText: {
    color: 'white',
    fontSize: 14,
  },
  activeServiceTabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  additionalServices: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  additionalService: {
    alignItems: 'center',
    gap: 4,
  },
  additionalServiceText: {
    color: 'white',
    fontSize: 12,
  },
  searchForm: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    gap: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 12,
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  guestInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  guestInputText: {
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#ff6900',
    margin: 8,
    paddingVertical: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  hotelsList: {
    paddingHorizontal: 16,
  },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hotelImageContainer: {
    position: 'relative',
  },
  hotelImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobilePriceBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#00AA6C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mobilePriceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  hotelInfo: {
    padding: 12,
  },
  hotelName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
    lineHeight: 18,
  },
  ratingLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  ratingBadge: {
    backgroundColor: '#003580',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reviewText: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  priceRow: {
    marginBottom: 4,
  },
  nightsText: {
    fontSize: 12,
    color: '#666',
  },
  finalPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  hotelSeparator: {
    width: 16,
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