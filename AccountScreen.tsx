"use client"

import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { logout, getUserReservations, getAllUsers } from "./api"
import BottomNavigation from "./components/BottomNavigation"

export default function AccountScreen({ onNavigate, onLogout, user: initialUser }) {
  const [user, setUser] = useState(initialUser || null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [reservations, setReservations] = useState([])
  const scrollY = useRef(new Animated.Value(0)).current
  const [isScrolling, setIsScrolling] = useState(false)

  // Calculate header opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  })

  // Calculate header translation based on scroll direction
  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: "clamp",
  })

  // Fetch user data and reservations
  const fetchUserData = async () => {
    try {
      setLoading(true)
      console.log("Fetching user data...")

      // If we have the initial user data with ID, use it
      if (initialUser && initialUser.id) {
        try {
          // Try to get all users and find the current one
          const allUsers = await getAllUsers()
          console.log("All users received:", allUsers)

          const currentUser = allUsers.find((u) => u.id === initialUser.id)
          if (currentUser) {
            console.log("Found user in all users:", currentUser)
            setUser(currentUser)
          } else {
            // If we can't find the user, use the initial data
            console.log("Using initial user data as fallback")
            setUser(initialUser)
          }
        } catch (error) {
          console.error("Error fetching users:", error)
          setUser(initialUser)
        }
      } else {
        // If we don't have initial user data with ID, use a default user
        console.log("No initial user data, using default user")
        setUser({
          id: 1,
          nombre: "Demo User",
          email: "demo@example.com",
          tipo: "normal",
          favoritos: [],
        })
      }

      // Fetch user reservations
      try {
        const userReservations = await getUserReservations()
        console.log("Reservations received:", userReservations)
        setReservations(userReservations)
      } catch (error) {
        console.error("Error fetching reservations:", error)
        setReservations([])
      }
    } catch (error) {
      console.error("Error in fetchUserData:", error)
      Alert.alert("Error", "Could not load your profile data. Please try again later.", [{ text: "OK" }])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [initialUser])

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true)
    fetchUserData()
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout()
      onLogout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  // Handle scroll events
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollY.setValue(offsetY)
    setIsScrolling(offsetY > 0)
  }

  // Handle navigation to account settings screens
  const navigateToScreen = (screen) => {
    onNavigate(screen, { user })
  }

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cf3a23" />
      </View>
    )
  }

  // Calculate stats from user data
  const stats = {
    trips: reservations?.length || 0,
    bookmarks: user?.favoritos?.length || 0,
    reviews: 0, // This could be populated from a reviews table if you add one
  }

  // Check if user is a host (propietario)
  const isHost = user?.tipo === "propietario"

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      {/* Animated header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: isScrolling ? "white" : "transparent",
          },
        ]}
      >
        <Text style={styles.headerText}>Account</Text>
      </Animated.View>

      <ScrollView
        style={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#cf3a23"]} />}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editProfileImageButton}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.profileName}>{user?.nombre || "User"}</Text>
          <Text style={styles.profileEmail}>{user?.email || "user@example.com"}</Text>

          {/* Show user type badge */}
          <View style={styles.userTypeBadge}>
            <Ionicons name={isHost ? "home" : "person"} size={16} color="white" />
            <Text style={styles.userTypeBadgeText}>{isHost ? "Host" : "Traveler"}</Text>
          </View>

          <TouchableOpacity style={styles.editProfileButton} onPress={() => navigateToScreen("personalInformation")}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.trips}</Text>
            <Text style={styles.statLabel}>{isHost ? "Listings" : "Trips"}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.bookmarks}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen("personalInformation")}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen("paymentMethods")}>
            <Ionicons name="card-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen("notifications")}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigateToScreen("privacySecurity")}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Privacy & Security</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>
        </View>

        {/* Different sections based on user type */}
        {isHost ? (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Properties</Text>

            <TouchableOpacity
              style={[styles.menuItem, styles.highlightedMenuItem]}
              onPress={() => {
                // Ensure we're navigating to the AddPlaceScreen
                onNavigate("addPlace")
              }}
            >
              <Ionicons name="add-circle-outline" size={24} color="#cf3a23" />
              <Text style={[styles.menuItemText, styles.highlightedMenuItemText]}>Add New Place</Text>
              <Ionicons name="chevron-forward" size={20} color="#cf3a23" style={styles.menuItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="list-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Manage My Listings</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="calendar-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Booking Requests</Text>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{reservations.filter((r) => r.estado === "pendiente").length}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="stats-chart-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Performance Analytics</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Activities</Text>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="bookmark-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Saved Places</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="time-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Recent Searches</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <Ionicons name="star-outline" size={24} color="#333" />
              <Text style={styles.menuItemText}>Reviews</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
            </TouchableOpacity>
          </View>
        )}

        {/* Reservations section */}
        {reservations.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{isHost ? "Recent Bookings" : "My Reservations"}</Text>

            {reservations.slice(0, 3).map((reservation) => (
              <View key={reservation.id} style={styles.reservationItem}>
                <View style={styles.reservationHeader}>
                  <Text style={styles.reservationPlace}>{reservation.lugar?.nombre || "Unknown Place"}</Text>
                  <View
                    style={[
                      styles.reservationStatus,
                      reservation.estado === "confirmada"
                        ? styles.statusConfirmed
                        : reservation.estado === "cancelada"
                          ? styles.statusCancelled
                          : styles.statusPending,
                    ]}
                  >
                    <Text style={styles.reservationStatusText}>
                      {reservation.estado === "confirmada"
                        ? "Confirmed"
                        : reservation.estado === "cancelada"
                          ? "Cancelled"
                          : "Pending"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reservationDates}>
                  {new Date(reservation.fecha_inicio).toLocaleDateString()} -{" "}
                  {new Date(reservation.fecha_fin).toLocaleDateString()}
                </Text>
              </View>
            ))}

            {reservations.length > 3 && (
              <TouchableOpacity style={styles.viewAllButton}>
                <Text style={styles.viewAllButtonText}>View All Reservations</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Add extra padding at the bottom to ensure all content is visible above the bottom nav */}
        <View style={{ height: 80 }} />
      </ScrollView>

      <BottomNavigation currentScreen="account" onNavigate={onNavigate} auth={{ isLoggedIn: true }} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  animatedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  contentContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: "hidden",
    marginBottom: 16,
    position: "relative",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  editProfileImageButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#cf3a23",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
  },
  userTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#cf3a23",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 16,
  },
  userTypeBadgeText: {
    color: "white",
    fontWeight: "500",
    marginLeft: 4,
  },
  editProfileButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#cf3a23",
    borderRadius: 20,
  },
  editProfileButtonText: {
    color: "#cf3a23",
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  highlightedMenuItem: {
    backgroundColor: "rgba(207, 58, 35, 0.05)",
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
  },
  highlightedMenuItemText: {
    color: "#cf3a23",
    fontWeight: "500",
  },
  menuItemIcon: {
    marginLeft: "auto",
  },
  badgeContainer: {
    backgroundColor: "#cf3a23",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  reservationItem: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  reservationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reservationPlace: {
    fontSize: 16,
    fontWeight: "bold",
  },
  reservationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: "#4CAF50",
  },
  statusPending: {
    backgroundColor: "#FFC107",
  },
  statusCancelled: {
    backgroundColor: "#F44336",
  },
  reservationStatusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  reservationDates: {
    fontSize: 14,
    color: "#666",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllButtonText: {
    color: "#cf3a23",
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 32,
    marginHorizontal: 16,
    backgroundColor: "#cf3a23",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
