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
  Alert,
  Image,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { createLugar } from "../api"

const placeTypes = [
  { id: "alojamiento", name: "Accommodation", icon: "bed" },
  { id: "restaurante", name: "Restaurant", icon: "restaurant" },
  { id: "excursion", name: "Excursion", icon: "walk" },
  { id: "auto", name: "Car Rental", icon: "car" },
  { id: "otro", name: "Other", icon: "ellipsis-horizontal" },
]

export default function PlaceUploadModal({ visible, onClose, location, onSuccess }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [selectedType, setSelectedType] = useState("alojamiento")
  const [image, setImage] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (status !== "granted") {
      Alert.alert("Permission Denied", "Sorry, we need camera roll permissions to upload images.")
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a name for your place")
      return
    }

    if (!address.trim()) {
      setError("Please enter an address for your place")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Format location for API
      const locationString = location ? `${location.latitude},${location.longitude}` : address // Use address as fallback if no coordinates

      // Call API to create place
      const response = await createLugar({
        nombre: name,
        descripcion: description,
        tipo: selectedType,
        ubicacion: locationString,
        // In a real app, you would upload the image here
      })

      // Success
      onSuccess({
        id: response.id || Math.random().toString(),
        name,
        description,
        type: selectedType,
        latitude: location?.latitude,
        longitude: location?.longitude,
        address,
        imageUri: image,
      })

      onClose()
    } catch (error) {
      setError("Failed to upload place. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setAddress("")
    setSelectedType("alojamiento")
    setImage(null)
    setError("")
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Place</Text>
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
            <Text style={styles.label}>Place Type</Text>
            <View style={styles.typeSelector}>
              {placeTypes.map((type) => (
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
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter place name" />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter full address"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description, amenities, etc."
              multiline
              numberOfLines={4}
            />

            <Text style={styles.label}>Photo (Optional)</Text>
            <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
              {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Ionicons name="camera" size={32} color="#999" />
                  <Text style={styles.uploadText}>Tap to upload a photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {location && (
              <Text style={styles.locationText}>
                Location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </Text>
            )}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isLoading}>
              <Text style={styles.submitButtonText}>{isLoading ? "Uploading..." : "Add Place"}</Text>
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
    maxHeight: "90%",
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
  previewImage: {
    width: "100%",
    height: "100%",
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

