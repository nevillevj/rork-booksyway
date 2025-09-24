import React, { useState } from 'react';
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
import { MapPin, Heart, Bell, Car, Plane, MapPin as Attractions } from 'lucide-react-native';
import { MOCK_ACCOMMODATIONS } from '@/constants/mockData';
import { trpc } from '@/lib/trpc';
import LiteAPISearchWidget from '@/components/LiteAPISearchWidget';

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
  const [guestConfig] = useState({
    rooms: 1,
    adults: 2,
    children: 0
  });

  console.log('=== Home Screen Render ===');
  console.log('FEATURED_HOTELS length:', FEATURED_HOTELS.length);
  console.log('Current guest config:', guestConfig);

  const handleHotelPress = (hotel: FeaturedHotel) => {
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 1);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 3);
    
    const params = new URLSearchParams({
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      adults: guestConfig.adults.toString(),
      children: guestConfig.children.toString(),
      rooms: guestConfig.rooms.toString(),
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

          {/* LiteAPI Search Widget */}
          <LiteAPISearchWidget style={styles.searchWidget} />
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
        
        {/* Test API Button */}
        <TestApiButton />
        
        {/* Network Diagnostics */}
        <NetworkDiagnostics />
      </ScrollView>
    </View>
  );
}

function TestApiButton() {
  const testApiQuery = trpc.example.testLiteApi.useQuery(undefined, {
    enabled: false,
  });

  const handleTestApi = () => {
    console.log('Testing LiteAPI connection...');
    testApiQuery.refetch();
  };

  return (
    <View style={styles.testButtonContainer}>
      <TouchableOpacity 
        style={styles.testButton}
        onPress={handleTestApi}
        disabled={testApiQuery.isLoading}
      >
        <Text style={styles.testButtonText}>
          {testApiQuery.isLoading ? 'Testing...' : 'Test LiteAPI Connection'}
        </Text>
      </TouchableOpacity>
      
      {testApiQuery.data && (
        <View style={styles.testResultContainer}>
          <Text style={[
            styles.testResultText,
            { color: testApiQuery.data.success ? '#00AA6C' : '#FF4444' }
          ]}>
            {testApiQuery.data.message}
          </Text>
          {testApiQuery.data.success && testApiQuery.data.data && (
            <Text style={styles.testDetailsText}>
              Status: {testApiQuery.data.data.status} | Hotels Found: {testApiQuery.data.data.hotelsFound || 0}
            </Text>
          )}
        </View>
      )}
      
      {testApiQuery.error && (
        <View style={styles.testResultContainer}>
          <Text style={[styles.testResultText, { color: '#FF4444' }]}>
            Error: {testApiQuery.error.message}
          </Text>
        </View>
      )}
    </View>
  );
}

function NetworkDiagnostics() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkBackendHealth = async () => {
    setBackendStatus('checking');
    try {
      const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:8081';
      console.log('Checking backend health at:', baseUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${baseUrl}/api/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setBackendStatus('online');
        console.log('Backend is online');
      } else {
        setBackendStatus('offline');
        console.log('Backend returned error:', response.status);
      }
    } catch (error) {
      setBackendStatus('offline');
      console.error('Backend health check failed:', error);
    }
    setLastCheck(new Date());
  };

  React.useEffect(() => {
    checkBackendHealth();
  }, []);

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return '#00AA6C';
      case 'offline': return '#FF4444';
      case 'checking': return '#FFA500';
      default: return '#666';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'online': return 'Backend Online';
      case 'offline': return 'Backend Offline';
      case 'checking': return 'Checking...';
      default: return 'Unknown';
    }
  };

  return (
    <View style={styles.diagnosticsContainer}>
      <Text style={styles.diagnosticsTitle}>Network Diagnostics</Text>
      
      <View style={styles.statusRow}>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.statusText}>{getStatusText()}</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={checkBackendHealth}
          disabled={backendStatus === 'checking'}
        >
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
      
      {lastCheck && (
        <Text style={styles.lastCheckText}>
          Last checked: {lastCheck.toLocaleTimeString()}
        </Text>
      )}
      
      <Text style={styles.diagnosticsInfo}>
        Backend URL: {process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'http://localhost:8081'}
      </Text>
      
      {backendStatus === 'offline' && (
        <View style={styles.troubleshootContainer}>
          <Text style={styles.troubleshootTitle}>Troubleshooting:</Text>
          <Text style={styles.troubleshootItem}>• Ensure backend server is running</Text>
          <Text style={styles.troubleshootItem}>• Check EXPO_PUBLIC_RORK_API_BASE_URL in .env.local</Text>
          <Text style={styles.troubleshootItem}>• Verify network connectivity</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  heroSection: {
    backgroundColor: '#0F4C81',
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
  searchWidget: {
    marginTop: 8,
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
  testButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  testButton: {
    backgroundColor: '#FF6900',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  testResultContainer: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  testResultText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  testDetailsText: {
    fontSize: 12,
    color: '#666',
  },
  diagnosticsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  diagnosticsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  lastCheckText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  diagnosticsInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  troubleshootContainer: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 6,
  },
  troubleshootItem: {
    fontSize: 12,
    color: '#856404',
    marginBottom: 2,
  },
});