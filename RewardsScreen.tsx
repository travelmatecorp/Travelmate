"use client"

import { useState } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

// Mock rewards data
const rewardsData = [
  {
    id: "1",
    title: "10% Off Hotel Booking",
    description: "Get 10% off your next hotel booking with code TRAVEL10",
    points: 500,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    expiryDate: "Dec 31, 2023",
    category: "hotel",
  },
  {
    id: "2",
    title: "Free Airport Transfer",
    description: "Redeem for a free airport transfer on your next trip",
    points: 1000,
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    expiryDate: "Nov 30, 2023",
    category: "transport",
  },
  {
    id: "3",
    title: "Free Dinner for Two",
    description: "Enjoy a complimentary dinner for two at select restaurants",
    points: 1500,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    expiryDate: "Jan 15, 2024",
    category: "restaurant",
  },
  {
    id: "4",
    title: "Adventure Tour Discount",
    description: "Get 15% off on adventure tours and excursions",
    points: 800,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    expiryDate: "Feb 28, 2024",
    category: "excursion",
  },
  {
    id: "5",
    title: "Spa Treatment Voucher",
    description: "Redeem for a relaxing spa treatment at partner hotels",
    points: 1200,
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    expiryDate: "Mar 31, 2024",
    category: "wellness",
  },
]

// Mock user rewards data
const userRewardsData = {
  totalPoints: 2500,
  level: "Gold",
  nextLevel: "Platinum",
  pointsToNextLevel: 1500,
  recentActivity: [
    {
      id: "a1",
      description: "Hotel Booking - Hotel Trenquelauquen",
      points: "+250",
      date: "Oct 15, 2023",
    },
    {
      id: "a2",
      description: "Restaurant Reservation - Coastal Grill",
      points: "+100",
      date: "Oct 10, 2023",
    },
    {
      id: "a3",
      description: "Redeemed - 10% Off Hotel Booking",
      points: "-500",
      date: "Sep 28, 2023",
    },
  ],
}

// Filter categories
const categories = [
  { id: "all", name: "All Rewards" },
  { id: "hotel", name: "Hotels" },
  { id: "restaurant", name: "Restaurants" },
  { id: "transport", name: "Transport" },
  { id: "excursion", name: "Excursions" },
  { id: "wellness", name: "Wellness" },
]

export default function RewardsScreen({ onNavigate, auth }) {
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedReward, setSelectedReward] = useState(null)

  // Filter rewards based on active category
  const filteredRewards =
    activeCategory === "all" ? rewardsData : rewardsData.filter((reward) => reward.category === activeCategory)

  // Render a reward card
  const renderRewardCard = ({ item }) => (
    <TouchableOpacity style={styles.rewardCard} onPress={() => setSelectedReward(item)}>
      <Image source={{ uri: item.image }} style={styles.rewardImage} />
      <View style={styles.rewardCardContent}>
        <Text style={styles.rewardTitle}>{item.title}</Text>
        <Text style={styles.rewardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.rewardCardFooter}>
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.pointsText}>{item.points} points</Text>
          </View>
          <Text style={styles.expiryDate}>Expires: {item.expiryDate}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  // Render an activity item
  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={styles.activityInfo}>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityDate}>{item.date}</Text>
      </View>
      <Text style={[styles.activityPoints, item.points.startsWith("+") ? styles.pointsEarned : styles.pointsSpent]}>
        {item.points}
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rewards</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User rewards summary */}
        <View style={styles.userRewardsSummary}>
          <View style={styles.pointsSection}>
            <Text style={styles.pointsLabel}>Total Points</Text>
            <Text style={styles.pointsValue}>{userRewardsData.totalPoints}</Text>
          </View>

          <View style={styles.levelSection}>
            <View style={styles.levelInfo}>
              <Text style={styles.levelLabel}>Current Level</Text>
              <Text style={styles.levelValue}>{userRewardsData.level}</Text>
            </View>

            <View style={styles.levelProgressContainer}>
              <View style={styles.levelProgressBar}>
                <View
                  style={[
                    styles.levelProgressFill,
                    {
                      width: `${(userRewardsData.totalPoints / (userRewardsData.totalPoints + userRewardsData.pointsToNextLevel)) * 100}%`,
                    },
                  ]}
                />
              </View>
              <Text style={styles.levelProgressText}>
                {userRewardsData.pointsToNextLevel} points to {userRewardsData.nextLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Categories filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryButton, activeCategory === category.id && styles.activeCategoryButton]}
              onPress={() => setActiveCategory(category.id)}
            >
              <Text
                style={[styles.categoryButtonText, activeCategory === category.id && styles.activeCategoryButtonText]}
              >
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Rewards list */}
        <View style={styles.rewardsContainer}>
          <Text style={styles.sectionTitle}>Available Rewards</Text>
          <FlatList
            data={filteredRewards}
            renderItem={renderRewardCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rewardsList}
          />
        </View>

        {/* Recent activity */}
        <View style={styles.activityContainer}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <FlatList
            data={userRewardsData.recentActivity}
            renderItem={renderActivityItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Selected reward details modal */}
        {selectedReward && (
          <View style={styles.rewardDetailsModal}>
            <View style={styles.rewardDetailsContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedReward(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>

              <Image source={{ uri: selectedReward.image }} style={styles.rewardDetailsImage} />

              <View style={styles.rewardDetailsInfo}>
                <Text style={styles.rewardDetailsTitle}>{selectedReward.title}</Text>
                <Text style={styles.rewardDetailsDescription}>{selectedReward.description}</Text>

                <View style={styles.rewardDetailsPoints}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={styles.rewardDetailsPointsText}>{selectedReward.points} points</Text>
                </View>

                <Text style={styles.rewardDetailsExpiry}>Expires: {selectedReward.expiryDate}</Text>

                <TouchableOpacity
                  style={[
                    styles.redeemButton,
                    userRewardsData.totalPoints < selectedReward.points && styles.disabledRedeemButton,
                  ]}
                  disabled={userRewardsData.totalPoints < selectedReward.points}
                >
                  <Text style={styles.redeemButtonText}>
                    {userRewardsData.totalPoints >= selectedReward.points ? "Redeem Reward" : "Not Enough Points"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("calendar")}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <MaterialCommunityIcons name="bookmark" size={24} color="#cf3a23" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("map")}>
          <Ionicons name="location-outline" size={24} color="black" />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  content: {
    flex: 1,
  },
  userRewardsSummary: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 16,
  },
  pointsSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  pointsLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#cf3a23",
  },
  levelSection: {
    marginTop: 8,
  },
  levelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelLabel: {
    fontSize: 14,
    color: "#666",
  },
  levelValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  levelProgressContainer: {
    marginBottom: 8,
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 4,
  },
  levelProgressFill: {
    height: 8,
    backgroundColor: "#cf3a23",
    borderRadius: 4,
  },
  levelProgressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "white",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeCategoryButton: {
    backgroundColor: "#cf3a23",
    borderColor: "#cf3a23",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#333",
  },
  activeCategoryButtonText: {
    color: "white",
    fontWeight: "500",
  },
  rewardsContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 12,
  },
  rewardsList: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  rewardCard: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardImage: {
    width: "100%",
    height: 140,
  },
  rewardCardContent: {
    padding: 12,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  rewardCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsText: {
    marginLeft: 4,
    fontWeight: "500",
    color: "#333",
  },
  expiryDate: {
    fontSize: 12,
    color: "#999",
  },
  activityContainer: {
    marginBottom: 16,
    backgroundColor: "white",
    paddingVertical: 16,
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  activityInfo: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 12,
    color: "#999",
  },
  activityPoints: {
    fontWeight: "bold",
    fontSize: 14,
  },
  pointsEarned: {
    color: "#4CAF50",
  },
  pointsSpent: {
    color: "#F44336",
  },
  rewardDetailsModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  rewardDetailsContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  rewardDetailsImage: {
    width: "100%",
    height: 180,
  },
  rewardDetailsInfo: {
    padding: 16,
  },
  rewardDetailsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  rewardDetailsDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
    lineHeight: 24,
  },
  rewardDetailsPoints: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardDetailsPointsText: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
  },
  rewardDetailsExpiry: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
  },
  redeemButton: {
    backgroundColor: "#cf3a23",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledRedeemButton: {
    backgroundColor: "#ccc",
  },
  redeemButtonText: {
    color: "white",
    fontSize: 16,
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

