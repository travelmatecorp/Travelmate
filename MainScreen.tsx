"use client"

import { useState } from "react"
import { StyleSheet, View, Text, ScrollView, Image, TextInput, TouchableOpacity, Dimensions } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

// Get screen width for responsive sizing
const { width } = Dimensions.get("window")
const cardWidth = width * 0.7

// Mock data for the listings
const hotelData = [
  {
    id: "1",
    name: "Hotel Trenquelauquen",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "$120/night",
    rating: 4.8,
  },
  {
    id: "2",
    name: "Hotel Morenis",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "$95/night",
    rating: 4.5,
  },
  {
    id: "3",
    name: "Grand Plaza Hotel",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "$150/night",
    rating: 4.9,
  },
  {
    id: "4",
    name: "Seaside Resort",
    image:
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "$200/night",
    rating: 4.7,
  },
  {
    id: "5",
    name: "Mountain View Lodge",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    price: "$180/night",
    rating: 4.6,
  },
]

const restaurantData = [
  {
    id: "1",
    name: "Esquina Due",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    cuisine: "Italian",
    rating: 4.6,
  },
  {
    id: "2",
    name: "Pizza anuel brr",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    cuisine: "Pizza",
    rating: 4.3,
  },
  {
    id: "3",
    name: "Coastal Grill",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    cuisine: "Seafood",
    rating: 4.7,
  },
  {
    id: "4",
    name: "Sushi Express",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    cuisine: "Japanese",
    rating: 4.5,
  },
  {
    id: "5",
    name: "Taco Fiesta",
    image:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    cuisine: "Mexican",
    rating: 4.4,
  },
]

const excursionData = [
  {
    id: "1",
    name: "Cataratas",
    image:
      "https://images.unsplash.com/photo-1534407315408-56a7c9c3ccac?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "6 hours",
    rating: 4.9,
  },
  {
    id: "2",
    name: "Río Azul",
    image:
      "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "4 hours",
    rating: 4.7,
  },
  {
    id: "3",
    name: "Mountain Trek",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "8 hours",
    rating: 4.8,
  },
  {
    id: "4",
    name: "Desert Safari",
    image: "https://images.unsplash.com/photo-1547234935-80c7145ec969?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "5 hours",
    rating: 4.6,
  },
  {
    id: "5",
    name: "Jungle Adventure",
    image:
      "https://images.unsplash.com/photo-1604537466158-719b1972feb8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
    duration: "7 hours",
    rating: 4.5,
  },
]

// Category data
const categories = [
  { id: "1", name: "Fijado", icon: "star-outline", type: "ionicon" },
  { id: "2", name: "Hoteles", icon: "bookmark-outline", type: "ionicon", active: true },
  { id: "3", name: "Casas", icon: "star", type: "ionicon", filled: true },
  { id: "4", name: "Depts", icon: "home", type: "ionicon" },
  { id: "5", name: "Vehic", icon: "apps", type: "ionicon" },
  { id: "6", name: "Excur", icon: "walk", type: "ionicon" },
  { id: "7", name: "Resto", icon: "cafe", type: "ionicon" },
]

export default function MainScreen({ onNavigate, auth }) {
  const [activeCategory, setActiveCategory] = useState("Hoteles")

  const renderCategoryIcon = (item) => {
    switch (item.type) {
      case "ionicon":
        return (
          <Ionicons
            name={item.icon}
            size={24}
            color={item.active ? "#cf3a23" : "black"}
            style={item.filled ? styles.filledIcon : {}}
          />
        )
      case "material":
        return <MaterialIcons name={item.icon} size={24} color={item.active ? "#cf3a23" : "black"} />
      case "font-awesome-5":
        return <FontAwesome5 name={item.icon} size={24} color={item.active ? "#cf3a23" : "black"} />
      default:
        return <Ionicons name={item.icon} size={24} color={item.active ? "#cf3a23" : "black"} />
    }
  }

  const renderListingItem = (item, index, dataLength) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.horizontalListingItem, index === dataLength - 1 && { marginRight: 16 }]}
    >
      <Image source={{ uri: item.image }} style={styles.horizontalListingImage} />
      <View style={styles.listingDetails}>
        <Text style={styles.listingName}>{item.name}</Text>
        {item.price && <Text style={styles.listingPrice}>{item.price}</Text>}
        {item.cuisine && <Text style={styles.listingInfo}>{item.cuisine}</Text>}
        {item.duration && <Text style={styles.listingInfo}>{item.duration}</Text>}
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="filter" size={24} color="black" style={styles.filterIcon} />
          <TextInput style={styles.searchInput} placeholder="" placeholderTextColor="#999" />
          <Ionicons name="search" size={24} color="#747775" style={styles.searchIcon} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => setActiveCategory(category.name)}
          >
            {renderCategoryIcon(category)}
            <Text style={[styles.categoryName, category.name === activeCategory && styles.activeCategoryName]}>
              {category.name}
            </Text>
            {category.name === activeCategory && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hoteles</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {hotelData.map((item, index) => renderListingItem(item, index, hotelData.length))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Restaurant</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {restaurantData.map((item, index) => renderListingItem(item, index, restaurantData.length))}
          </ScrollView>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Excursiones</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {excursionData.map((item, index) => renderListingItem(item, index, excursionData.length))}
          </ScrollView>
        </View>

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
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]} onPress={() => onNavigate("map")}>
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
  categoriesContainer: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryItem: {
    alignItems: "center",
    position: "relative",
    marginRight: 24,
  },
  categoryName: {
    marginTop: 4,
    fontSize: 12,
  },
  activeCategoryName: {
    color: "#cf3a23",
  },
  filledIcon: {
    color: "black",
  },
  activeIndicator: {
    position: "absolute",
    bottom: -9,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#cf3a23",
  },
  contentContainer: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 8,
  },
  horizontalScrollContent: {
    paddingLeft: 16,
  },
  horizontalListingItem: {
    width: cardWidth,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  horizontalListingImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  listingDetails: {
    padding: 12,
  },
  listingName: {
    fontSize: 16,
    fontWeight: "600",
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

