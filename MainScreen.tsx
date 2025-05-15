"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Dimensions,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useVacation } from "./context/VacationContext"
import { getPlacesByDestination, formatDate } from "./api"
import placeholder from "./assets/placeholder"
import BottomNavigation from "./components/BottomNavigation"

const { width } = Dimensions.get("window")
const cardWidth = width * 0.7

const MainScreen = ({ onNavigate, auth }) => {
  const { vacationPlan, selectedDestination } = useVacation()
  const [isLoading, setIsLoading] = useState(true)
  const [hotels, setHotels] = useState([])
  const [restaurants, setRestaurants] = useState([])
  const [activities, setActivities] = useState([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (vacationPlan || selectedDestination) {
      const destination = vacationPlan?.destino || selectedDestination
      if (destination) {
        fetchPlaces(destination.id)
      }
    }
  }, [vacationPlan, selectedDestination])

  const fetchPlaces = async (destinationId) => {
    try {
      setIsLoading(true)

      // Fetch hotels
      try {
        const hotelsData = await getPlacesByDestination(destinationId, "hotel")
        console.log("Hotels data:", hotelsData)
        setHotels(hotelsData || [])
      } catch (error) {
        console.error("Error fetching hotels:", error)
        setHotels([])
      }

      // Fetch restaurants
      try {
        const restaurantsData = await getPlacesByDestination(destinationId, "restaurant")
        console.log("Restaurants data:", restaurantsData)
        setRestaurants(restaurantsData || [])
      } catch (error) {
        console.error("Error fetching restaurants:", error)
        setRestaurants([])
      }

      // Fetch activities
      try {
        const activitiesData = await getPlacesByDestination(destinationId, "excursion")
        console.log("Activities data:", activitiesData)
        setActivities(activitiesData || [])
      } catch (error) {
        console.error("Error fetching activities:", error)
        setActivities([])
      }
    } catch (error) {
      console.error("Error in fetchPlaces:", error)
      Alert.alert("Error", "Failed to load places. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  // Fix the navigation to PlaceDetailScreen
  const handlePlacePress = (item) => {
    console.log("Navigating to place detail with item:", item)
    // Pass the entire place object to ensure we have all the data
    onNavigate("placeDetail", {
      id: item.id,
      placeId: item.id,
      lugar_id: item.id,
      place: item, // Pass the entire place object
      planId: vacationPlan?.id

      
    })
  }

  const renderListingItem = ({ item, type }) => (
    <TouchableOpacity style={styles.listingCard} onPress={() => handlePlacePress(item)}>
      <Image
        source={{
          uri:
            item.image || item.imagen_url || `https://source.unsplash.com/random/?${item.name || item.nombre},${type}`,
        }}
        defaultSource={placeholder}
        style={styles.listingImage}
      />
      <View style={styles.listingDetails}>
        <Text style={styles.listingName}>{item.name || item.nombre}</Text>
        {(item.price || item.precio) && <Text style={styles.listingPrice}>{item.price || `$${item.precio}`}</Text>}
        {item.cuisine && <Text style={styles.listingInfo}>{item.cuisine}</Text>}
        {item.duration && <Text style={styles.listingInfo}>{item.duration}</Text>}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || "4.5"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const destination = vacationPlan?.destino || selectedDestination

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Vacation Summary</Text>
      </View>

      {destination && (
        <View style={styles.destinationBanner}>
          <Image
            source={{
              uri: destination.imagen_url || `https://source.unsplash.com/random/?${destination.nombre},city`,
            }}
            style={styles.destinationImage}
          />
          <View style={styles.destinationOverlay}>
            <Text style={styles.destinationName}>{destination.nombre}</Text>
            <Text style={styles.destinationCountry}>{destination.pais}</Text>

            {vacationPlan && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar" size={16} color="white" />
                <Text style={styles.dateText}>
                  {formatDate(vacationPlan.fechaInicio)} - {formatDate(vacationPlan.fechaFin)}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "all" && styles.activeTab]}
            onPress={() => setActiveTab("all")}
          >
            <Text style={[styles.tabText, activeTab === "all" && styles.activeTabText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "hotels" && styles.activeTab]}
            onPress={() => setActiveTab("hotels")}
          >
            <Text style={[styles.tabText, activeTab === "hotels" && styles.activeTabText]}>Hotels</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "restaurants" && styles.activeTab]}
            onPress={() => setActiveTab("restaurants")}
          >
            <Text style={[styles.tabText, activeTab === "restaurants" && styles.activeTabText]}>Restaurants</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "activities" && styles.activeTab]}
            onPress={() => setActiveTab("activities")}
          >
            <Text style={[styles.tabText, activeTab === "activities" && styles.activeTabText]}>Activities</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#cf3a23" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {(activeTab === "all" || activeTab === "hotels") && hotels.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hotels</Text>
              <FlatList
                data={hotels}
                renderItem={({ item }) => renderListingItem({ item, type: "hotel" })}
                keyExtractor={(item) => `hotel-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listingContainer}
              />
            </View>
          )}

          {(activeTab === "all" || activeTab === "restaurants") && restaurants.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Restaurants</Text>
              <FlatList
                data={restaurants}
                renderItem={({ item }) => renderListingItem({ item, type: "restaurant" })}
                keyExtractor={(item) => `restaurant-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listingContainer}
              />
            </View>
          )}

          {(activeTab === "all" || activeTab === "activities") && activities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <FlatList
                data={activities}
                renderItem={({ item }) => renderListingItem({ item, type: "activity" })}
                keyExtractor={(item) => `activity-${item.id}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listingContainer}
              />
            </View>
          )}

          <TouchableOpacity style={styles.mapButton} onPress={() => onNavigate("map")}>
            <Ionicons name="map" size={20} color="white" />
            <Text style={styles.mapButtonText}>View on Map</Text>
          </TouchableOpacity>

          {/* Add extra padding at the bottom */}
          <View style={{ height: 80 }} />
        </ScrollView>
      )}

      <BottomNavigation currentScreen="home" onNavigate={onNavigate} auth={auth} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  destinationBanner: {
    height: 200,
    width: "100%",
    position: "relative",
  },
  destinationImage: {
    width: "100%",
    height: "100%",
  },
  destinationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  destinationName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  destinationCountry: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "white",
    marginLeft: 8,
  },
  tabsContainer: {
    backgroundColor: "white",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabs: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
  },
  activeTab: {
    backgroundColor: "#cf3a23",
  },
  tabText: {
    fontSize: 14,
    color: "#333",
  },
  activeTabText: {
    color: "white",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 12,
  },
  listingContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  listingCard: {
    width: cardWidth,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  listingImage: {
    width: "100%",
    height: 150,
  },
  listingDetails: {
    padding: 12,
  },
  listingName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 14,
    color: "#cf3a23",
    fontWeight: "500",
    marginBottom: 2,
  },
  listingInfo: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#cf3a23",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
  },
  mapButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 8,
  },
})

export default MainScreen
