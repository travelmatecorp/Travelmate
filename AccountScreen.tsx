"use client"

import { useState, useEffect, useRef } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Animated } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import { getProfile, logout } from "./api"

export default function AccountScreen({ onNavigate, onLogout, user: initialUser }) {
  const [user, setUser] = useState(initialUser || null)
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    // Fetch the latest user data from the server
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const userData = await getProfile()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

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
  const handleScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
    listener: (event) => {
      const offsetY = event.nativeEvent.contentOffset.y
      setIsScrolling(offsetY > 0)
    },
  })

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#cf3a23" />
      </View>
    )
  }

  // Calculate stats from user data
  const stats = {
    trips: user?.reservas?.length || 0,
    bookmarks: 0, // This could be populated from a bookmarks table if you add one
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

      <ScrollView style={styles.contentContainer} onScroll={handleScroll} scrollEventThrottle={16}>
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

          <TouchableOpacity style={styles.editProfileButton}>
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

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="person-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Personal Information</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="card-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Payment Methods</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            <Text style={styles.menuItemText}>Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={styles.menuItemIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
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
                onNavigate("addPlace");
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Add extra padding at the bottom to ensure all content is visible above the bottom nav */}
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("calendar")}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("rewards")}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("map")}>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("messages")}>
          <Feather name="message-square" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="person" size={24} color="#cf3a23" />
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
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
