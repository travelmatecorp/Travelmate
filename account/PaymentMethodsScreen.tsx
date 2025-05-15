import React, { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function PaymentMethodsScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [selectedCard, setSelectedCard] = useState(0)
  
  // Mock payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
    {
      id: 2,
      type: "mastercard",
      last4: "5555",
      expMonth: 8,
      expYear: 2024,
      isDefault: false,
    },
  ])

  const [showAddCard, setShowAddCard] = useState(false)
  const [newCard, setNewCard] = useState({
    cardNumber: "",
    cardHolder: "",
    expMonth: "",
    expYear: "",
    cvv: "",
  })

  const handleCardNumberChange = (text) => {
    // Format card number with spaces every 4 digits
    const formatted = text.replace(/\s/g, "").replace(/(.{4})/g, "$1 ").trim()
    setNewCard({ ...newCard, cardNumber: formatted })
  }

  const handleExpDateChange = (text) => {
    // Format expiration date as MM/YY
    const cleaned = text.replace(/\D/g, "")
    let formatted = cleaned
    if (cleaned.length > 2) {
      formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4)
    }
    
    const [month, year] = formatted.split("/")
    setNewCard({ 
      ...newCard, 
      expMonth: month || "", 
      expYear: year ? "20" + year : "" 
    })
  }

  const handleAddCard = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Here you would normally add the card via API
      // const response = await addPaymentMethod(newCard);
      
      // Add mock card to the list
      const cardType = newCard.cardNumber.startsWith("4") ? "visa" : "mastercard"
      const last4 = newCard.cardNumber.replace(/\s/g, "").slice(-4)
      
      const newPaymentMethod = {
        id: paymentMethods.length + 1,
        type: cardType,
        last4,
        expMonth: parseInt(newCard.expMonth),
        expYear: parseInt(newCard.expYear),
        isDefault: paymentMethods.length === 0,
      }
      
      setPaymentMethods([...paymentMethods, newPaymentMethod])
      setShowAddCard(false)
      setNewCard({
        cardNumber: "",
        cardHolder: "",
        expMonth: "",
        expYear: "",
        cvv: "",
      })
      
      Alert.alert("Success", "Your card has been added successfully.")
    } catch (error) {
      console.error("Error adding card:", error)
      Alert.alert("Error", "Failed to add your card. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCard = (id) => {
    Alert.alert(
      "Remove Card",
      "Are you sure you want to remove this card?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            const updatedMethods = paymentMethods.filter(method => method.id !== id)
            setPaymentMethods(updatedMethods)
            
            // If we removed the default card, set the first card as default
            if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
              updatedMethods[0].isDefault = true
            }
          },
        },
      ]
    )
  }

  const handleSetDefault = (id) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    }))
    setPaymentMethods(updatedMethods)
  }

  const getCardIcon = (type) => {
    switch (type) {
      case "visa":
        return "card-outline" // Using Ionicons as placeholder
      case "mastercard":
        return "card-outline" // Using Ionicons as placeholder
      default:
        return "card-outline"
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!showAddCard ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Your Payment Methods</Text>
              
              {paymentMethods.length > 0 ? (
                paymentMethods.map((method, index) => (
                  <View key={method.id} style={styles.cardItem}>
                    <View style={styles.cardIconContainer}>
                      <Ionicons name={getCardIcon(method.type)} size={28} color="#333" />
                    </View>
                    <View style={styles.cardDetails}>
                      <Text style={styles.cardType}>
                        {method.type.charAt(0).toUpperCase() + method.type.slice(1)} •••• {method.last4}
                      </Text>
                      <Text style={styles.cardExpiry}>
                        Expires {method.expMonth}/{method.expYear.toString().slice(-2)}
                      </Text>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.cardActions}>
                      {!method.isDefault && (
                        <TouchableOpacity 
                          style={styles.cardActionButton}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Text style={styles.cardActionButtonText}>Set Default</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity 
                        style={[styles.cardActionButton, styles.removeButton]}
                        onPress={() => handleRemoveCard(method.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#cf3a23" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="card-outline" size={48} color="#999" />
                  <Text style={styles.emptyStateText}>No payment methods added yet</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => setShowAddCard(true)}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={styles.addButtonText}>Add New Card</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setShowAddCard(false)}>
                <Ionicons name="close-circle-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.cardForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  value={newCard.cardNumber}
                  onChangeText={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  keyboardType="number-pad"
                  maxLength={19} // 16 digits + 3 spaces
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Cardholder Name</Text>
                <TextInput
                  style={styles.input}
                  value={newCard.cardHolder}
                  onChangeText={(text) => setNewCard({ ...newCard, cardHolder: text })}
                  placeholder="John Doe"
                />
              </View>
              
              <View style={styles.formRow}>
                <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Expiration Date</Text>
                  <TextInput
                    style={styles.input}
                    value={`${newCard.expMonth}${newCard.expYear ? "/" + newCard.expYear.slice(-2) : ""}`}
                    onChangeText={handleExpDateChange}
                    placeholder="MM/YY"
                    keyboardType="number-pad"
                    maxLength={5} // MM/YY
                  />
                </View>
                
                <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    value={newCard.cvv}
                    onChangeText={(text) => setNewCard({ ...newCard, cvv: text })}
                    placeholder="123"
                    keyboardType="number-pad"
                    maxLength={4}
                    secureTextEntry
                  />
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleAddCard}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Card</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: "500",
  },
  cardExpiry: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  defaultBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardActionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  cardActionButtonText: {
    color: "#cf3a23",
    fontSize: 14,
    fontWeight: "500",
  },
  removeButton: {
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#999",
    marginTop: 8,
  },
  addButton: {
    backgroundColor: "#cf3a23",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  cardForm: {
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  formRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: "#cf3a23",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
})
