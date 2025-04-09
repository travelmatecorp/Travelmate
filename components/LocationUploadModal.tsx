"use client"

import { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Picker } from '@react-native-picker/picker';
// Define location types without using the Picker component
const locationTypes = [
  { id: "hotel", name: "Hotel", icon: "bed" },
  { id: "restaurant", name: "Restaurant", icon: "restaurant" },
  { id: "excursion", name: "Excursion", icon: "walk" },
]

export default function LocationUploadModal({ visible, onClose, location, onSuccess }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [selectedType, setSelectedType] = useState("hotel")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a name for your location")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // This would be replaced with your actual API call
      // const response = await api.post("/lugares", {
      //   nombre: name,
      //   descripcion: description,
      //   tipo: selectedType,
      //   ubicacion: `${location.latitude},${location.longitude}`,
      //   precio: price,
      // })

      // Mock successful response for now
      setTimeout(() => {
        setIsLoading(false)
        onSuccess({
          id: Math.random().toString(),
          name,
          description,
          type: selectedType,
          latitude: location.latitude,
          longitude: location.longitude,
          price: price ? `$${price}` : undefined,
          rating: 5.0, // Default rating for new locations
        })
        onClose()
      }, 1000)
    } catch (error) {
      setIsLoading(false)
      setError("Failed to upload location. Please try again.")
      console.error("Upload error:", error)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setSelectedType("hotel")
    setError("")
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Location</Text>
            <TouchableOpacity
              onPress={() => {
                resetForm()
                onClose()
              }}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <ScrollView style={styles.formContainer}>
            <Text style={styles.label}>Location Type</Text>
            <View style={styles.typeSelector}>
              {locationTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[styles.typeOption, selectedType === type.id && styles.selectedType]}
                  onPress={() => setSelectedType(type.id)}
                >
                  <Ionicons name={type.icon} size={20} color={selectedType === type.id ? "#fff" : "#333"} />
                  <Text style={[styles.typeText, selectedType === type.id && styles.selectedTypeText]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter location name" />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Price (optional)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              placeholder="Enter price"
              keyboardType="numeric"
            />

            <Text style={styles.locationText}>
              Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
            </Text>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.submitButtonText}>{isLoading ? "Uploading..." : "Add Location"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  formContainer: {
    paddingVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  typeSelector: {
    flexDirection: "row",
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
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
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
  locationText: {
    marginTop: 16,
    fontSize: 14,
    color: "#666",
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
  errorText: {
    color: "red",
    marginTop: 16,
    textAlign: "center",
  },
})

