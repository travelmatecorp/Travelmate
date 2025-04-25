"use client"

import { useRef, useEffect } from "react"
import { StyleSheet, View, ActivityIndicator } from "react-native"
import { WebView } from "react-native-webview"

const MAPBOX_TOKEN = "pk.eyJ1IjoidGFpZ29wIiwiYSI6ImNtOTRsYm9rcjB3b24yanB2NGFob3Y1cjQifQ.0OJbAhuwq3r2Xbz_xH9BCQ"

const MapBoxWebView = ({
  markers = [],
  initialRegion,
  onMapPress,
  onMarkerPress,
  style = {},
  userLocation = null,
  userLocationEnabled = false,
  userTrackingMode = "none",
  // userTrackingMode = false,
}) => {
  const webViewRef = useRef(null)

  // Update user location in the map
  useEffect(() => {
    if (webViewRef.current && userLocation) {
      const message = JSON.stringify({
        type: "updateUserLocation",
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
      })
      webViewRef.current.postMessage(message)
    }
  }, [userLocation])

  // Toggle user tracking mode
  useEffect(() => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: "setUserTrackingMode",
        enabled: userTrackingMode,
      })
      webViewRef.current.postMessage(message)
    }
  }, [userTrackingMode])

  // Generate the HTML content for the WebView
  const generateMapHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.js'></script>
        <link href='https://api.mapbox.com/mapbox-gl-js/v2.14.1/mapbox-gl.css' rel='stylesheet' />
        <style>
          body { margin: 0; padding: 0; }
          #map { position: absolute; top: 0; bottom: 0; width: 100%; }
          .marker {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-weight: bold;
          }
          .marker-hotel { background-color: #4285F4; }
          .marker-restaurant { background-color: #EA4335; }
          .marker-excursion { background-color: #34A853; }
          .marker-default { background-color: #cf3a23; }
          
          .mapboxgl-ctrl-logo, .mapboxgl-ctrl-attrib {
            display: block !important;
            position: absolute;
            bottom: 0;
          }
          
          .user-location-dot {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            background-color: #4285F4;
            border: 2px solid white;
            box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.3);
          }
          
          .user-location-accuracy {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: rgba(66, 133, 244, 0.15);
            border: 1px solid rgba(66, 133, 244, 0.3);
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          mapboxgl.accessToken = '${MAPBOX_TOKEN}';
          
          const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [${initialRegion.longitude}, ${initialRegion.latitude}],
            zoom: 13
          });
          
          // Add navigation controls
          map.addControl(new mapboxgl.NavigationControl());
          
          // User location variables
          let userLocationMarker = null;
          let userAccuracyCircle = null;
          let userTrackingEnabled = ${userTrackingMode};
          
          // Add markers
          ${markers
            .map(
              (marker) => `
            // Create custom marker element
            const el_${marker.id} = document.createElement('div');
            el_${marker.id}.className = 'marker marker-${marker.type || "default"}';
            el_${marker.id}.innerHTML = '${getMarkerIcon(marker.type)}';
            
            // Create the popup
            const popup_${marker.id} = new mapboxgl.Popup({ offset: 25 })
              .setHTML(
                '<div style="padding: 8px;">' +
                '<h3 style="margin: 0 0 8px 0; font-size: 16px;">${marker.name}</h3>' +
                '<div style="display: flex; align-items: center; margin-bottom: 4px;">' +
                '<span style="color: gold;">★</span>' +
                '<span style="margin-left: 4px; font-size: 14px;">${marker.rating}</span>' +
                '</div>' +
                ${marker.price ? `'<p style="margin: 4px 0; color: #cf3a23; font-weight: 500;">${marker.price}</p>' +` : ""} 
                ${marker.cuisine ? `'<p style="margin: 4px 0; color: #666; font-size: 14px;">${marker.cuisine}</p>' +` : ""}
                ${marker.duration ? `'<p style="margin: 4px 0; color: #666; font-size: 14px;">${marker.duration}</p>' +` : ""}
                '</div>'
              );
            
            // Create marker
            const marker_${marker.id} = new mapboxgl.Marker(el_${marker.id})
              .setLngLat([${marker.longitude}, ${marker.latitude}])
              .setPopup(popup_${marker.id})
              .addTo(map);
              
            // Add click event
            el_${marker.id}.addEventListener('click', function() {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'markerPress',
                markerId: '${marker.id}'
              }));
            });
          `,
            )
            .join("\n")}
          
          // Add map click event
          map.on('click', function(e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapClick',
              latitude: e.lngLat.lat,
              longitude: e.lngLat.lng
            }));
          });
          
          // Function to update user location
          function updateUserLocation(lat, lng) {
            // Remove existing markers if they exist
            if (userLocationMarker) {
              userLocationMarker.remove();
            }
            if (userAccuracyCircle) {
              userAccuracyCircle.remove();
            }
            
            // Create accuracy circle element
            const accuracyEl = document.createElement('div');
            accuracyEl.className = 'user-location-accuracy';
            
            // Create user location dot element
            const dotEl = document.createElement('div');
            dotEl.className = 'user-location-dot';
            
            // Add accuracy circle to map
            userAccuracyCircle = new mapboxgl.Marker(accuracyEl)
              .setLngLat([lng, lat])
              .addTo(map);
              
            // Add user location dot to map
            userLocationMarker = new mapboxgl.Marker(dotEl)
              .setLngLat([lng, lat])
              .addTo(map);
              
            // If tracking is enabled, center map on user location
            if (userTrackingEnabled) {
              map.flyTo({
                center: [lng, lat],
                zoom: 15
              });
            }
          }
          
          // Function to toggle user tracking mode
          function setUserTrackingMode(enabled) {
            userTrackingEnabled = enabled;
          }
          
          // Listen for messages from React Native
          window.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            
            if (message.type === 'updateUserLocation') {
              updateUserLocation(message.latitude, message.longitude);
            } else if (message.type === 'setUserTrackingMode') {
              setUserTrackingMode(message.enabled);
            }
          });
          
          // Add user location button
          class UserLocationControl {
            onAdd(map) {
              this._map = map;
              this._container = document.createElement('div');
              this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
              this._container.innerHTML = '<button><span style="font-size: 18px;">📍</span></button>';
              this._container.addEventListener('click', () => {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'requestUserLocation'
                }));
              });
              return this._container;
            }
            
            onRemove() {
              this._container.parentNode.removeChild(this._container);
              this._map = undefined;
            }
          }
          
          // Add this to handle location permission
          const requestLocationPermission = async () => {
            try {
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                alert('Permission to access location was denied');
                return false;
              }
              return true;
            } catch (error) {
              console.error('Error requesting location permission:', error);
              return false;
            }
          };

          // Add this to the HTML/JavaScript content where appropriate
          const userLocationControl = new mapboxgl.GeolocateControl({
            positionOptions: {
              enableHighAccuracy: true
            },
            trackUserLocation: ${userTrackingMode === "follow" || userTrackingMode === "followWithHeading"},
            showUserLocation: ${userLocationEnabled}
          });
          map.addControl(userLocationControl);

          // If tracking mode is enabled, trigger it after map loads
          if (${userTrackingMode === "follow" || userTrackingMode === "followWithHeading"}) {
            map.on('load', () => {
              userLocationControl.trigger();
            });
          }

          // Call this when the user location button is clicked
          map.on('geolocate', () => {
            requestLocationPermission();
          });
        </script>
      </body>
      </html>
    `
  }

  // Helper function to get marker icon HTML
  function getMarkerIcon(type) {
    switch (type) {
      case "hotel":
        return "🏨"
      case "restaurant":
        return "🍽️"
      case "excursion":
        return "🚶"
      default:
        return "📍"
    }
  }

  // Handle messages from WebView
  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)

      if (data.type === "mapClick" && onMapPress) {
        onMapPress({
          latitude: data.latitude,
          longitude: data.longitude,
        })
      } else if (data.type === "markerPress" && onMarkerPress) {
        const marker = markers.find((m) => m.id === data.markerId)
        if (marker) {
          onMarkerPress(marker)
        }
      } else if (data.type === "requestUserLocation") {
        // This is handled by the parent component
        if (onMapPress) {
          onMapPress({
            type: "requestUserLocation",
          })
        }
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error)
    }
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: generateMapHTML() }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#cf3a23" />
          </View>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
})

export default MapBoxWebView
