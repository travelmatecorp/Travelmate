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
  Alert,
  Modal,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { getPlaceById, addToFavorites, removeFromFavorites, createReservation, formatDate } from "./api"

export default function PlaceDetailScreen({ onNavigate, auth, route }) {
  const [place, setPlace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showReservationModal, setShowReservationModal] = useState(false)
  const [reservationDates, setReservationDates] = useState({
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [datePickerMode, setDatePickerMode] = useState("start") // "start" or "end"
  const [datePickerVisible, setDatePickerVisible] = useState(false)

  useEffect(() => {
    // Debug: Log the entire route object
    console.log("Route object:", JSON.stringify(route, null, 2))

    // Debug: Log all params individually
    if (route?.params) {
      Object.keys(route.params).forEach((key) => {
        console.log(`Param ${key}:`, route.params[key])
      })
    } else {
      console.log("No route params available")
    }

    // Try to extract the place ID from various possible sources
    let placeId = null

    // Check if we have route params
    if (route?.params) {
      // Try common parameter names
      placeId = route.params.id || route.params.placeId || route.params.lugar_id

      // If still not found, try to find any numeric parameter that could be an ID
      if (!placeId) {
        for (const key in route.params) {
          const value = route.params[key]
          if (typeof value === "number" || (typeof value === "string" && !isNaN(Number.parseInt(value)))) {
            placeId = value
            console.log(`Found potential ID in param ${key}:`, placeId)
            break
          }
        }
      }

      // Check if we have a place object with an id
      if (!placeId && route.params.place && route.params.place.id) {
        placeId = route.params.place.id
        console.log("Found ID in place object:", placeId)
      }
    }

    // Check if we have a direct property on route
    if (!placeId && route?.id) {
      placeId = route.id
      console.log("Found ID directly on route object:", placeId)
    }

    if (placeId) {
      console.log("Using place ID:", placeId)
      fetchPlaceDetails(placeId)
    } else {
      console.error("No place ID found in route params:", route?.params)
      setLoading(false)
      Alert.alert("Error", "No place ID provided")
    }
  }, [route])

  const fetchPlaceDetails = async (placeId) => {
    try {
      console.log("Fetching place details for ID:", placeId)
      setLoading(true)
      const placeData = await getPlaceById(placeId)
      console.log("Place data received:", placeData)

      // If we got a place object directly, use it
      if (placeData) {
        setPlace(placeData)
        // Check if this place is in user's favorites
        setIsFavorite(placeData.isFavorite || false)
      } else {
        throw new Error("No place data returned from API")
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
      Alert.alert("Error", "Failed to load place details")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!auth?.isLoggedIn) {
      Alert.alert("Login Required", "Please log in to save favorites", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => onNavigate("login") },
      ])
      return
    }

    try {
      if (isFavorite) {
        await removeFromFavorites(place.id)
        setIsFavorite(false)
        Alert.alert("Success", "Removed from favorites")
      } else {
        await addToFavorites(place.id)
        setIsFavorite(true)
        Alert.alert("Success", "Added to favorites")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      Alert.alert("Error", "Failed to update favorites")
    }
  }

  const handleMakeReservation = () => {
    if (!auth?.isLoggedIn) {
      Alert.alert("Login Required", "Please log in to make a reservation", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => onNavigate("login") },
      ])
      return
    }

    setShowReservationModal(true)
  }

  const handleDateChange = (event, selectedDate) => {
    setDatePickerVisible(Platform.OS === "ios")
    if (selectedDate) {
      if (datePickerMode === "start") {
        setReservationDates({
          ...reservationDates,
          startDate: selectedDate,
          // If end date is before new start date, adjust it
          endDate:
            selectedDate > reservationDates.endDate
              ? new Date(selectedDate.getTime() + 86400000) // Add one day
              : reservationDates.endDate,
        })
      } else {
        setReservationDates({
          ...reservationDates,
          endDate: selectedDate,
        })
      }
    }
  }

  const showDatepicker = (mode) => {
    setDatePickerMode(mode)
    setDatePickerVisible(true)
  }

  const handleConfirmReservation = async () => {
    try {
      const { startDate, endDate } = reservationDates

      // Validate dates
      if (startDate >= endDate) {
        Alert.alert("Invalid Dates", "End date must be after start date")
        return
      }

      if (!auth?.user?.id) {
        Alert.alert("Login Required", "Please log in to make a reservation")
        return
      }

      // Create reservation
      const reservationData = {
        usuario_id: auth.user.id,
        lugar_id: place.id,
        fecha_inicio: startDate.toISOString().split("T")[0],
        fecha_fin: endDate.toISOString().split("T")[0],
      }

      await createReservation(reservationData)
      setShowReservationModal(false)
      Alert.alert("Success", "Reservation created successfully")
    } catch (error) {
      console.error("Error creating reservation:", error)
      Alert.alert("Error", "Failed to create reservation")
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#cf3a23" />
        </View>
      </SafeAreaView>
    )
  }

  if (!place) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate("map")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Place Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Place not found</Text>
          <Text style={styles.errorSubtext}>
            {route?.params ? `Params received: ${JSON.stringify(route.params)}` : "No parameters received"}
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("map")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Place Details</Text>
        <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
          <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={24} color={isFavorite ? "#cf3a23" : "black"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Image
          source={{ uri: place.imagen_url || `https://source.unsplash.com/random/?${place.nombre},${place.tipo}` }}
          style={styles.placeImage}
        />

        <View style={styles.detailsContainer}>
          <Text style={styles.placeName}>{place.nombre}</Text>

          <View style={styles.placeTypeContainer}>
            <Ionicons
              name={
                place.tipo === "alojamiento" || place.tipo === "hotel"
                  ? "bed-outline"
                  : place.tipo === "restaurante" || place.tipo === "restaurant"
                    ? "restaurant-outline"
                    : place.tipo === "excursion"
                      ? "walk"
                      : place.tipo === "auto"
                        ? "car-outline"
                        : "business-outline"
              }
              size={18}
              color="#666"
            />
            <Text style={styles.placeType}>
              {place.tipo === "alojamiento" || place.tipo === "hotel"
                ? "Accommodation"
                : place.tipo === "restaurante" || place.tipo === "restaurant"
                  ? "Restaurant"
                  : place.tipo === "excursion"
                    ? "Excursion"
                    : place.tipo === "auto"
                      ? "Car Rental"
                      : "Other"}
            </Text>
          </View>

          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={18} color="#666" />
            <Text style={styles.locationText}>{place.ubicacion}</Text>
          </View>

          {place.horario_checkin && place.horario_checkout && (
            <View style={styles.timesContainer}>
              <View style={styles.timeItem}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.timeText}>Check-in: {place.horario_checkin}</Text>
              </View>
              <View style={styles.timeItem}>
                <Ionicons name="time-outline" size={18} color="#666" />
                <Text style={styles.timeText}>Check-out: {place.horario_checkout}</Text>
              </View>
            </View>
          )}

          {place.precio && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price:</Text>
              <Text style={styles.priceValue}>${place.precio}</Text>
              {(place.tipo === "alojamiento" || place.tipo === "hotel") && <Text style={styles.priceUnit}>/night</Text>}
            </View>
          )}

          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{place.descripcion || "No description available."}</Text>
          </View>

          {place.amenities && (
            <View style={styles.amenitiesContainer}>
              <Text style={styles.amenitiesTitle}>Amenities</Text>
              <View style={styles.amenitiesList}>
                {place.amenities.split(",").map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
                    <Text style={styles.amenityText}>{amenity.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {(place.tipo === "alojamiento" || place.tipo === "hotel") && (
            <TouchableOpacity style={styles.reserveButton} onPress={handleMakeReservation}>
              <Text style={styles.reserveButtonText}>Make Reservation</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Reservation Modal */}
      <Modal
        visible={showReservationModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReservationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Make a Reservation</Text>
              <TouchableOpacity onPress={() => setShowReservationModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalPlaceName}>{place.nombre}</Text>

              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Check-in Date:</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => showDatepicker("start")}>
                  <Text style={styles.datePickerButtonText}>{formatDate(reservationDates.startDate)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>Check-out Date:</Text>
                <TouchableOpacity style={styles.datePickerButton} onPress={() => showDatepicker("end")}>
                  <Text style={styles.datePickerButtonText}>{formatDate(reservationDates.endDate)}</Text>
                  <Ionicons name="calendar-outline" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              {datePickerVisible && (
                <DateTimePicker
                  value={datePickerMode === "start" ? reservationDates.startDate : reservationDates.endDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={datePickerMode === "start" ? new Date() : reservationDates.startDate}
                />
              )}

              <View style={styles.reservationSummary}>
                <Text style={styles.summaryTitle}>Reservation Summary</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Duration:</Text>
                  <Text style={styles.summaryValue}>
                    {Math.ceil((reservationDates.endDate - reservationDates.startDate) / (1000 * 60 * 60 * 24))} nights
                  </Text>
                </View>
                {place.precio && (
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Price:</Text>
                    <Text style={styles.summaryValue}>
                      $
                      {place.precio *
                        Math.ceil((reservationDates.endDate - reservationDates.startDate) / (1000 * 60 * 60 * 24))}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmReservation}>
                <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  favoriteButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  placeImage: {
    width: "100%",
    height: 250,
  },
  detailsContainer: {
    padding: 16,
  },
  placeName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  placeTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  placeType: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  locationText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
    flex: 1,
  },
  timesContainer: {
    marginBottom: 16,
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timeText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#cf3a23",
  },
  priceUnit: {
    fontSize: 16,
    color: "#666",
    marginLeft: 4,
  },
  descriptionContainer: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  amenitiesContainer: {
    marginBottom: 16,
  },
  amenitiesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  amenitiesList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
  reserveButton: {
    backgroundColor: "#cf3a23",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  reserveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalBody: {
    padding: 16,
  },
  modalPlaceName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  reservationSummary: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  confirmButton: {
    backgroundColor: "#cf3a23",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
