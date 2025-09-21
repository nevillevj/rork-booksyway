import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share as ShareIcon,
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Shield,
  X,
  Award,
} from 'lucide-react-native';
import { MOCK_ACCOMMODATIONS, AMENITY_ICONS, ATTRACTION_ICONS } from '@/constants/mockData';

const { width: screenWidth } = Dimensions.get('window');

export default function AccommodationDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // In a real app, you would fetch accommodation details based on params.id
  const accommodation = MOCK_ACCOMMODATIONS.find(acc => acc.id === params.id) || MOCK_ACCOMMODATIONS[0];

  const searchParams = useMemo(() => {
    if (!params.checkIn) return null;
    
    return {
      checkIn: params.checkIn ? new Date(params.checkIn as string) : null,
      checkOut: params.checkOut ? new Date(params.checkOut as string) : null,
      adults: parseInt(params.adults as string) || 2,
      children: parseInt(params.children as string) || 0,
      rooms: parseInt(params.rooms as string) || 1,
    };
  }, [params]);

  const calculateNights = () => {
    if (!searchParams?.checkIn || !searchParams?.checkOut) return 1;
    const diffTime = searchParams.checkOut.getTime() - searchParams.checkIn.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };



  const handleShare = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web fallback - copy to clipboard or use Web Share API if available
        const shareData = {
          title: accommodation.name,
          text: `Check out ${accommodation.name} in ${accommodation.location}!`,
          url: `https://booksy.com/accommodation/${accommodation.id}`,
        };
        
        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
          await navigator.share(shareData);
        } else {
          // Fallback to copying URL to clipboard
          await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
          alert('Link copied to clipboard!');
        }
      } else {
        // Native sharing
        await Share.share({
          message: `Check out ${accommodation.name} in ${accommodation.location}!`,
          url: Platform.OS === 'ios' ? `https://booksy.com/accommodation/${accommodation.id}` : undefined,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback for any errors
      if (Platform.OS === 'web') {
        const fallbackText = `Check out ${accommodation.name} in ${accommodation.location}! https://booksy.com/accommodation/${accommodation.id}`;
        try {
          await navigator.clipboard.writeText(fallbackText);
          alert('Link copied to clipboard!');
        } catch (clipboardError) {
          console.error('Clipboard error:', clipboardError);
          alert('Unable to share. Please copy the link manually.');
        }
      }
    }
  };

  const handleBookNow = () => {
    console.log('Book Now pressed for:', accommodation.name);
    console.log('Search params:', searchParams);
    
    // Navigate to booking screen with search parameters
    const bookingParams = new URLSearchParams({
      id: accommodation.id,
      checkIn: searchParams?.checkIn?.toISOString() || '',
      checkOut: searchParams?.checkOut?.toISOString() || '',
      adults: searchParams?.adults.toString() || '2',
      children: searchParams?.children.toString() || '0',
      rooms: searchParams?.rooms.toString() || '1',
    });
    
    router.push(`/booking?${bookingParams.toString()}`);
  };

  const renderImageGallery = () => {
    return (
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
            setCurrentImageIndex(index);
          }}
        >
          {accommodation.images.map((image, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setShowAllImages(true)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: image }} style={styles.heroImage} />
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Image indicators */}
        <View style={styles.imageIndicators}>
          {accommodation.images.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentImageIndex && styles.activeIndicator,
              ]}
            />
          ))}
        </View>
        
        {/* Header overlay */}
        <View style={[styles.headerOverlay, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <ShareIcon size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                size={20}
                color={isFavorite ? '#FF6B6B' : 'white'}
                fill={isFavorite ? '#FF6B6B' : 'transparent'}
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Image count badge */}
        <TouchableOpacity
          style={styles.imageCountBadge}
          onPress={() => setShowAllImages(true)}
        >
          <Text style={styles.imageCountText}>
            {currentImageIndex + 1} / {accommodation.images.length}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderAmenities = () => {
    const displayAmenities = showAllAmenities 
      ? accommodation.amenities 
      : accommodation.amenities.slice(0, 6);

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenitiesGrid}>
          {displayAmenities.map((amenity, index) => {
            const iconName = AMENITY_ICONS[amenity];
            const IconComponent = iconName === 'Wifi' ? Wifi : iconName === 'Car' ? Car : iconName === 'Coffee' ? Coffee : null;
            return (
              <View key={index} style={styles.amenityItem}>
                {IconComponent ? (
                  <IconComponent size={20} color="#007AFF" />
                ) : (
                  <Text style={styles.amenityEmoji}>{iconName}</Text>
                )}
                <Text style={styles.amenityText}>
                  {amenity.charAt(0).toUpperCase() + amenity.slice(1).replace('-', ' ')}
                </Text>
              </View>
            );
          })}
        </View>
        
        {accommodation.amenities.length > 6 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllAmenities(!showAllAmenities)}
          >
            <Text style={styles.showMoreText}>
              {showAllAmenities ? 'Show less' : `Show all ${accommodation.amenities.length} amenities`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderReviews = () => {
    const displayReviews = showAllReviews 
      ? accommodation.reviews 
      : accommodation.reviews.slice(0, 2);

    return (
      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <View style={styles.ratingOverview}>
            <Star size={20} color="#FFD700" fill="#FFD700" />
            <Text style={styles.overallRating}>{accommodation.rating}</Text>
            <Text style={styles.reviewCount}>({accommodation.reviewCount} reviews)</Text>
          </View>
        </View>
        
        {displayReviews.map((review) => (
          <View key={review.id} style={styles.reviewItem}>
            <View style={styles.reviewHeader}>
              <Image source={{ uri: review.userImage }} style={styles.reviewerImage} />
              <View style={styles.reviewerInfo}>
                <Text style={styles.reviewerName}>{review.userName}</Text>
                <View style={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      color={i < review.rating ? '#FFD700' : '#E0E0E0'}
                      fill={i < review.rating ? '#FFD700' : '#E0E0E0'}
                    />
                  ))}
                  <Text style={styles.reviewDate}>
                    {new Date(review.date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <Text style={styles.reviewHelpful}>{review.helpful} people found this helpful</Text>
          </View>
        ))}
        
        {accommodation.reviews.length > 2 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => setShowAllReviews(!showAllReviews)}
          >
            <Text style={styles.showMoreText}>
              {showAllReviews ? 'Show less' : `Show all ${accommodation.reviews.length} reviews`}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        
        {/* Main Content */}
        <View style={styles.content}>
          {/* Title and Location */}
          <View style={styles.titleSection}>
            <Text style={styles.accommodationName}>{accommodation.name}</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#666" />
              <Text style={styles.location}>{accommodation.location}</Text>
            </View>
            <Text style={styles.distance}>{accommodation.distance}</Text>
          </View>
          
          {/* Host Info */}
          <View style={styles.hostSection}>
            <Image source={{ uri: accommodation.hostImage }} style={styles.hostImage} />
            <View style={styles.hostInfo}>
              <Text style={styles.hostName}>Hosted by {accommodation.hostName}</Text>
              <Text style={styles.hostDetails}>
                Host since {accommodation.hostJoinedYear} · {accommodation.maxGuests} guests max
              </Text>
            </View>
          </View>
          
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this place</Text>
            <Text style={styles.description}>{accommodation.description}</Text>
          </View>
          
          {/* Amenities */}
          {renderAmenities()}
          
          {/* Check-in/out Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Check-in & Check-out</Text>
            <View style={styles.checkInOutContainer}>
              <View style={styles.checkInOutItem}>
                <Text style={styles.checkInOutLabel}>Check-in</Text>
                <Text style={styles.checkInOutTime}>{accommodation.checkInTime}</Text>
              </View>
              <View style={styles.checkInOutItem}>
                <Text style={styles.checkInOutLabel}>Check-out</Text>
                <Text style={styles.checkInOutTime}>{accommodation.checkOutTime}</Text>
              </View>
            </View>
          </View>
          
          {/* Cancellation Policy */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cancellation Policy</Text>
            <View style={styles.policyContainer}>
              <Shield size={20} color="#28a745" />
              <Text style={styles.policyText}>{accommodation.cancellationPolicy}</Text>
            </View>
          </View>
          
          {/* Highlights */}
          {accommodation.highlights && accommodation.highlights.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What makes this place special</Text>
              {accommodation.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Award size={16} color="#007AFF" />
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* Reviews */}
          {renderReviews()}
          
          {/* Nearby Attractions */}
          {accommodation.nearbyAttractions && accommodation.nearbyAttractions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What&apos;s nearby</Text>
              {accommodation.nearbyAttractions.map((attraction, index) => (
                <View key={index} style={styles.attractionItem}>
                  <Text style={styles.attractionIcon}>{ATTRACTION_ICONS[attraction.type]}</Text>
                  <View style={styles.attractionInfo}>
                    <Text style={styles.attractionName}>{attraction.name}</Text>
                    <Text style={styles.attractionDistance}>{attraction.distance}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.fullAddress}>{accommodation.fullAddress}</Text>
            <View style={styles.mapPlaceholder}>
              <MapPin size={40} color="#007AFF" />
              <Text style={styles.mapPlaceholderText}>Map view coming soon</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Bottom Booking Bar */}
      <View style={[styles.bookingBar, { paddingBottom: insets.bottom + 10 }]}>
        <View style={styles.priceInfo}>
          <View style={styles.priceContainer}>
            {accommodation.originalPrice && (
              <Text style={styles.originalPrice}>${accommodation.originalPrice}</Text>
            )}
            <Text style={styles.price}>${accommodation.price}</Text>
            <Text style={styles.priceUnit}>per night</Text>
          </View>
          {searchParams && (
            <Text style={styles.totalPrice}>
              ${accommodation.price * calculateNights()} total for {calculateNights()} night{calculateNights() !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      
      {/* Image Gallery Modal */}
      <Modal
        visible={showAllImages}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAllImages(false)}
      >
        <View style={styles.galleryModal}>
          <View style={[styles.galleryHeader, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity
              style={styles.galleryCloseButton}
              onPress={() => setShowAllImages(false)}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.galleryTitle}>
              {currentImageIndex + 1} of {accommodation.images.length}
            </Text>
          </View>
          
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              setCurrentImageIndex(index);
            }}
          >
            {accommodation.images.map((image, index) => (
              <Image key={index} source={{ uri: image }} style={styles.galleryImage} />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageContainer: {
    position: 'relative',
  },
  heroImage: {
    width: screenWidth,
    height: 300,
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'white',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  imageCountBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 20,
  },
  accommodationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 20,
  },
  hostImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  hostDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  showMoreButton: {
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  checkInOutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  checkInOutItem: {
    flex: 1,
  },
  checkInOutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  checkInOutTime: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  policyContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  policyText: {
    fontSize: 14,
    color: '#28a745',
    marginLeft: 8,
    flex: 1,
  },
  reviewsHeader: {
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  overallRating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  reviewHelpful: {
    fontSize: 12,
    color: '#666',
  },
  fullAddress: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  bookingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
  priceInfo: {
    flex: 1,
  },
  priceContainer: {
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  priceUnit: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  totalPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  bookButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  galleryModal: {
    flex: 1,
    backgroundColor: 'black',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  galleryCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  galleryImage: {
    width: screenWidth,
    height: '100%',
    resizeMode: 'contain',
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  attractionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attractionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  attractionInfo: {
    flex: 1,
  },
  attractionName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  attractionDistance: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});