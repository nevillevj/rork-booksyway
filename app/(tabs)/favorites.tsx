import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react-native';
import { useFavorites } from '@/contexts/FavoritesContext';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, removeFromFavorites, isLoading } = useFavorites();

  const handleRemoveFavorite = async (id: string) => {
    await removeFromFavorites(id);
  };

  const handleItemPress = (item: any) => {
    // Navigate to accommodation details
    router.push(`/accommodation/${item.id}`);
  };

  const renderFavoriteItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity style={styles.favoriteCard} onPress={() => handleItemPress(item)}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.favoriteImage} />
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item.id)}
          >
            <Trash2 size={16} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteName} numberOfLines={1}>
            {item.name}
          </Text>
          
          <View style={styles.locationContainer}>
            <MapPin size={12} color="#666" />
            <Text style={styles.location}>{item.location}</Text>
          </View>
          
          <View style={styles.ratingPriceContainer}>
            <View style={styles.ratingContainer}>
              <Star size={12} color="#FFD700" fill="#FFD700" />
              <Text style={styles.rating}>{item.rating}</Text>
              <Text style={styles.reviewCount}>({item.reviewCount})</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.price}>${item.price}</Text>
              <Text style={styles.priceUnit}>per night</Text>
            </View>
          </View>
          
          <Text style={styles.addedDate}>
            Added {new Date(item.addedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Favorites</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your favorites...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        {favorites.length > 0 && (
          <Text style={styles.headerSubtitle}>
            {favorites.length} saved place{favorites.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Heart size={48} color="#ccc" style={styles.icon} />
          <Text style={styles.title}>No favorites yet</Text>
          <Text style={styles.subtitle}>
            Start exploring and save your favorite places to stay
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
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
    paddingBottom: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
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
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  favoriteImage: {
    width: '100%',
    height: 180,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(220, 53, 69, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteInfo: {
    padding: 16,
  },
  favoriteName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  ratingPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
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
  addedDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});