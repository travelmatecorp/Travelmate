"use client"

import { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"
import * as Location from "expo-location"
import { createLugar } from "./api"

// Place types based on the schema
const placeTypes = [
  { id: "alojamiento", name: "Accommodation", icon: "bed" },
  { id: "restaurante", name: "Restaurant", icon: "restaurant" },
  { id: "excursion", name: "Excursion", icon: "walk" },
  { id: "auto", name: "Car Rental", icon: "car" },
  { id: "otro", name: "Other", icon: "ellipsis-horizontal" },
]

export default function AddPlaceScreen({ onNavigate, auth }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "alojamiento",
    location: "",
    description: "",
    price: "",
    checkInTime: "14:00",
    checkOutTime: "12:00",
    amenities: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleGetCurrentLocation = async () => {
    try {
      setLoading(true)
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status !== "granted") {
        Alert.alert("Permission Denied", "Permission to access location was denied")
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      const { latitude, longitude } = location.coords

      // Get address from coordinates
      const addressResponse = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      })

      if (addressResponse && addressResponse.length > 0) {
        const address = addressResponse[0]
        const locationString = `${address.street || ""}, ${address.city || ""}, ${address.region || ""}, ${address.country || ""}`

        handleInputChange("location", locationString)
      }
    } catch (error) {
      console.error("Error getting location:", error)
      Alert.alert("Error", "Could not get your current location")
    } finally {
      setLoading(false)
    }
  }

  // Simplified image handling without expo-image-picker
  const handleImageUpload = () => {
    Alert.alert(
      "Image Upload",
      "This feature requires the expo-image-picker package. Please install it to enable image uploads.",
      [{ text: "OK" }],
    )
  }

  const handleSubmit = async () => {
    // Validate form
    if (!formData.name || !formData.type || !formData.location) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Format the data for the API
      const placeData = {
        nombre: formData.name,
        descripcion: formData.description,
        tipo: formData.type,
        ubicacion: formData.location,
        precio: formData.price ? Number.parseFloat(formData.price) : null,
        horario_checkin: formData.checkInTime || "14:00",
        horario_checkout: formData.checkOutTime || "12:00",
        amenities: formData.amenities || "",
        // In a real app, you would upload the image here
      }

      // Call the API to create the place
      const response = await createLugar(placeData)

      Alert.alert("Success", "Your place has been added successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Make sure we navigate back to the account screen
            onNavigate("account")
          },
        },
      ])
    } catch (error) {
      setError("Failed to add your place. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            // Make sure we navigate back to the account screen
            onNavigate("account")
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Place</Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.formContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Text style={styles.label}>Place Type *</Text>
          <View style={styles.typeSelector}>
            {placeTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[styles.typeOption, formData.type === type.id && styles.selectedType]}
                onPress={() => handleInputChange("type", type.id)}
              >
                <Ionicons name={type.icon} size={20} color={formData.type === type.id ? "#fff" : "#333"} />
                <Text style={[styles.typeText, formData.type === type.id && styles.selectedTypeText]}>{type.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Place Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleInputChange("name", text)}
            placeholder="Enter place name"
          />

          <Text style={styles.label}>Location *</Text>
          <View style={styles.locationInputContainer}>
            <TextInput
              style={styles.locationInput}
              value={formData.location}
              onChangeText={(text) => handleInputChange("location", text)}
              placeholder="Enter location"
              multiline
            />
            <TouchableOpacity style={styles.locationButton} onPress={handleGetCurrentLocation} disabled={loading}>
              <Ionicons name="location" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => handleInputChange("description", text)}
            placeholder="Enter description, amenities, etc."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {formData.type === "alojamiento" && (
            <>
              <Text style={styles.label}>Price (per night)</Text>
              <TextInput
                style={styles.input}
                value={formData.price}
                onChangeText={(text) => handleInputChange("price", text)}
                placeholder="Enter price"
                keyboardType="numeric"
              />

              <Text style={styles.label}>Check-in Time</Text>
              <TextInput
                style={styles.input}
                value={formData.checkInTime}
                onChangeText={(text) => handleInputChange("checkInTime", text)}
                placeholder="e.g. 14:00"
              />

              <Text style={styles.label}>Check-out Time</Text>
              <TextInput
                style={styles.input}
                value={formData.checkOutTime}
                onChangeText={(text) => handleInputChange("checkOutTime", text)}
                placeholder="e.g. 12:00"
              />

              <Text style={styles.label}>Amenities (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.amenities}
                onChangeText={(text) => handleInputChange("amenities", text)}
                placeholder="e.g. WiFi, Pool, Parking"
                multiline
              />
            </>
          )}

          <Text style={styles.label}>Photo (Optional)</Text>
          <TouchableOpacity style={styles.imageUploadButton} onPress={handleImageUpload}>
            <View style={styles.uploadPlaceholder}>
              <Ionicons name="camera" size={32} color="#999" />
              <Text style={styles.uploadText}>Tap to upload a photo</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.submitButtonText}>{loading ? "Adding..." : "Add Place"}</Text>
          </TouchableOpacity>

          {/* Add extra padding at the bottom */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

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
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: "48%",
  },
  selectedType: {
    backgroundColor: "#cf3a23",
  },
  typeText: {
    marginLeft: 4,
    fontSize: 14,
  },
  selectedTypeText: {
    color: "white",
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationInput: {
    flex: 1,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: "#cf3a23",
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  imageUploadButton: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    marginBottom: 16,
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadText: {
    marginTop: 8,
    color: "#999",
  },
  submitButton: {
    backgroundColor: "#cf3a23",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: {
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
