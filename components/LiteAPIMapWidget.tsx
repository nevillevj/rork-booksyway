import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Text } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface LiteAPIMapWidgetProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  accommodationName: string;
  address: string;
}

const LiteAPIMapWidget: React.FC<LiteAPIMapWidgetProps> = ({
  coordinates,
  accommodationName,
  address,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInitialized = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || mapInitialized.current) return;

    const initializeMap = () => {
      // Check if LiteAPI SDK is loaded
      if (typeof window !== 'undefined' && (window as any).LiteAPI) {
        try {
          // Initialize LiteAPI with a demo public key
          // To get your actual public key:
          // 1. Get your WhiteLabel URL (e.g., 'your-whitelabel-url.nuitee.link')
          // 2. Encode it using btoa() in browser console: btoa('your-whitelabel-url.nuitee.link')
          // 3. Replace the demo key below with your encoded key
          const publicKey = btoa('demo.liteapi.travel'); // Replace with your actual encoded WhiteLabel URL
          
          (window as any).LiteAPI.init({
            publicKey: publicKey
          });

          // Create the map with the accommodation coordinates
          // Using Google Place ID format as per LiteAPI documentation
          const placeId = `ChIJ${Math.random().toString(36).substr(2, 20)}`; // Generate a demo place ID
          
          (window as any).LiteAPI.Map.create({
            selector: '#lite-api-map',
            placeId: placeId,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            zoom: 15,
            height: 200,
            markers: [{
              latitude: coordinates.latitude,
              longitude: coordinates.longitude,
              title: accommodationName,
              description: address
            }]
          });

          mapInitialized.current = true;
        } catch (error) {
          console.error('Error initializing LiteAPI map:', error);
        }
      } else {
        // Retry after a short delay if SDK is not loaded yet
        setTimeout(initializeMap, 500);
      }
    };

    // Load the LiteAPI SDK if not already loaded
    if (!document.querySelector('script[src*="components.liteapi.travel"]')) {
      const script = document.createElement('script');
      script.src = 'https://components.liteapi.travel/v1.0/sdk.umd.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initializeMap, 100);
      };
      script.onerror = () => {
        console.error('Failed to load LiteAPI SDK');
      };
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [coordinates, accommodationName, address]);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <div
          id="lite-api-map"
          ref={mapContainerRef}
          style={webMapStyles}
        />
      </View>
    );
  }

  // Mobile fallback - show a simple map placeholder with coordinates
  return (
    <View style={styles.mobileContainer}>
      <View style={styles.mapPlaceholder}>
        <MapPin size={40} color="#007AFF" />
        <Text style={styles.coordinatesText}>
          {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
        </Text>
        <Text style={styles.mapPlaceholderText}>Interactive map available on web</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  mobileContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  mapPlaceholderText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

const webMapStyles = {
  height: '200px',
  width: '100%',
  borderRadius: '12px',
  overflow: 'hidden',
  backgroundColor: '#f8f9fa'
};

export default LiteAPIMapWidget;