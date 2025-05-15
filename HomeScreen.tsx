"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { getDestinations, getFeaturedDestinations } from "./api"
import { useVacation } from "./context/VacationContext"
import placeholder from "./assets/placeholder"
import BottomNavigation from "./components/BottomNavigation"

// Get screen width for responsive sizing
const { width } = Dimensions.get("window")
const destinationCardWidth = width * 0.8

// Mock rewards data
const rewardsData = [
  {
    id: "1",
    title: "10% Off Hotel Booking",
    points: 500,
    expiryDate: "Dec 31, 2023",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "2",
    title: "Free Airport Transfer",
    points: 1000,
    expiryDate: "Nov 30, 2023",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  },
  {
    id: "3",
    title: "Free Dinner for Two",
    points: 1500,
    expiryDate: "Jan 15, 2024",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  },
]

export default function HomeScreen({ onNavigate, auth }) {
  const { setSelectedDestination } = useVacation()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [featuredDestinations, setFeaturedDestinations] = useState([])
  const [popularDestinations, setPopularDestinations] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch destinations on component mount
  useEffect(() => {
    fetchDestinations()
  }, [])

  // Update search results when query changes
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([])
      setShowSuggestions(false)
      return
    }

    const fetchSearchResults = async () => {
      try {
        const response = await getDestinations({ search: searchQuery })
        setSearchResults(response.slice(0, 5)) // Limit to 5 suggestions
        setShowSuggestions(response.length > 0)
      } catch (error) {
        console.error("Error searching destinations:", error)
        // Use mock data for demonstration
        const filteredResults = popularDestinations
          .filter((dest) => dest.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, 5)
        setSearchResults(filteredResults)
        setShowSuggestions(filteredResults.length > 0)
      }
    }

    // Debounce search requests
    const timer = setTimeout(() => {
      fetchSearchResults()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const fetchDestinations = async () => {
    try {
      setIsLoading(true)

      // Fetch featured destinations
      try {
        const featuredResponse = await getFeaturedDestinations()
        setFeaturedDestinations(featuredResponse)
      } catch (error) {
        console.error("Error fetching featured destinations:", error)
        // Use mock data
        setFeaturedDestinations([
          {
            id: 1,
            nombre: "Buenos Aires",
            pais: "Argentina",
            descripcion: "La vibrante capital de Argentina, conocida por su arquitectura europea y rica vida cultural.",
            imagen_url: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e",
            latitud: -34.6037,
            longitud: -58.3816,
            popularidad: 100,
            destacado: true,
          },
          {
            id: 2,
            nombre: "Bariloche",
            pais: "Argentina",
            descripcion: "Ciudad de montaña famosa por sus paisajes alpinos y chocolates artesanales.",
            imagen_url: "https://images.unsplash.com/photo-1551522355-5aa50c13b3a2",
            latitud: -41.1335,
            longitud: -71.3103,
            popularidad: 90,
            destacado: true,
          },
        ])
      }

      // Fetch all destinations for popular section
      try {
        const allResponse = await getDestinations()
        setPopularDestinations(allResponse.slice(0, 10)) // Take top 10
      } catch (error) {
        console.error("Error fetching all destinations:", error)
        // Use mock data
        setPopularDestinations([
          {
            id: 1,
            nombre: "Buenos Aires",
            pais: "Argentina",
            descripcion: "La vibrante capital de Argentina, conocida por su arquitectura europea y rica vida cultural.",
            imagen_url: "https://images.unsplash.com/photo-1612294037637-ec328d0e075e",
            latitud: -34.6037,
            longitud: -58.3816,
            popularidad: 100,
            destacado: true,
          },
          {
            id: 2,
            nombre: "Bariloche",
            pais: "Argentina",
            descripcion: "Ciudad de montaña famosa por sus paisajes alpinos y chocolates artesanales.",
            imagen_url: "https://images.unsplash.com/photo-1551522355-5aa50c13b3a2",
            latitud: -41.1335,
            longitud: -71.3103,
            popularidad: 90,
            destacado: true,
          },
          {
            id: 3,
            nombre: "Mendoza",
            pais: "Argentina",
            descripcion: "Región vinícola con impresionantes paisajes montañosos y bodegas de renombre mundial.",
            imagen_url: "https://images.unsplash.com/photo-1585874363771-9b2f9a6b8d07",
            latitud: -32.8895,
            longitud: -68.8458,
            popularidad: 85,
            destacado: true,
          },
        ])
      }
    } catch (error) {
      console.error("Error in fetchDestinations:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectDestination = (destination) => {
    // Set the selected destination in context
    setSelectedDestination(destination)

    // Navigate to calendar screen to create vacation
    onNavigate("calendar")
  }

  const renderDestinationCard = ({ item }) => (
    <TouchableOpacity style={styles.destinationCard} onPress={() => handleSelectDestination(item)}>
      <Image
        source={{
          uri: item.imagen_url || `https://source.unsplash.com/random/?${item.nombre},city`,
        }}
        style={styles.destinationImage}
        defaultSource={placeholder}
      />
      <View style={styles.destinationOverlay}>
        <Text style={styles.destinationName}>{item.nombre}</Text>
        <Text style={styles.destinationCountry}>{item.pais}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderPopularDestination = ({ item }) => (
    <TouchableOpacity style={styles.popularDestinationCard} onPress={() => handleSelectDestination(item)}>
      <Image
        source={{
          uri: item.imagen_url || `https://source.unsplash.com/random/?${item.nombre},city`,
        }}
        style={styles.popularDestinationImage}
        defaultSource={placeholder}
      />
      <Text style={styles.popularDestinationName}>{item.nombre}</Text>
    </TouchableOpacity>
  )

  const renderRewardCard = ({ item }) => (
    <TouchableOpacity style={styles.rewardCard} onPress={() => onNavigate("rewards")}>
      <Image source={{ uri: item.image }} style={styles.rewardImage} defaultSource={placeholder} />
      <View style={styles.rewardContent}>
        <Text style={styles.rewardTitle}>{item.title}</Text>
        <View style={styles.rewardDetails}>
          <View style={styles.rewardPoints}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rewardPointsText}>{item.points} points</Text>
          </View>
          <Text style={styles.rewardExpiry}>Expires: {item.expiryDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Fix for onScroll error - ensure we pass a function, not an object
  const handleScroll = (event) => {
    // You can add scroll handling logic here if needed
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => onNavigate("rewards")} style={styles.headerButton}>
            <Ionicons name="gift-outline" size={28} color="#cf3a23" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onNavigate(auth?.isLoggedIn ? "account" : "login")}
            style={styles.headerButton}
          >
            <Ionicons name="person-circle-outline" size={28} color="#cf3a23" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={24} color="#747775" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Where to?"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => {
              if (searchQuery.trim() !== "" && searchResults.length > 0) {
                setShowSuggestions(true)
              }
            }}
          />
        </View>

        {showSuggestions && searchResults.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.suggestionItem}
                onPress={() => handleSelectDestination(result)}
              >
                <Ionicons name="location-outline" size={20} color="#666" />
                <Text style={styles.suggestionText}>
                  {result.nombre}, {result.pais}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#cf3a23" />
        </View>
      ) : (
        <ScrollView style={styles.contentContainer} onScroll={handleScroll} scrollEventThrottle={16}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Featured Destinations</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={featuredDestinations}
              renderItem={renderDestinationCard}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.destinationsListContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <View style={styles.popularGrid}>
              {popularDestinations.slice(0, 6).map((destination) => (
                <TouchableOpacity
                  key={destination.id}
                  style={styles.popularDestinationCard}
                  onPress={() => handleSelectDestination(destination)}
                >
                  <Image
                    source={{
                      uri: destination.imagen_url || `https://source.unsplash.com/random/?${destination.nombre},city`,
                    }}
                    style={styles.popularDestinationImage}
                    defaultSource={placeholder}
                  />
                  <Text style={styles.popularDestinationName}>{destination.nombre}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* New Rewards Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Rewards & Offers</Text>
              <TouchableOpacity onPress={() => onNavigate("rewards")}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={rewardsData}
              renderItem={renderRewardCard}
              keyExtractor={(item) => `reward-${item.id}`}
              contentContainerStyle={styles.destinationsListContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Explore Nearby</Text>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={popularDestinations.slice(6)}
              renderItem={renderPopularDestination}
              keyExtractor={(item) => `nearby-${item.id}`}
              contentContainerStyle={styles.destinationsListContent}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            />
          </View>

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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: "relative",
    zIndex: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: "white",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  suggestionText: {
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 12,
  },
  seeAllText: {
    color: "#cf3a23",
    fontWeight: "500",
    marginRight: 16,
  },
  destinationsListContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  destinationCard: {
    width: destinationCardWidth,
    height: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: "hidden",
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
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  destinationName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  destinationCountry: {
    color: "white",
    fontSize: 14,
  },
  popularGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  popularDestinationCard: {
    width: (width - 48) / 2,
    height: 120,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  popularDestinationImage: {
    width: "100%",
    height: "100%",
  },
  popularDestinationName: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  // Reward card styles
  rewardCard: {
    width: width * 0.7,
    height: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardImage: {
    width: "100%",
    height: 120,
  },
  rewardContent: {
    padding: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rewardDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardPoints: {
    flexDirection: "row",
    alignItems: "center",
  },
  rewardPointsText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  rewardExpiry: {
    fontSize: 12,
    color: "#666",
  },
})
