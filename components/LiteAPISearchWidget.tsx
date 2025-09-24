import React, { useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

interface LiteAPISearchWidgetProps {
  publicKey?: string;
  style?: any;
}

export default function LiteAPISearchWidget({ 
  publicKey = 'd2hpdGVsYWJlbC5udWl0ZWUubGluaw==', // Default encoded key
  style 
}: LiteAPISearchWidgetProps) {
  const webViewRef = useRef<WebView>(null);

  // HTML content with the LiteAPI Search Bar Widget
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>LiteAPI Search Widget</title>
        <script src="https://components.liteapi.travel/v1.0/sdk.umd.js"></script>
        <style>
            body {
                margin: 0;
                padding: 16px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background-color: transparent;
            }
            #search-bar {
                width: 100%;
                min-height: 200px;
            }
            /* Custom styling to match app theme */
            .lite-search-widget {
                border-radius: 8px;
                overflow: hidden;
            }
        </style>
    </head>
    <body>
        <div id="search-bar" style="width: 100%;"></div>
        
        <script>
            try {
                console.log('Initializing LiteAPI Search Widget...');
                
                LiteAPI.init({
                    publicKey: '${publicKey}'
                });
                
                LiteAPI.SearchBar.create({
                    selector: '#search-bar',
                    style: {
                        primaryColor: '#0F4C81',
                        secondaryColor: '#ff6900',
                        borderRadius: '8px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    },
                    defaultValues: {
                        currency: 'USD',
                        language: 'en'
                    },
                    features: {
                        showGuestSelector: true,
                        showDatePicker: true,
                        showDestinationSearch: true
                    },
                    onSearch: function(searchData) {
                        console.log('Search initiated:', searchData);
                        // Post message to React Native
                        if (window.ReactNativeWebView) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'search',
                                data: searchData
                            }));
                        }
                    }
                });
                
                console.log('LiteAPI Search Widget initialized successfully');
            } catch (error) {
                console.error('Error initializing LiteAPI Search Widget:', error);
                document.getElementById('search-bar').innerHTML = 
                    '<div style="padding: 20px; text-align: center; color: #666; border: 1px solid #ddd; border-radius: 8px;">' +
                    'Search widget failed to load. Please check your connection.' +
                    '</div>';
            }
        </script>
    </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Received message from WebView:', message);
      
      if (message.type === 'search') {
        console.log('Search data received:', message.data);
        // Handle search data here - you can navigate to results page
        // or emit an event to parent component
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (Platform.OS === 'web') {
    // For web platform, render the widget directly
    return (
      <View style={[styles.container, style]}>
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={styles.webContainer}
        />
      </View>
    );
  }

  // For mobile platforms, use WebView
  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webView}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onError={(error: any) => {
          console.error('WebView error:', error);
        }}
        onHttpError={(error: any) => {
          console.error('WebView HTTP error:', error);
        }}
        onLoadEnd={() => {
          console.log('LiteAPI Search Widget WebView loaded');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 200,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webContainer: {
    width: '100%',
    minHeight: 200,
  },
});