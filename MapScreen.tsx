"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

// Get screen dimensions for the map
const { width, height } = Dimensions.get("window")

// Mock map markers data
const mapMarkers = [
  {
    id: "1",
    type: "hotel",
    name: "Hotel Trenquelauquen",
    rating: 4.8,
    price: "$120/night",
    latitude: 40.7128,
    longitude: -74.006,
    position: { top: height * 0.3, left: width * 0.2 },
  },
  {
    id: "2",
    type: "hotel",
    name: "Hotel Morenis",
    rating: 4.5,
    price: "$95/night",
    latitude: 40.7138,
    longitude: -74.016,
    position: { top: height * 0.4, left: width * 0.6 },
  },
  {
    id: "3",
    type: "restaurant",
    name: "Esquina Due",
    rating: 4.6,
    cuisine: "Italian",
    latitude: 40.7148,
    longitude: -74.026,
    position: { top: height * 0.5, left: width * 0.3 },
  },
  {
    id: "4",
    type: "excursion",
    name: "Cataratas",
    rating: 4.9,
    duration: "6 hours",
    latitude: 40.7158,
    longitude: -74.036,
    position: { top: height * 0.2, left: width * 0.7 },
  },
]

// Filter categories
const filterCategories = [
  { id: "all", name: "All", icon: "apps-outline", type: "ionicon" },
  { id: "hotel", name: "Hotels", icon: "bed-outline", type: "ionicon" },
  { id: "restaurant", name: "Restaurants", icon: "restaurant-outline", type: "ionicon" },
  { id: "excursion", name: "Excursions", icon: "walk", type: "ionicon" },
  { id: "price", name: "Price", icon: "cash-outline", type: "ionicon" },
  { id: "rating", name: "Rating", icon: "star-outline", type: "ionicon" },
]

export default function MapScreen({ onNavigate, auth }) {
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedMarker, setSelectedMarker] = useState(null)

  // Filter markers based on active filter
  const filteredMarkers =
    activeFilter === "all" ? mapMarkers : mapMarkers.filter((marker) => marker.type === activeFilter)

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      {/* Search and filter bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="filter" size={24} color="black" style={styles.filterIcon} />
          <TextInput style={styles.searchInput} placeholder="Search locations" placeholderTextColor="#999" />
          <Ionicons name="search" size={24} color="#747775" style={styles.searchIcon} />
        </View>
      </View>

      {/* Filter categories */}
      <View style={styles.filterCategoriesContainer}>
        {filterCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.filterCategoryItem, activeFilter === category.id && styles.activeFilterCategory]}
            onPress={() => setActiveFilter(category.id)}
          >
            <Ionicons name={category.icon} size={20} color={activeFilter === category.id ? "#fff" : "#333"} />
            <Text style={[styles.filterCategoryText, activeFilter === category.id && styles.activeFilterCategoryText]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map container */}
      <View style={styles.mapContainer}>
        {/* This would be replaced with a real map component like react-native-maps */}
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1569336415962-a4bd9f69c07b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80",
          }}
          style={styles.mapImage}
          resizeMode="cover"
        />

        {/* Map markers */}
        {filteredMarkers.map((marker) => (
          <TouchableOpacity
            key={marker.id}
            style={[styles.mapMarker, marker.position]}
            onPress={() => setSelectedMarker(marker)}
          >
            <View
              style={[
                styles.markerIcon,
                marker.type === "hotel" && styles.hotelMarker,
                marker.type === "restaurant" && styles.restaurantMarker,
                marker.type === "excursion" && styles.excursionMarker,
              ]}
            >
              {marker.type === "hotel" && <Ionicons name="bed" size={16} color="#fff" />}
              {marker.type === "restaurant" && <Ionicons name="restaurant" size={16} color="#fff" />}
              {marker.type === "excursion" && <Ionicons name="walk" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
        ))}
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

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("calendar")}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("rewards")}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="location" size={24} color="#cf3a23" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("messages")}>
          <Feather name="message-square" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate(auth?.isLoggedIn ? "account" : "login")}>
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
  filterIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    marginLeft: 8,
  },
  filterCategoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexWrap: "wrap",
  },
  filterCategoryItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
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
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapMarker: {
    position: "absolute",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  markerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#cf3a23",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  hotelMarker: {
    backgroundColor: "#4285F4",
  },
  restaurantMarker: {
    backgroundColor: "#EA4335",
  },
  excursionMarker: {
    backgroundColor: "#34A853",
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

