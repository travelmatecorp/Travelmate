"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, Alert, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons"
import * as Location from "expo-location"
import MapBoxWebView from "./components/MapBoxWebView"
import LocationUploadModal from "./components/LocationUploadModal"

// Get screen dimensions for the map
const { width, height } = Dimensions.get("window")

// Initial map markers data
const initialMapMarkers = [
  {
    id: "1",
    type: "hotel",
    name: "Hotel Trenquelauquen",
    rating: 4.8,
    price: "$120/night",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    id: "2",
    type: "hotel",
    name: "Hotel Morenis",
    rating: 4.5,
    price: "$95/night",
    latitude: 40.7138,
    longitude: -74.016,
  },
  {
    id: "3",
    type: "restaurant",
    name: "Esquina Due",
    rating: 4.6,
    cuisine: "Italian",
    latitude: 40.7148,
    longitude: -74.026,
  },
  {
    id: "4",
    type: "excursion",
    name: "Cataratas",
    rating: 4.9,
    duration: "6 hours",
    latitude: 40.7158,
    longitude: -74.036,
  },
]

// Filter categories
const filterCategories = [
  { id: "all", name: "All", icon: "apps" },
  { id: "hotel", name: "Hotels", icon: "bed-outline" },
  { id: "restaurant", name: "Restaurants", icon: "restaurant-outline" },
  { id: "excursion", name: "Excursions", icon: "walk" },
  { id: "price", name: "Price", icon: "cash-outline" },
  { id: "rating", name: "Rating", icon: "star-outline" },
]

export default function MapScreen({ onNavigate, auth }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedMarker, setSelectedMarker] = useState(null)
  const [mapMarkers, setMapMarkers] = useState(initialMapMarkers)
  const [region, setRegion] = useState({
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  })
  const [userLocation, setUserLocation] = useState(null)
  const [isAddingLocation, setIsAddingLocation] = useState(false)
  const [newLocationCoords, setNewLocationCoords] = useState(null)
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Filter markers based on active filter
  const filteredMarkers =
    activeFilter === "all" ? mapMarkers : mapMarkers.filter((marker) => marker.type === activeFilter)

  // Request location permissions and get user's current location
  useEffect(() => {
    ;(async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync()
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Permission to access location was denied")
          setIsLoading(false)
          return
        }

        const location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords

        setUserLocation({ latitude, longitude })
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        })

        // Fetch markers from API here if needed
        // const response = await api.get("/lugares")
        // setMapMarkers(response.data)
      } catch (error) {
        console.error("Error getting location:", error)
        Alert.alert("Error", "Could not get your current location")
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  // Function to center map on user location
  const centerOnUserLocation = () => {
    if (userLocation) {
      // We don't need to modify the map directly, just update the region
      // The MapBoxWebView already has a user location button that handles this
      Alert.alert("Location", "Using your current location")
    } else {
      Alert.alert("Location Unavailable", "Could not access your current location")
    }
  }

  const handleMapPress = (coordinate) => {
    if (isAddingLocation) {
      setNewLocationCoords(coordinate)
      setIsUploadModalVisible(true)
      setIsAddingLocation(false)
    } else {
      // Deselect marker when tapping elsewhere on the map
      setSelectedMarker(null)
    }
  }

  const handleMarkerPress = (marker) => {
    setSelectedMarker(marker)
  }

  const handleAddLocation = () => {
    if (!auth?.isLoggedIn) {
      Alert.alert("Login Required", "You need to be logged in to add locations", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => onNavigate("login") },
      ])
      return
    }

    // Navigate directly to the AddPlaceScreen instead of requiring a map tap
    onNavigate("addPlace")
  }

  const handleNewLocationSuccess = (newLocation) => {
    setMapMarkers([...mapMarkers, newLocation])
  }

  const renderFilterIcon = (category) => {
    switch (category.id) {
      case "all":
        return <Ionicons name="apps" size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
      case "hotel":
        return <Ionicons name="bed-outline" size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
      case "restaurant":
        return <Ionicons name="restaurant-outline" size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
      case "excursion":
        return <Ionicons name="walk" size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
      case "price":
        return <MaterialIcons name="attach-money" size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
      case "rating":
        return <Ionicons name="star-outline" size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
      default:
        return <Ionicons name={category.icon} size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="menu" size={24} color="#666" style={styles.menuIcon} />
          <TextInput style={styles.searchInput} placeholder="Search locations" placeholderTextColor="#999" />
          <Ionicons name="search" size={24} color="#666" style={styles.searchIcon} />
        </View>
      </View>

      {/* Filter categories */}
      <View style={styles.filterCategoriesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.filterCategoryItem, activeFilter === category.id && styles.activeFilterCategory]}
              onPress={() => setActiveFilter(category.id)}
            >
              {renderFilterIcon(category)}
              <Text
                style={[styles.filterCategoryText, activeFilter === category.id && styles.activeFilterCategoryText]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map container */}
      <View style={styles.mapContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading map...</Text>
          </View>
        ) : (
          <MapBoxWebView
            markers={filteredMarkers}
            initialRegion={userLocation || region}
            onMapPress={handleMapPress}
            onMarkerPress={handleMarkerPress}
            style={styles.map}
          />
        )}

        {/* Map control buttons */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.mapControlButton} onPress={handleAddLocation}>
            <Ionicons name="add" size={24} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mapControlButton} onPress={centerOnUserLocation}>
            <Ionicons name="locate" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected marker details */}
      {selectedMarker && (
        <View style={styles.markerDetailsContainer}>
          <View style={styles.markerDetails}>
            <View style={styles.markerDetailsHeader}>
              <Text style={styles.markerName}>{selectedMarker.name}</Text>
              <TouchableOpacity onPress={() => setSelectedMarker(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.markerDetailsInfo}>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{selectedMarker.rating}</Text>
              </View>

              {selectedMarker.price && <Text style={styles.markerPrice}>{selectedMarker.price}</Text>}
              {selectedMarker.cuisine && <Text style={styles.markerInfo}>{selectedMarker.cuisine}</Text>}
              {selectedMarker.duration && <Text style={styles.markerInfo}>{selectedMarker.duration}</Text>}
            </View>

            <TouchableOpacity style={styles.viewDetailsButton}>
              <Text style={styles.viewDetailsText}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Location upload modal */}
      {isUploadModalVisible && newLocationCoords && (
        <LocationUploadModal
          visible={isUploadModalVisible}
          onClose={() => {
            setIsUploadModalVisible(false)
            setNewLocationCoords(null)
          }}
          location={newLocationCoords}
          onSuccess={handleNewLocationSuccess}
        />
      )}

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("calendar")}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("bookmarks")}>
          <Ionicons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={()=> onNavigate("main")}>
          <Ionicons name="location" size={24} color="#cf3a23" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("messages")}>
         <Feather name="message-square" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("account")}>
          <Ionicons name="person-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    color: "#666",
  },
  searchIcon: {
    marginLeft: 8,
  },
  filterCategoriesContainer: {
    paddingVertical: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterCategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeFilterCategory: {
    backgroundColor: "#cf3a23",
  },
  filterCategoryText: {
    fontSize: 14,
    marginLeft: 4,
    color: "#333",
  },
  activeFilterCategoryText: {
    color: "white",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mapControls: {
    position: "absolute",
    right: 16,
    bottom: 100,
    flexDirection: "column",
  },
  mapControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  markerDetailsContainer: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    padding: 16,
  },
  markerDetails: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  markerDetailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  markerName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  markerDetailsInfo: {
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  markerPrice: {
    fontSize: 16,
    color: "#cf3a23",
    fontWeight: "500",
    marginBottom: 2,
  },
  markerInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  viewDetailsButton: {
    backgroundColor: "#cf3a23",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewDetailsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "white",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    width: 48,
    height: 48,
  },
  activeNavItem: {
    borderRadius: 24,
  },
})

