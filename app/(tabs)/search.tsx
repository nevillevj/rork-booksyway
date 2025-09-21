import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Platform,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Plus,
  Minus,
  X,
} from 'lucide-react-native';

interface SearchParams {
  location: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
}

interface LocationSuggestion {
  id: string;
  name: string;
  type: 'city' | 'country' | 'landmark';
  subtitle?: string;
}

const POPULAR_LOCATIONS: LocationSuggestion[] = [
  { id: '1', name: 'Paris', type: 'city', subtitle: 'France' },
  { id: '2', name: 'London', type: 'city', subtitle: 'United Kingdom' },
  { id: '3', name: 'New York', type: 'city', subtitle: 'United States' },
  { id: '4', name: 'Tokyo', type: 'city', subtitle: 'Japan' },
  { id: '5', name: 'Dubai', type: 'city', subtitle: 'United Arab Emirates' },
  { id: '6', name: 'Barcelona', type: 'city', subtitle: 'Spain' },
  { id: '7', name: 'Rome', type: 'city', subtitle: 'Italy' },
  { id: '8', name: 'Amsterdam', type: 'city', subtitle: 'Netherlands' },
  { id: '9', name: 'Sydney', type: 'city', subtitle: 'Australia' },
  { id: '10', name: 'Bangkok', type: 'city', subtitle: 'Thailand' },
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    location: '',
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    rooms: 1,
  });

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState<'checkIn' | 'checkOut' | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [filteredLocations, setFilteredLocations] = useState<LocationSuggestion[]>([]);

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalGuests = () => searchParams.adults + searchParams.children;

  const handleSearch = () => {
    console.log('Search params:', searchParams);
    
    // Validate required fields
    if (!searchParams.location) {
      console.log('Please select a destination');
      return;
    }
    
    if (!searchParams.checkIn || !searchParams.checkOut) {
      console.log('Please select check-in and check-out dates');
      return;
    }
    
    // Navigate to search results with parameters
    const params = new URLSearchParams({
      location: searchParams.location,
      checkIn: searchParams.checkIn.toISOString(),
      checkOut: searchParams.checkOut.toISOString(),
      adults: searchParams.adults.toString(),
      children: searchParams.children.toString(),
      rooms: searchParams.rooms.toString(),
    });
    
    router.push(`/results?${params.toString()}`);
  };

  const updateGuestCount = (type: 'adults' | 'children' | 'rooms', increment: boolean) => {
    setSearchParams(prev => ({
      ...prev,
      [type]: Math.max(type === 'rooms' ? 1 : 0, prev[type] + (increment ? 1 : -1)),
    }));
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && showDatePicker) {
      // Validate date selection
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (showDatePicker === 'checkIn') {
        if (selectedDate < today) {
          console.log('Check-in date cannot be in the past');
          return;
        }
        
        // If check-out is before new check-in, clear check-out
        if (searchParams.checkOut && selectedDate >= searchParams.checkOut) {
          setSearchParams(prev => ({
            ...prev,
            checkIn: selectedDate,
            checkOut: null,
          }));
        } else {
          setSearchParams(prev => ({
            ...prev,
            checkIn: selectedDate,
          }));
        }
      } else if (showDatePicker === 'checkOut') {
        if (searchParams.checkIn && selectedDate <= searchParams.checkIn) {
          console.log('Check-out date must be after check-in date');
          return;
        }
        
        setSearchParams(prev => ({
          ...prev,
          checkOut: selectedDate,
        }));
      }
    }
    
    // Close picker immediately on Android and Web after selection
    if (Platform.OS === 'android' || Platform.OS === 'web') {
      setShowDatePicker(null);
    }
  };

  const confirmDateSelection = () => {
    setShowDatePicker(null);
  };

  const handleLocationSearch = (query: string) => {
    // Input validation
    if (!query || typeof query !== 'string') {
      setLocationQuery('');
      setFilteredLocations([]);
      return;
    }
    
    // Limit query length and sanitize
    const sanitizedQuery = query.trim().slice(0, 100);
    setLocationQuery(sanitizedQuery);
    
    if (sanitizedQuery === '') {
      setFilteredLocations([]);
      return;
    }
    
    const filtered = POPULAR_LOCATIONS.filter(location =>
      location.name.toLowerCase().includes(sanitizedQuery.toLowerCase()) ||
      (location.subtitle && location.subtitle.toLowerCase().includes(sanitizedQuery.toLowerCase()))
    );
    
    setFilteredLocations(filtered);
  };

  const selectLocation = (location: LocationSuggestion) => {
    setSearchParams(prev => ({ ...prev, location: location.name }));
    setShowLocationModal(false);
    setLocationQuery('');
    setFilteredLocations([]);
  };

  const openLocationModal = () => {
    setLocationQuery(searchParams.location);
    setShowLocationModal(true);
    if (searchParams.location) {
      handleLocationSearch(searchParams.location);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Find your perfect stay</Text>
          <Text style={styles.headerSubtitle}>
            Discover amazing places to stay around the world
          </Text>
        </View>

        {/* Search Card */}
        <View style={styles.searchCard}>
          {/* Location Input */}
          <TouchableOpacity style={styles.inputContainer} onPress={openLocationModal}>
            <MapPin size={20} color="#666" style={styles.inputIcon} />
            <View style={styles.locationTextContainer}>
              <Text style={[styles.locationText, !searchParams.location && styles.placeholderText]}>
                {searchParams.location || 'Where are you going?'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Date Selection */}
          <View style={styles.dateContainer}>
            <TouchableOpacity
              style={[styles.dateInput, styles.dateInputLeft]}
              onPress={() => setShowDatePicker('checkIn')}
            >
              <Calendar size={16} color="#666" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Check-in</Text>
                <Text style={styles.dateValue}>
                  {formatDate(searchParams.checkIn) || 'Add date'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dateInput, styles.dateInputRight]}
              onPress={() => setShowDatePicker('checkOut')}
            >
              <Calendar size={16} color="#666" />
              <View style={styles.dateTextContainer}>
                <Text style={styles.dateLabel}>Check-out</Text>
                <Text style={styles.dateValue}>
                  {formatDate(searchParams.checkOut) || 'Add date'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Guests & Rooms */}
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowGuestModal(true)}
          >
            <Users size={20} color="#666" style={styles.inputIcon} />
            <View style={styles.guestTextContainer}>
              <Text style={styles.guestText}>
                {getTotalGuests()} guest{getTotalGuests() !== 1 ? 's' : ''} · {searchParams.rooms} room{searchParams.rooms !== 1 ? 's' : ''}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Search Button */}
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={20} color="white" />
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Popular Destinations */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Popular destinations</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.popularScroll}>
            {['Paris', 'London', 'New York', 'Tokyo', 'Dubai'].map((city) => (
              <TouchableOpacity 
                key={city} 
                style={styles.popularCard}
                onPress={() => setSearchParams(prev => ({ ...prev, location: city }))}
              >
                <Text style={styles.popularCardText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {/* Quick Test - Hotel Details */}
        <View style={styles.popularSection}>
          <Text style={styles.sectionTitle}>Featured Hotels</Text>
          <TouchableOpacity 
            style={styles.testHotelCard}
            onPress={() => router.push('/accommodation/1?checkIn=2024-03-15T00:00:00.000Z&checkOut=2024-03-17T00:00:00.000Z&adults=2&children=0&rooms=1')}
          >
            <Text style={styles.testHotelTitle}>Grand Hotel Central</Text>
            <Text style={styles.testHotelSubtitle}>View detailed information</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.testHotelCard}
            onPress={() => router.push('/accommodation/2?checkIn=2024-03-15T00:00:00.000Z&checkOut=2024-03-17T00:00:00.000Z&adults=2&children=0&rooms=1')}
          >
            <Text style={styles.testHotelTitle}>Cozy Apartment Montmartre</Text>
            <Text style={styles.testHotelSubtitle}>View detailed information</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Guest Selection Modal */}
      <Modal
        visible={showGuestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGuestModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowGuestModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Guests and rooms</Text>
              <TouchableOpacity onPress={() => setShowGuestModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Adults */}
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestRowTitle}>Adults</Text>
                <Text style={styles.guestRowSubtitle}>Ages 13 or above</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, searchParams.adults <= 1 && styles.counterButtonDisabled]}
                  onPress={() => updateGuestCount('adults', false)}
                  disabled={searchParams.adults <= 1}
                >
                  <Minus size={16} color={searchParams.adults <= 1 ? '#ccc' : '#007AFF'} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{searchParams.adults}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateGuestCount('adults', true)}
                >
                  <Plus size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Children */}
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestRowTitle}>Children</Text>
                <Text style={styles.guestRowSubtitle}>Ages 0-12</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, searchParams.children <= 0 && styles.counterButtonDisabled]}
                  onPress={() => updateGuestCount('children', false)}
                  disabled={searchParams.children <= 0}
                >
                  <Minus size={16} color={searchParams.children <= 0 ? '#ccc' : '#007AFF'} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{searchParams.children}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateGuestCount('children', true)}
                >
                  <Plus size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Rooms */}
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestRowTitle}>Rooms</Text>
                <Text style={styles.guestRowSubtitle}>Number of rooms needed</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, searchParams.rooms <= 1 && styles.counterButtonDisabled]}
                  onPress={() => updateGuestCount('rooms', false)}
                  disabled={searchParams.rooms <= 1}
                >
                  <Minus size={16} color={searchParams.rooms <= 1 ? '#ccc' : '#007AFF'} />
                </TouchableOpacity>
                <Text style={styles.counterValue}>{searchParams.rooms}</Text>
                <TouchableOpacity
                  style={styles.counterButton}
                  onPress={() => updateGuestCount('rooms', true)}
                >
                  <Plus size={16} color="#007AFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Location Search Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.locationModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Where are you going?</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.searchInputContainer}>
              <MapPin size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destinations"
                value={locationQuery}
                onChangeText={handleLocationSearch}
                placeholderTextColor="#999"
                autoFocus
              />
            </View>
            
            <FlatList
              data={filteredLocations.length > 0 ? filteredLocations : POPULAR_LOCATIONS.slice(0, 8)}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <Text style={styles.locationListHeader}>
                  {filteredLocations.length > 0 ? 'Search Results' : 'Popular Destinations'}
                </Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.locationItem}
                  onPress={() => selectLocation(item)}
                >
                  <View style={styles.locationIconContainer}>
                    <MapPin size={16} color="#007AFF" />
                  </View>
                  <View style={styles.locationTextContent}>
                    <Text style={styles.locationItemName}>{item.name}</Text>
                    {item.subtitle && (
                      <Text style={styles.locationItemSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Select {showDatePicker === 'checkIn' ? 'check-in' : 'check-out'} date
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(null)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              {Platform.OS === 'web' ? (
                <View style={styles.webDatePickerContainer}>
                  <input
                    type="date"
                    value={showDatePicker === 'checkIn' 
                      ? (searchParams.checkIn ? searchParams.checkIn.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])
                      : (searchParams.checkOut ? searchParams.checkOut.toISOString().split('T')[0] : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
                    }
                    min={showDatePicker === 'checkIn' ? new Date().toISOString().split('T')[0] : (searchParams.checkIn ? searchParams.checkIn.toISOString().split('T')[0] : new Date().toISOString().split('T')[0])}
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value + 'T00:00:00');
                      handleDateChange(null, selectedDate);
                    }}
                    style={styles.webDateInput}
                  />
                </View>
              ) : (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    testID="dateTimePicker"
                    value={showDatePicker === 'checkIn' 
                      ? (searchParams.checkIn || new Date()) 
                      : (searchParams.checkOut || new Date(Date.now() + 24 * 60 * 60 * 1000))
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={showDatePicker === 'checkIn' ? new Date() : searchParams.checkIn || new Date()}
                    style={styles.datePicker}
                    themeVariant="light"
                  />
                </View>
              )}
              
              {(Platform.OS === 'ios' || Platform.OS === 'web') && (
                <TouchableOpacity
                  style={styles.dateConfirmButton}
                  onPress={confirmDateSelection}
                >
                  <Text style={styles.dateConfirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
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
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  searchCard: {
    backgroundColor: 'white',
    margin: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#fafbfc',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    padding: 16,
    backgroundColor: '#fafbfc',
  },
  dateInputLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 0.5,
  },
  dateInputRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 0.5,
  },
  dateTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  guestTextContainer: {
    flex: 1,
  },
  guestText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#999',
  },
  locationModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
    flex: 1,
    marginTop: 60,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#fafbfc',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
  },
  locationListHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  locationIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  locationTextContent: {
    flex: 1,
  },
  locationItemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  locationItemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  datePickerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  datePicker: {
    width: '100%',
    height: Platform.OS === 'ios' ? 200 : 'auto',
  },
  webDatePickerContainer: {
    width: '100%',
    paddingVertical: 20,
  },

  dateConfirmButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  dateConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 12,
    marginTop: 8,
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  popularSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  popularScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  popularCard: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  popularCardText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  guestRowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  guestRowSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    borderColor: '#ccc',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  datePickerNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  tempDateButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tempDateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  webDateInput: {
    width: '100%',
    padding: 16,
    fontSize: 16,
    border: '1px solid #e1e5e9',
    borderRadius: 12,
    backgroundColor: '#fafbfc',
  },
  testHotelCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  testHotelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  testHotelSubtitle: {
    fontSize: 14,
    color: '#007AFF',
  },
});