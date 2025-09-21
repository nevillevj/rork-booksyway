import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  Alert,
  Platform,
  Share as RNShare,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
  Star,
  Download,
  Share,
  CreditCard,
  Clock,
  Shield,
  Bell,
  FileText,
  Navigation,
} from 'lucide-react-native';

interface BookingConfirmation {
  bookingId: string;
  accommodationName: string;
  accommodationImage: string;
  location: string;
  address: string;
  rating: number;
  reviewCount: number;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  roomType: string;
  totalAmount: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  confirmationNumber: string;
  bookingDate: Date;
  paymentMethod: string;
  cancellationPolicy: string;
  checkInTime: string;
  checkOutTime: string;
  propertyPhone: string;
  propertyEmail: string;
}

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced booking confirmation data with real booking details
  const bookingConfirmation: BookingConfirmation = {
    bookingId: params.bookingId as string || 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    accommodationName: params.accommodationName as string || 'Grand Hotel Central',
    accommodationImage: params.accommodationImage as string || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    location: params.location as string || 'City Center, Paris',
    address: '123 Central Avenue, Paris, France',
    rating: parseFloat(params.rating as string) || 4.8,
    reviewCount: parseInt(params.reviewCount as string) || 1247,
    checkIn: params.checkIn ? new Date(params.checkIn as string) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    checkOut: params.checkOut ? new Date(params.checkOut as string) : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    adults: parseInt(params.adults as string) || 2,
    children: parseInt(params.children as string) || 0,
    rooms: parseInt(params.rooms as string) || 1,
    roomType: params.roomType as string || 'Deluxe King Room',
    subtotal: parseInt(params.subtotal as string) || 567,
    taxes: parseInt(params.taxes as string) || 68,
    serviceFee: parseInt(params.serviceFee as string) || 28,
    totalAmount: parseInt(params.totalAmount as string) || 663,
    guestName: params.guestName as string || 'John Doe',
    guestEmail: params.guestEmail as string || 'john.doe@example.com',
    guestPhone: params.guestPhone as string || '+1 (555) 123-4567',
    specialRequests: params.specialRequests as string || undefined,
    confirmationNumber: params.confirmationNumber as string || 'CNF' + Math.random().toString(36).substr(2, 8).toUpperCase(),
    bookingDate: new Date(),
    paymentMethod: params.paymentMethod as string || 'Credit Card ending in 4567',
    cancellationPolicy: 'Free cancellation until 24 hours before check-in',
    checkInTime: '3:00 PM',
    checkOutTime: '11:00 AM',
    propertyPhone: '+33 1 42 86 00 00',
    propertyEmail: 'reservations@grandhotelcentral.com',
  };
  
  useEffect(() => {
    // Animate the success screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };
  
  const calculateNights = () => {
    const diffTime = bookingConfirmation.checkOut.getTime() - bookingConfirmation.checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const handleDownloadConfirmation = async () => {
    setIsLoading(true);
    try {
      // In real app, generate and download PDF
      console.log('Generating PDF confirmation...');
      
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'PDF Generated',
        'Your booking confirmation has been saved to your device.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleShareConfirmation = async () => {
    try {
      const shareContent = {
        title: 'Booking Confirmation',
        message: `🏨 Booking Confirmed!\n\n${bookingConfirmation.accommodationName}\n${bookingConfirmation.location}\n\nCheck-in: ${formatDate(bookingConfirmation.checkIn)}\nCheck-out: ${formatDate(bookingConfirmation.checkOut)}\nGuests: ${bookingConfirmation.adults + bookingConfirmation.children}\n\nConfirmation: ${bookingConfirmation.confirmationNumber}\nTotal: ${formatCurrency(bookingConfirmation.totalAmount)}`,
      };
      
      if (Platform.OS === 'web') {
        // Web fallback - copy to clipboard or use Web Share API if available
        if (navigator.share) {
          await navigator.share(shareContent);
        } else {
          // Fallback for browsers without Web Share API
          console.log('Sharing booking details:', shareContent.message);
          Alert.alert('Shared', 'Booking details logged to console!');
        }
      } else {
        await RNShare.share(shareContent);
      }
    } catch (error) {
      console.error('Share error:', error);
      // Don't show error alert for web share failures
      if (Platform.OS !== 'web') {
        Alert.alert('Error', 'Failed to share booking details.');
      }
    }
  };
  
  const handleContactProperty = () => {
    Alert.alert(
      'Contact Property',
      `${bookingConfirmation.accommodationName}\n\nPhone: ${bookingConfirmation.propertyPhone}\nEmail: ${bookingConfirmation.propertyEmail}`,
      [
        { text: 'Call', onPress: () => console.log('Calling property...') },
        { text: 'Email', onPress: () => console.log('Opening email...') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const handleGetDirections = () => {
    console.log('Opening maps for directions to:', bookingConfirmation.address);
    Alert.alert('Directions', 'Opening maps app for directions...');
  };
  
  const handleCancelBooking = () => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel this booking?\n\n${bookingConfirmation.cancellationPolicy}`,
      [
        { text: 'Keep Booking', style: 'cancel' },
        {
          text: 'Cancel Booking',
          style: 'destructive',
          onPress: () => {
            console.log('Cancelling booking:', bookingConfirmation.bookingId);
            Alert.alert('Booking Cancelled', 'Your booking has been cancelled successfully.');
          },
        },
      ]
    );
  };
  
  const handleModifyBooking = () => {
    Alert.alert(
      'Modify Booking',
      'Contact the property directly to modify your booking details.',
      [
        { text: 'Contact Property', onPress: handleContactProperty },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };
  
  const handleViewBookings = () => {
    router.push('/(tabs)/favorites'); // Navigate to bookings/favorites tab
  };
  
  const handleBackToHome = () => {
    router.push('/(tabs)/search');
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Success Animation */}
        <Animated.View 
          style={[
            styles.successContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <CheckCircle size={60} color="#28a745" fill="#28a745" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>
            Your reservation has been successfully confirmed
          </Text>
          <Text style={styles.confirmationNumber}>
            Confirmation: {bookingConfirmation.confirmationNumber}
          </Text>
        </Animated.View>
        
        {/* Booking Summary */}
        <Animated.View style={[styles.bookingSummary, { opacity: fadeAnim }]}>
          <View style={styles.accommodationHeader}>
            <Image 
              source={{ uri: bookingConfirmation.accommodationImage }} 
              style={styles.accommodationImage} 
            />
            <View style={styles.accommodationInfo}>
              <Text style={styles.accommodationName}>{bookingConfirmation.accommodationName}</Text>
              <View style={styles.locationContainer}>
                <MapPin size={14} color="#666" />
                <Text style={styles.location}>{bookingConfirmation.location}</Text>
              </View>
              <View style={styles.ratingContainer}>
                <Star size={14} color="#FFD700" fill="#FFD700" />
                <Text style={styles.rating}>{bookingConfirmation.rating}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Booking Details */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Calendar size={20} color="#007AFF" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Check-in</Text>
                <Text style={styles.detailValue}>{formatTime(bookingConfirmation.checkIn)}</Text>
                <Text style={styles.detailSubtext}>After {bookingConfirmation.checkInTime}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Calendar size={20} color="#007AFF" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Check-out</Text>
                <Text style={styles.detailValue}>{formatTime(bookingConfirmation.checkOut)}</Text>
                <Text style={styles.detailSubtext}>Before {bookingConfirmation.checkOutTime}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <User size={20} color="#007AFF" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Guests</Text>
                <Text style={styles.detailValue}>{bookingConfirmation.adults + bookingConfirmation.children} guests</Text>
                <Text style={styles.detailSubtext}>{bookingConfirmation.adults} adults{bookingConfirmation.children > 0 ? `, ${bookingConfirmation.children} children` : ''}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <Home size={20} color="#007AFF" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Room</Text>
                <Text style={styles.detailValue}>{bookingConfirmation.rooms} room{bookingConfirmation.rooms !== 1 ? 's' : ''}</Text>
                <Text style={styles.detailSubtext}>{bookingConfirmation.roomType}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.addressContainer}>
            <MapPin size={16} color="#666" />
            <View style={styles.addressContent}>
              <Text style={styles.addressText}>{bookingConfirmation.address}</Text>
              <TouchableOpacity style={styles.directionsButton} onPress={handleGetDirections}>
                <Navigation size={14} color="#007AFF" />
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        
        {/* Guest Information */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          
          <View style={styles.guestInfo}>
            <View style={styles.guestItem}>
              <User size={16} color="#666" />
              <Text style={styles.guestText}>{bookingConfirmation.guestName}</Text>
            </View>
            <View style={styles.guestItem}>
              <Mail size={16} color="#666" />
              <Text style={styles.guestText}>{bookingConfirmation.guestEmail}</Text>
            </View>
            <View style={styles.guestItem}>
              <Phone size={16} color="#666" />
              <Text style={styles.guestText}>{bookingConfirmation.guestPhone}</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Payment Summary */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          
          <View style={styles.paymentBreakdown}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentItemLabel}>Room ({calculateNights()} nights)</Text>
              <Text style={styles.paymentItemValue}>{formatCurrency(bookingConfirmation.subtotal)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentItemLabel}>Service fee</Text>
              <Text style={styles.paymentItemValue}>{formatCurrency(bookingConfirmation.serviceFee)}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentItemLabel}>Taxes & fees</Text>
              <Text style={styles.paymentItemValue}>{formatCurrency(bookingConfirmation.taxes)}</Text>
            </View>
            <View style={[styles.paymentRow, styles.totalPaymentRow]}>
              <Text style={styles.paymentTotalLabel}>Total Paid</Text>
              <Text style={styles.paymentTotalValue}>{formatCurrency(bookingConfirmation.totalAmount)}</Text>
            </View>
          </View>
          
          <View style={styles.paymentMethodContainer}>
            <CreditCard size={16} color="#666" />
            <Text style={styles.paymentMethodText}>{bookingConfirmation.paymentMethod}</Text>
          </View>
          
          <Text style={styles.paymentDate}>
            Paid on {bookingConfirmation.bookingDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Animated.View>
        
        {/* Special Requests */}
        {bookingConfirmation.specialRequests && (
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <Text style={styles.sectionTitle}>Special Requests</Text>
            <View style={styles.specialRequestsContainer}>
              <FileText size={16} color="#666" />
              <Text style={styles.specialRequestsText}>{bookingConfirmation.specialRequests}</Text>
            </View>
          </Animated.View>
        )}
        
        {/* Cancellation Policy */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Cancellation Policy</Text>
          <View style={styles.policyContainer}>
            <Shield size={16} color="#28a745" />
            <Text style={styles.policyText}>{bookingConfirmation.cancellationPolicy}</Text>
          </View>
        </Animated.View>
        
        {/* Important Information */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          
          <View style={styles.importantInfo}>
            <View style={styles.importantItem}>
              <Bell size={16} color="#007AFF" />
              <Text style={styles.importantText}>
                A confirmation email has been sent to {bookingConfirmation.guestEmail}
              </Text>
            </View>
            <View style={styles.importantItem}>
              <User size={16} color="#007AFF" />
              <Text style={styles.importantText}>
                Please bring a valid government-issued ID for check-in
              </Text>
            </View>
            <View style={styles.importantItem}>
              <Clock size={16} color="#007AFF" />
              <Text style={styles.importantText}>
                Check-in: {bookingConfirmation.checkInTime} | Check-out: {bookingConfirmation.checkOutTime}
              </Text>
            </View>
            <View style={styles.importantItem}>
              <Phone size={16} color="#007AFF" />
              <Text style={styles.importantText}>
                Property contact: {bookingConfirmation.propertyPhone}
              </Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Quick Actions */}
        <Animated.View style={[styles.quickActions, { opacity: fadeAnim }]}>
          <TouchableOpacity style={styles.quickActionButton} onPress={handleContactProperty}>
            <Phone size={20} color="#007AFF" />
            <Text style={styles.quickActionText}>Contact</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleGetDirections}>
            <Navigation size={20} color="#007AFF" />
            <Text style={styles.quickActionText}>Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, isLoading && styles.quickActionButtonDisabled]} 
            onPress={handleDownloadConfirmation}
            disabled={isLoading}
          >
            <Download size={20} color={isLoading ? "#ccc" : "#007AFF"} />
            <Text style={[styles.quickActionText, isLoading && styles.quickActionTextDisabled]}>
              {isLoading ? 'Generating...' : 'Download'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleShareConfirmation}>
            <Share size={20} color="#007AFF" />
            <Text style={styles.quickActionText}>Share</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Booking Management */}
        <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>Manage Booking</Text>
          
          <View style={styles.managementButtons}>
            <TouchableOpacity style={styles.managementButton} onPress={handleModifyBooking}>
              <Text style={styles.managementButtonText}>Modify Booking</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.managementButton, styles.cancelButton]} 
              onPress={handleCancelBooking}
            >
              <Text style={[styles.managementButtonText, styles.cancelButtonText]}>Cancel Booking</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Bottom Actions */}
      <Animated.View style={[styles.bottomActions, { paddingBottom: insets.bottom + 10, opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.viewBookingsButton} onPress={handleViewBookings}>
          <Text style={styles.viewBookingsButtonText}>View All Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.homeButton} onPress={handleBackToHome}>
          <Text style={styles.homeButtonText}>Continue Exploring</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmationNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookingSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  accommodationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accommodationImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  accommodationInfo: {
    flex: 1,
  },
  accommodationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
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
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '48%',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  detailSubtext: {
    fontSize: 12,
    color: '#666',
  },
  guestInfo: {
    gap: 12,
  },
  guestItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestText: {
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  paymentSummary: {
    gap: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  paymentValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  paymentSubtext: {
    fontSize: 14,
    color: '#666',
  },
  importantInfo: {
    gap: 8,
  },
  importantText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomActions: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
  viewBookingsButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewBookingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  homeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  addressContent: {
    flex: 1,
    marginLeft: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  directionsText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
    fontWeight: '500',
  },
  paymentBreakdown: {
    gap: 12,
  },
  paymentItemLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentItemValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  totalPaymentRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  paymentTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  paymentTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
  },
  paymentMethodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  paymentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  specialRequestsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  specialRequestsText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f0f8f0',
    borderRadius: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  importantItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '22%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  quickActionButtonDisabled: {
    opacity: 0.5,
  },
  quickActionText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'center',
  },
  quickActionTextDisabled: {
    color: '#ccc',
  },
  managementButtons: {
    gap: 12,
  },
  managementButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  managementButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  cancelButton: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  cancelButtonText: {
    color: '#dc3545',
  },
});