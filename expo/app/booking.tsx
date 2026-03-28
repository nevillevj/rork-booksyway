import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  CreditCard,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react-native';

interface BookingDetails {
  accommodationId: string;
  accommodationName: string;
  accommodationImage: string;
  location: string;
  rating: number;
  reviewCount: number;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  rooms: number;
  pricePerNight: number;
  totalNights: number;
  subtotal: number;
  taxes: number;
  serviceFee: number;
  total: number;
}

interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialRequests: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple-pay' | 'google-pay';
  name: string;
  icon: string;
  last4?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: '1',
    type: 'card',
    name: 'Credit/Debit Card',
    icon: '💳',
  },
  {
    id: '2',
    type: 'paypal',
    name: 'PayPal',
    icon: '🅿️',
  },
  {
    id: '3',
    type: 'apple-pay',
    name: 'Apple Pay',
    icon: '🍎',
  },
  {
    id: '4',
    type: 'google-pay',
    name: 'Google Pay',
    icon: '🅖',
  },
];

export default function BookingScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  // Mock booking details - in real app, fetch based on params
  const bookingDetails: BookingDetails = useMemo(() => {
    const checkIn = params.checkIn ? new Date(params.checkIn as string) : new Date();
    const checkOut = params.checkOut ? new Date(params.checkOut as string) : new Date(Date.now() + 86400000);
    const adults = parseInt(params.adults as string) || 2;
    const children = parseInt(params.children as string) || 0;
    const rooms = parseInt(params.rooms as string) || 1;
    const pricePerNight = 189;
    const totalNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const subtotal = pricePerNight * totalNights;
    const taxes = Math.round(subtotal * 0.12);
    const serviceFee = Math.round(subtotal * 0.05);
    const total = subtotal + taxes + serviceFee;
    
    return {
      accommodationId: params.id as string || '1',
      accommodationName: 'Grand Hotel Central',
      accommodationImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
      location: 'City Center, Paris',
      rating: 4.8,
      reviewCount: 1247,
      checkIn,
      checkOut,
      adults,
      children,
      rooms,
      pricePerNight,
      totalNights,
      subtotal,
      taxes,
      serviceFee,
      total,
    };
  }, [params]);
  
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: '',
  });
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('1');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [subscribeToOffers, setSubscribeToOffers] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };
  
  const validateForm = () => {
    if (!guestInfo.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    if (!guestInfo.lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }
    if (!guestInfo.email.trim() || !guestInfo.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!guestInfo.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (selectedPaymentMethod === '1') {
      if (!cardDetails.number.trim() || cardDetails.number.length < 16) {
        Alert.alert('Error', 'Please enter a valid card number');
        return false;
      }
      if (!cardDetails.expiry.trim() || !cardDetails.expiry.includes('/')) {
        Alert.alert('Error', 'Please enter card expiry date (MM/YY)');
        return false;
      }
      if (!cardDetails.cvv.trim() || cardDetails.cvv.length < 3) {
        Alert.alert('Error', 'Please enter a valid CVV');
        return false;
      }
      if (!cardDetails.name.trim()) {
        Alert.alert('Error', 'Please enter the name on card');
        return false;
      }
    }
    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return false;
    }
    return true;
  };
  
  const handleBooking = async () => {
    console.log('handleBooking called');
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }
    
    console.log('Form validation passed, starting booking process');
    setIsProcessing(true);
    
    try {
      // Simulate booking process
      console.log('Simulating booking process...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In real app, make API call to create booking
      console.log('Booking details:', {
        ...bookingDetails,
        guestInfo,
        paymentMethod: selectedPaymentMethod,
        agreeToTerms,
        subscribeToOffers,
      });
      
      // Navigate to confirmation screen with booking data
      const confirmationParams: Record<string, string> = {
        bookingId: 'BK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        accommodationName: bookingDetails.accommodationName,
        accommodationImage: bookingDetails.accommodationImage,
        location: bookingDetails.location,
        rating: bookingDetails.rating.toString(),
        reviewCount: bookingDetails.reviewCount.toString(),
        checkIn: bookingDetails.checkIn.toISOString(),
        checkOut: bookingDetails.checkOut.toISOString(),
        adults: bookingDetails.adults.toString(),
        children: bookingDetails.children.toString(),
        rooms: bookingDetails.rooms.toString(),
        roomType: 'Deluxe King Room',
        subtotal: bookingDetails.subtotal.toString(),
        taxes: bookingDetails.taxes.toString(),
        serviceFee: bookingDetails.serviceFee.toString(),
        totalAmount: bookingDetails.total.toString(),
        guestName: `${guestInfo.firstName} ${guestInfo.lastName}`,
        guestEmail: guestInfo.email,
        guestPhone: guestInfo.phone,
        confirmationNumber: 'CNF' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        paymentMethod: selectedPaymentMethod === '1' ? `Credit Card ending in ${cardDetails.number.slice(-4)}` : PAYMENT_METHODS.find(m => m.id === selectedPaymentMethod)?.name || 'Unknown',
      };
      
      // Add special requests only if they exist
      if (guestInfo.specialRequests && guestInfo.specialRequests.trim()) {
        confirmationParams.specialRequests = guestInfo.specialRequests;
      }
      
      console.log('Navigating to confirmation with params:', confirmationParams);
      console.log('About to call router.push...');
      
      // Use router.push to ensure navigation happens
      const result = router.push({
        pathname: '/booking-confirmation',
        params: confirmationParams,
      });
      
      console.log('router.push result:', result);
      console.log('Navigation should have completed');
      
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to process booking. Please try again.');
    } finally {
      console.log('Setting isProcessing to false');
      setIsProcessing(false);
    }
  };
  
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return cleaned;
    }
  };
  
  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };
  
  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Your Stay</Text>
        <View style={styles.placeholder} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Accommodation Summary */}
        <View style={styles.accommodationSummary}>
          <Image 
            source={{ uri: bookingDetails.accommodationImage }} 
            style={styles.accommodationImage} 
          />
          <View style={styles.accommodationInfo}>
            <Text style={styles.accommodationName}>{bookingDetails.accommodationName}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={14} color="#666" />
              <Text style={styles.location}>{bookingDetails.location}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <Star size={14} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{bookingDetails.rating}</Text>
              <Text style={styles.reviewCount}>({bookingDetails.reviewCount})</Text>
            </View>
          </View>
        </View>
        
        {/* Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          <View style={styles.bookingDetailsContainer}>
            <View style={styles.bookingDetailRow}>
              <View style={styles.bookingDetailItem}>
                <Calendar size={16} color="#666" />
                <Text style={styles.bookingDetailLabel}>Check-in</Text>
                <Text style={styles.bookingDetailValue}>{formatDate(bookingDetails.checkIn)}</Text>
              </View>
              <View style={styles.bookingDetailItem}>
                <Calendar size={16} color="#666" />
                <Text style={styles.bookingDetailLabel}>Check-out</Text>
                <Text style={styles.bookingDetailValue}>{formatDate(bookingDetails.checkOut)}</Text>
              </View>
            </View>
            <View style={styles.bookingDetailRow}>
              <View style={styles.bookingDetailItem}>
                <User size={16} color="#666" />
                <Text style={styles.bookingDetailLabel}>Guests</Text>
                <Text style={styles.bookingDetailValue}>
                  {bookingDetails.adults + bookingDetails.children} guest{bookingDetails.adults + bookingDetails.children !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.bookingDetailItem}>
                <Text style={styles.bookingDetailLabel}>Rooms</Text>
                <Text style={styles.bookingDetailValue}>
                  {bookingDetails.rooms} room{bookingDetails.rooms !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Guest Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Information</Text>
          <View style={styles.inputContainer}>
            <View style={styles.inputRow}>
              <View style={[styles.inputWrapper, { marginRight: 8 }]}>
                <Text style={styles.inputLabel}>First Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={guestInfo.firstName}
                  onChangeText={(text) => setGuestInfo(prev => ({ ...prev, firstName: text }))}
                  placeholder="Enter first name"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.inputWrapper, { marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Last Name *</Text>
                <TextInput
                  style={styles.textInput}
                  value={guestInfo.lastName}
                  onChangeText={(text) => setGuestInfo(prev => ({ ...prev, lastName: text }))}
                  placeholder="Enter last name"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <TextInput
                style={styles.textInput}
                value={guestInfo.email}
                onChangeText={(text) => setGuestInfo(prev => ({ ...prev, email: text }))}
                placeholder="Enter email address"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.textInput}
                value={guestInfo.phone}
                onChangeText={(text) => setGuestInfo(prev => ({ ...prev, phone: text }))}
                placeholder="Enter phone number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Special Requests (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={guestInfo.specialRequests}
                onChangeText={(text) => setGuestInfo(prev => ({ ...prev, specialRequests: text }))}
                placeholder="Any special requests or notes..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>
        
        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethods}>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod === method.id && styles.paymentMethodSelected,
                ]}
                onPress={() => setSelectedPaymentMethod(method.id)}
              >
                <View style={styles.paymentMethodInfo}>
                  <Text style={styles.paymentMethodIcon}>{method.icon}</Text>
                  <Text style={styles.paymentMethodName}>{method.name}</Text>
                </View>
                <View style={[
                  styles.radioButton,
                  selectedPaymentMethod === method.id && styles.radioButtonSelected,
                ]} />
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Card Details */}
          {selectedPaymentMethod === '1' && (
            <View style={styles.cardDetailsContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Card Number *</Text>
                <TextInput
                  style={styles.textInput}
                  value={cardDetails.number}
                  onChangeText={(text) => setCardDetails(prev => ({ ...prev, number: formatCardNumber(text) }))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={19}
                />
              </View>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputWrapper, { marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Expiry Date *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cardDetails.expiry}
                    onChangeText={(text) => setCardDetails(prev => ({ ...prev, expiry: formatExpiry(text) }))}
                    placeholder="MM/YY"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={[styles.inputWrapper, { marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={cardDetails.cvv}
                    onChangeText={(text) => setCardDetails(prev => ({ ...prev, cvv: text.replace(/[^0-9]/g, '') }))}
                    placeholder="123"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Name on Card *</Text>
                <TextInput
                  style={styles.textInput}
                  value={cardDetails.name}
                  onChangeText={(text) => setCardDetails(prev => ({ ...prev, name: text }))}
                  placeholder="Enter name as on card"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </View>
            </View>
          )}
        </View>
        
        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>
                {formatCurrency(bookingDetails.pricePerNight)} × {bookingDetails.totalNights} night{bookingDetails.totalNights !== 1 ? 's' : ''}
              </Text>
              <Text style={styles.priceValue}>{formatCurrency(bookingDetails.subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Service fee</Text>
              <Text style={styles.priceValue}>{formatCurrency(bookingDetails.serviceFee)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Taxes</Text>
              <Text style={styles.priceValue}>{formatCurrency(bookingDetails.taxes)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(bookingDetails.total)}</Text>
            </View>
          </View>
        </View>
        
        {/* Terms and Conditions */}
        <View style={styles.section}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
            >
              {agreeToTerms && <CheckCircle size={20} color="#007AFF" />}
              {!agreeToTerms && <View style={styles.checkboxEmpty} />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.linkText}>Terms and Conditions</Text>
              {' '}and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setSubscribeToOffers(!subscribeToOffers)}
            >
              {subscribeToOffers && <CheckCircle size={20} color="#007AFF" />}
              {!subscribeToOffers && <View style={styles.checkboxEmpty} />}
            </TouchableOpacity>
            <Text style={styles.checkboxText}>
              Subscribe to special offers and promotions
            </Text>
          </View>
        </View>
        
        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <Shield size={16} color="#28a745" />
          <Text style={styles.securityText}>
            Your payment information is encrypted and secure
          </Text>
        </View>
      </ScrollView>
      
      {/* Bottom Booking Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total: {formatCurrency(bookingDetails.total)}</Text>
          <Text style={styles.totalSubtext}>for {bookingDetails.totalNights} night{bookingDetails.totalNights !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.bookButton, isProcessing && styles.bookButtonDisabled]} 
          onPress={handleBooking}
          disabled={isProcessing}
        >
          <Text style={styles.bookButtonText}>
            {isProcessing ? 'Processing...' : 'Confirm Booking'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  accommodationSummary: {
    flexDirection: 'row',
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
    fontSize: 16,
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
  reviewCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
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
  bookingDetailsContainer: {
    gap: 12,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingDetailItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  bookingDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  bookingDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginTop: 2,
  },
  inputContainer: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a1a',
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentMethods: {
    gap: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  paymentMethodSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentMethodName: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e1e5e9',
  },
  radioButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  cardDetailsContainer: {
    marginTop: 16,
    gap: 16,
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  totalRow: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  checkboxEmpty: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#e1e5e9',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  securityText: {
    fontSize: 12,
    color: '#28a745',
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flex: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalSubtext: {
    fontSize: 12,
    color: '#666',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  bookButtonDisabled: {
    backgroundColor: '#ccc',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});