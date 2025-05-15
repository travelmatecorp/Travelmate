import React, { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function NotificationsScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    notifications: {
      bookingUpdates: true,
      promotions: false,
      accountActivity: true,
      tripReminders: true,
      newListings: false,
      recommendations: true,
    },
  })

  const toggleSwitch = (category, subcategory = null) => {
    if (subcategory) {
      setSettings({
        ...settings,
        notifications: {
          ...settings.notifications,
          [subcategory]: !settings.notifications[subcategory],
        },
      })
    } else {
      setSettings({
        ...settings,
        [category]: !settings[category],
      })
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Here you would normally update the notification settings via API
      // const response = await updateNotificationSettings(settings);
      
      Alert.alert("Success", "Your notification preferences have been updated.")
      navigation.goBack()
    } catch (error) {
      console.error("Error updating notification settings:", error)
      Alert.alert("Error", "Failed to update your notification preferences. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="notifications-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications on your device</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("pushEnabled")}
              value={settings.pushEnabled}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="mail-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive notifications via email</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("emailEnabled")}
              value={settings.emailEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Booking Updates</Text>
                <Text style={styles.settingDescription}>Changes to your reservations</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("notifications", "bookingUpdates")}
              value={settings.notifications.bookingUpdates}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="pricetag-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Promotions & Offers</Text>
                <Text style={styles.settingDescription}>Deals and special offers</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("notifications", "promotions")}
              value={settings.notifications.promotions}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="shield-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Account Activity</Text>
                <Text style={styles.settingDescription}>Login attempts and security alerts</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("notifications", "accountActivity")}
              value={settings.notifications.accountActivity}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="alarm-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Trip Reminders</Text>
                <Text style={styles.settingDescription}>Upcoming trip notifications</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("notifications", "tripReminders")}
              value={settings.notifications.tripReminders}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="home-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>New Listings</Text>
                <Text style={styles.settingDescription}>New places in your favorite areas</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("notifications", "newListings")}
              value={settings.notifications.newListings}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="compass-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Recommendations</Text>
                <Text style={styles.settingDescription}>Personalized travel suggestions</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("notifications", "recommendations")}
              value={settings.notifications.recommendations}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Preferences</Text>
          )}
        </TouchableOpacity>

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
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
