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
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, Heart, Search, Calendar, Users, Bell, Car, Plane, MapPin as Attractions, X } from 'lucide-react-native';
import { MOCK_ACCOMMODATIONS } from '@/constants/mockData';
import { trpc } from '@/lib/trpc';

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



interface DateSelection {
  checkIn: Date | null;
  checkOut: Date | null;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [destination, setDestination] = useState('');
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [dateSelection, setDateSelection] = useState<DateSelection>({
    checkIn: null,
    checkOut: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [guestConfig, setGuestConfig] = useState({
    rooms: 1,
    adults: 2,
    children: 0
  });
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'calendar' | 'flexible'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const formatDateRange = () => {
    if (!dateSelection.checkIn || !dateSelection.checkOut) {
      return 'Select dates';
    }
    const checkIn = dateSelection.checkIn;
    const checkOut = dateSelection.checkOut;
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
    return `${checkIn.toLocaleDateString('en-US', options)} - ${checkOut.toLocaleDateString('en-US', options)}`;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateSelected = (date: Date) => {
    if (!dateSelection.checkIn || !dateSelection.checkOut) return false;
    return date >= dateSelection.checkIn && date <= dateSelection.checkOut;
  };

  const isDateInRange = (date: Date) => {
    if (!dateSelection.checkIn || !dateSelection.checkOut) return false;
    return date > dateSelection.checkIn && date < dateSelection.checkOut;
  };

  const handleDatePress = (date: Date) => {
    if (!dateSelection.checkIn || (dateSelection.checkIn && dateSelection.checkOut)) {
      // First selection or reset
      setDateSelection({ checkIn: date, checkOut: null });
    } else if (date > dateSelection.checkIn) {
      // Second selection
      setDateSelection({ ...dateSelection, checkOut: date });
    } else {
      // Selected date is before check-in, reset
      setDateSelection({ checkIn: date, checkOut: null });
    }
  };

  const handleDurationSelect = (days: number) => {
    // Input validation
    if (typeof days !== 'number' || days <= 0 || days > 365) return;
    setSelectedDuration(days);
    if (dateSelection.checkIn) {
      const checkOut = new Date(dateSelection.checkIn);
      checkOut.setDate(checkOut.getDate() + days);
      setDateSelection({ ...dateSelection, checkOut });
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };



  const getNightCount = () => {
    if (!dateSelection.checkIn || !dateSelection.checkOut) return 0;
    const diffTime = dateSelection.checkOut.getTime() - dateSelection.checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return (
      <View style={styles.calendarContainer}>
        <Text style={styles.monthTitle}>{getMonthName(currentMonth)}</Text>
        
        <View style={styles.weekDaysRow}>
          {weekDays.map((day) => (
            <Text key={day} style={styles.weekDayText}>{day}</Text>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {days.map((date, index) => {
            if (!date) {
              return <View key={`empty-${index}`} style={styles.emptyDay} />;
            }
            
            const isSelected = isDateSelected(date);
            const isInRange = isDateInRange(date);
            const isCheckIn = dateSelection.checkIn && date.getTime() === dateSelection.checkIn.getTime();
            const isCheckOut = dateSelection.checkOut && date.getTime() === dateSelection.checkOut.getTime();
            const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
            
            return (
              <TouchableOpacity
                key={`day-${date.getTime()}`}
                style={[
                  styles.dayButton,
                  isSelected && styles.selectedDay,
                  isInRange && styles.inRangeDay,
                  isCheckIn && styles.checkInDay,
                  isCheckOut && styles.checkOutDay,
                  isPast && styles.pastDay,
                ]}
                onPress={() => !isPast && handleDatePress(date)}
                disabled={isPast}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                  isPast && styles.pastDayText,
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderGuestPicker = () => {
    return (
      <Modal
        visible={showGuestPicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.guestPickerContainer}>
          <View style={styles.guestPickerHeader}>
            <TouchableOpacity onPress={() => setShowGuestPicker(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.guestPickerTitle}>Rooms and guests</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <View style={styles.guestPickerContent}>
            {/* Rooms */}
            <View style={styles.guestRow}>
              <Text style={styles.guestLabel}>Rooms</Text>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, guestConfig.rooms <= 1 && styles.disabledCounterButton]}
                  onPress={() => setGuestConfig(prev => ({ ...prev, rooms: Math.max(1, prev.rooms - 1) }))}
                  disabled={guestConfig.rooms <= 1}
                >
                  <Text style={[styles.counterButtonText, guestConfig.rooms <= 1 && styles.disabledCounterButtonText]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{guestConfig.rooms}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, guestConfig.rooms >= 8 && styles.disabledCounterButton]}
                  onPress={() => setGuestConfig(prev => ({ ...prev, rooms: Math.min(8, prev.rooms + 1) }))}
                  disabled={guestConfig.rooms >= 8}
                >
                  <Text style={[styles.counterButtonText, guestConfig.rooms >= 8 && styles.disabledCounterButtonText]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Adults */}
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestLabel}>Adults</Text>
                <Text style={styles.guestSubLabel}>Ages 18 or above</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, guestConfig.adults <= 1 && styles.disabledCounterButton]}
                  onPress={() => setGuestConfig(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                  disabled={guestConfig.adults <= 1}
                >
                  <Text style={[styles.counterButtonText, guestConfig.adults <= 1 && styles.disabledCounterButtonText]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{guestConfig.adults}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, guestConfig.adults >= 16 && styles.disabledCounterButton]}
                  onPress={() => setGuestConfig(prev => ({ ...prev, adults: Math.min(16, prev.adults + 1) }))}
                  disabled={guestConfig.adults >= 16}
                >
                  <Text style={[styles.counterButtonText, guestConfig.adults >= 16 && styles.disabledCounterButtonText]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Children */}
            <View style={styles.guestRow}>
              <View>
                <Text style={styles.guestLabel}>Children</Text>
                <Text style={styles.guestSubLabel}>Ages 0-17</Text>
              </View>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[styles.counterButton, guestConfig.children <= 0 && styles.disabledCounterButton]}
                  onPress={() => setGuestConfig(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                  disabled={guestConfig.children <= 0}
                >
                  <Text style={[styles.counterButtonText, guestConfig.children <= 0 && styles.disabledCounterButtonText]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.counterValue}>{guestConfig.children}</Text>
                <TouchableOpacity
                  style={[styles.counterButton, guestConfig.children >= 10 && styles.disabledCounterButton]}
                  onPress={() => setGuestConfig(prev => ({ ...prev, children: Math.min(10, prev.children + 1) }))}
                  disabled={guestConfig.children >= 10}
                >
                  <Text style={[styles.counterButtonText, guestConfig.children >= 10 && styles.disabledCounterButtonText]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.guestPickerFooter}>
            <TouchableOpacity
              style={styles.selectGuestsButton}
              onPress={() => setShowGuestPicker(false)}
            >
              <Text style={styles.selectGuestsButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const renderDatePicker = () => {
    return (
      <Modal
        visible={showDatePicker}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.datePickerContainer}>
          <View style={styles.datePickerHeader}>
            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
              <X size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.datePickerTitle}>Select dates</Text>
            <View style={styles.headerSpacer} />
          </View>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'calendar' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('calendar')}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'calendar' && styles.activeTabText,
              ]}>Calendar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                selectedTab === 'flexible' && styles.activeTab,
              ]}
              onPress={() => setSelectedTab('flexible')}
            >
              <Text style={[
                styles.tabText,
                selectedTab === 'flexible' && styles.activeTabText,
              ]}>I&apos;m flexible</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.datePickerContent}>
            {selectedTab === 'calendar' ? (
              <View>
                {renderCalendar()}
                
                {/* Next month */}
                <View style={styles.nextMonthContainer}>
                  {(() => {
                    const nextMonth = new Date(currentMonth);
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    const nextMonthDays = getDaysInMonth(nextMonth);
                    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    
                    return (
                      <View style={styles.calendarContainer}>
                        <Text style={styles.monthTitle}>{getMonthName(nextMonth)}</Text>
                        
                        <View style={styles.weekDaysRow}>
                          {weekDays.map((day) => (
                            <Text key={day} style={styles.weekDayText}>{day}</Text>
                          ))}
                        </View>
                        
                        <View style={styles.daysGrid}>
                          {nextMonthDays.map((date, index) => {
                            if (!date) {
                              return <View key={`next-empty-${index}`} style={styles.emptyDay} />;
                            }
                            
                            const isSelected = isDateSelected(date);
                            const isInRange = isDateInRange(date);
                            const isCheckIn = dateSelection.checkIn && date.getTime() === dateSelection.checkIn.getTime();
                            const isCheckOut = dateSelection.checkOut && date.getTime() === dateSelection.checkOut.getTime();
                            
                            return (
                              <TouchableOpacity
                                key={`next-day-${date.getTime()}`}
                                style={[
                                  styles.dayButton,
                                  isSelected && styles.selectedDay,
                                  isInRange && styles.inRangeDay,
                                  isCheckIn && styles.checkInDay,
                                  isCheckOut && styles.checkOutDay,
                                ]}
                                onPress={() => handleDatePress(date)}
                              >
                                <Text style={[
                                  styles.dayText,
                                  isSelected && styles.selectedDayText,
                                ]}>
                                  {date.getDate()}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    );
                  })()
                }
                </View>
              </View>
            ) : (
              <View style={styles.flexibleContainer}>
                <Text style={styles.flexibleTitle}>How long would you like to stay?</Text>
                <View style={styles.durationButtons}>
                  {[1, 2, 3, 7].map((dayCount) => {
                    if (typeof dayCount !== 'number' || dayCount <= 0) return null;
                    return (
                      <TouchableOpacity
                        key={dayCount}
                        style={[
                          styles.durationButton,
                          selectedDuration === dayCount && styles.selectedDurationButton,
                        ]}
                        onPress={() => handleDurationSelect(dayCount)}
                      >
                        <Text style={[
                          styles.durationButtonText,
                          selectedDuration === dayCount && styles.selectedDurationButtonText,
                        ]}>
                          {dayCount === 1 ? '± 1 day' : `± ${dayCount} days`}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.datePickerFooter}>
            {dateSelection.checkIn && dateSelection.checkOut && (
              <Text style={styles.selectedDatesText}>
                {formatDateRange()} ({getNightCount()} nights)
              </Text>
            )}
            <TouchableOpacity
              style={[
                styles.selectDatesButton,
                (!dateSelection.checkIn || !dateSelection.checkOut) && styles.disabledButton,
              ]}
              onPress={() => {
                if (dateSelection.checkIn && dateSelection.checkOut) {
                  setShowDatePicker(false);
                }
              }}
              disabled={!dateSelection.checkIn || !dateSelection.checkOut}
            >
              <Text style={styles.selectDatesButtonText}>Select dates</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  
  console.log('=== Home Screen Render ===');
  console.log('FEATURED_HOTELS length:', FEATURED_HOTELS.length);
  console.log('Current guest config:', guestConfig);
  console.log('Current date selection:', dateSelection);

  const handleSearch = async () => {
    if (!destination.trim()) {
      alert('Please enter a destination');
      return;
    }
    
    if (!dateSelection.checkIn || !dateSelection.checkOut) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // For now, use a simple city code mapping
    // In production, you'd want to implement proper city search with the LiteAPI cities endpoint
    const getCityCode = (destination: string): string => {
      const cityMappings: Record<string, string> = {
        // Major cities with their LiteAPI codes (using IATA codes as fallback)
        'new york': 'NYC',
        'nyc': 'NYC', 
        'new york city': 'NYC',
        'manhattan': 'NYC',
        'los angeles': 'LAX',
        'la': 'LAX',
        'chicago': 'CHI',
        'miami': 'MIA',
        'las vegas': 'LAS',
        'vegas': 'LAS',
        'san francisco': 'SFO',
        'sf': 'SFO',
        'boston': 'BOS',
        'washington': 'WAS',
        'washington dc': 'WAS',
        'dc': 'WAS',
        'seattle': 'SEA',
        'london': 'LON',
        'paris': 'PAR',
        'tokyo': 'TYO',
        'dubai': 'DXB',
        'singapore': 'SIN',
        'hong kong': 'HKG',
        'barcelona': 'BCN',
        'rome': 'ROM',
        'amsterdam': 'AMS',
        'berlin': 'BER',
        'madrid': 'MAD',
        'istanbul': 'IST',
        'bangkok': 'BKK',
        'sydney': 'SYD',
        'melbourne': 'MEL',
        'toronto': 'YYZ',
        'vancouver': 'YVR',
        'montreal': 'YUL',
        // Additional popular destinations
        'orlando': 'MCO',
        'atlanta': 'ATL',
        'phoenix': 'PHX',
        'denver': 'DEN',
        'dallas': 'DFW',
        'houston': 'IAH',
        'philadelphia': 'PHL',
        'detroit': 'DTW',
        'minneapolis': 'MSP',
        'tampa': 'TPA',
        'san diego': 'SAN',
        'portland': 'PDX',
        'salt lake city': 'SLC'
      };
      
      const normalizedDestination = destination.toLowerCase().trim();
      return cityMappings[normalizedDestination] || 'NYC'; // Default to NYC
    };
    
    const cityCode = getCityCode(destination);
    
    console.log('=== Home Screen Search Initiated ===');
    console.log('Search parameters:', {
      destination: destination.trim(),
      cityCode: cityCode,
      checkIn: dateSelection.checkIn.toISOString().split('T')[0],
      checkOut: dateSelection.checkOut.toISOString().split('T')[0],
      adults: guestConfig.adults,
      children: guestConfig.children,
      rooms: guestConfig.rooms,
      currency: 'USD',
      guestNationality: 'US'
    });
    
    // Format dates properly for API (YYYY-MM-DD)
    const checkInFormatted = dateSelection.checkIn.toISOString().split('T')[0];
    const checkOutFormatted = dateSelection.checkOut.toISOString().split('T')[0];
    
    console.log('Formatted dates for API:', {
      checkInFormatted: checkInFormatted,
      checkOutFormatted: checkOutFormatted,
      originalCheckIn: dateSelection.checkIn.toISOString(),
      originalCheckOut: dateSelection.checkOut.toISOString()
    });
    
    const params = new URLSearchParams({
      location: destination.trim(),
      cityCode: cityCode,
      checkIn: dateSelection.checkIn.toISOString(),
      checkOut: dateSelection.checkOut.toISOString(),
      adults: guestConfig.adults.toString(),
      children: guestConfig.children.toString(),
      rooms: guestConfig.rooms.toString(),
    });
    
    console.log('Navigation URL params:', params.toString());
    
    console.log('Navigating to results page with URL:', `/results?${params.toString()}`);
    router.push(`/results?${params.toString()}`);
  };

  // Cities autocomplete query
  const citiesQuery = trpc.example.getCities.useQuery(
    { 
      query: destination.trim(),
      limit: 8
    },
    {
      enabled: destination.trim().length >= 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  const handleDestinationChange = (text: string) => {
    // Input validation
    if (typeof text !== 'string') return;
    const sanitizedText = text.slice(0, 100); // Limit length
    setDestination(sanitizedText);
    setShowDestinationSuggestions(sanitizedText.trim().length >= 2);
  };

  const handleDestinationSelect = (cityName: string) => {
    // Input validation
    if (!cityName || typeof cityName !== 'string') return;
    const sanitizedCityName = cityName.trim().slice(0, 100);
    setDestination(sanitizedCityName);
    setShowDestinationSuggestions(false);
  };

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

          {/* Search Form */}
          <View style={styles.searchForm}>
            <View style={styles.searchInputContainer}>
              <Search color="#666" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Enter your destination"
                value={destination}
                onChangeText={handleDestinationChange}
                placeholderTextColor="#999"
                onFocus={() => destination.trim().length >= 2 && setShowDestinationSuggestions(true)}
                onBlur={() => {
                  // Delay hiding suggestions to allow for selection
                  setTimeout(() => setShowDestinationSuggestions(false), 200);
                }}
              />
            </View>
            
            {/* Destination Suggestions */}
            {showDestinationSuggestions && destination.trim().length >= 2 && (
              <View style={styles.suggestionsContainer}>
                {citiesQuery.isLoading && (
                  <View style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>Searching...</Text>
                  </View>
                )}
                {citiesQuery.data?.success && citiesQuery.data.data?.cities && citiesQuery.data.data.cities.length > 0 ? (
                  citiesQuery.data.data.cities.map((city: any) => (
                    <TouchableOpacity
                      key={city.id}
                      style={styles.suggestionItem}
                      onPress={() => handleDestinationSelect(city.displayName)}
                    >
                      <MapPin size={16} color="#666" style={styles.suggestionIcon} />
                      <View style={styles.suggestionTextContainer}>
                        <Text style={styles.suggestionText}>{city.name}</Text>
                        <Text style={styles.suggestionSubtext}>{city.country}</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : citiesQuery.data?.success && citiesQuery.data.data?.cities?.length === 0 ? (
                  <View style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>No cities found</Text>
                  </View>
                ) : citiesQuery.error ? (
                  <View style={styles.suggestionItem}>
                    <Text style={styles.suggestionText}>Error loading suggestions</Text>
                  </View>
                ) : null}
              </View>
            )}
            
            <TouchableOpacity 
              style={styles.dateInputContainer}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#666" size={20} />
              <Text style={styles.dateInputText}>{formatDateRange()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.guestInputContainer}
              onPress={() => setShowGuestPicker(true)}
            >
              <Users color="#666" size={20} />
              <Text style={styles.guestInputText}>
                {guestConfig.rooms} room{guestConfig.rooms > 1 ? 's' : ''} · {guestConfig.adults} adult{guestConfig.adults > 1 ? 's' : ''} · {guestConfig.children} child{guestConfig.children !== 1 ? 'ren' : ''}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={handleSearch}
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
        
        {/* Test API Button */}
        <TestApiButton />
      </ScrollView>
      {renderDatePicker()}
      {renderGuestPicker()}
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
  datePickerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0066CC',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#0066CC',
    fontWeight: '600',
  },
  datePickerContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  calendarContainer: {
    marginTop: 24,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekDayText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 40,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  emptyDay: {
    width: 40,
    height: 40,
  },
  selectedDay: {
    backgroundColor: '#0066CC',
    borderRadius: 20,
  },
  inRangeDay: {
    backgroundColor: '#E6F3FF',
  },
  checkInDay: {
    backgroundColor: '#0066CC',
    borderRadius: 20,
  },
  checkOutDay: {
    backgroundColor: '#0066CC',
    borderRadius: 20,
  },
  pastDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '600',
  },
  pastDayText: {
    color: '#999',
  },
  flexibleContainer: {
    paddingVertical: 24,
  },
  flexibleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  durationButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedDurationButton: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#333',
  },
  selectedDurationButtonText: {
    color: 'white',
  },
  datePickerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  selectedDatesText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  selectDatesButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E5E5E5',
  },
  selectDatesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 24,
  },
  nextMonthContainer: {
    marginTop: 32,
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
  guestPickerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  guestPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  guestPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  guestPickerContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  guestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  guestLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  guestSubLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledCounterButton: {
    backgroundColor: '#E5E5E5',
  },
  counterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  disabledCounterButtonText: {
    color: '#999',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
  },
  guestPickerFooter: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  selectGuestsButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectGuestsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 52, // Position below the search input
    left: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});