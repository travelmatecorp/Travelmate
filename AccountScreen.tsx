import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

export default function AccountScreen({ onNavigate, onLogout, user }) {
  // In a real app, user data would come from the backend
  const userData = user || {
    name: "John Doe",
    email: "john.doe@example.com",
    stats: {
      trips: 12,
      bookmarks: 43,
      reviews: 9,
    },
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <ScrollView style={styles.contentContainer}>
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
          <Text style={styles.profileName}>{userData.name}</Text>
          <Text style={styles.profileEmail}>{userData.email}</Text>
          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.stats.trips}</Text>
            <Text style={styles.statLabel}>Trips</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.stats.bookmarks}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData.stats.reviews}</Text>
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

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
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
    marginBottom: 16,
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
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
    flex: 1,
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

