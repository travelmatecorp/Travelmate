import React, { useState } from "react"
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function PrivacySecurityScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [settings, setSettings] = useState({
    twoFactorEnabled: false,
    locationSharing: true,
    dataCollection: true,
    marketingConsent: false,
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const toggleSwitch = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    })
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData({
      ...passwordData,
      [field]: value,
    })
  }

  const handleSavePassword = async () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      Alert.alert("Error", "Please enter your current password.")
      return
    }
    
    if (!passwordData.newPassword) {
      Alert.alert("Error", "Please enter a new password.")
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert("Error", "New passwords don't match.")
      return
    }
    
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Here you would normally update the password via API
      // const response = await updatePassword(passwordData);
      
      Alert.alert("Success", "Your password has been updated successfully.")
      setShowChangePassword(false)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (error) {
      console.error("Error updating password:", error)
      Alert.alert("Error", "Failed to update your password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Here you would normally update the privacy settings via API
      // const response = await updatePrivacySettings(settings);
      
      Alert.alert("Success", "Your privacy and security settings have been updated.")
      navigation.goBack()
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      Alert.alert("Error", "Failed to update your privacy settings. Please try again.")
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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowChangePassword(!showChangePassword)}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="lock-closed-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingDescription}>Update your account password</Text>
              </View>
            </View>
            <Ionicons 
              name={showChangePassword ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showChangePassword && (
            <View style={styles.passwordForm}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.currentPassword}
                  onChangeText={(text) => handlePasswordChange("currentPassword", text)}
                  placeholder="Enter current password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.newPassword}
                  onChangeText={(text) => handlePasswordChange("newPassword", text)}
                  placeholder="Enter new password"
                  secureTextEntry
                />
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => handlePasswordChange("confirmPassword", text)}
                  placeholder="Confirm new password"
                  secureTextEntry
                />
              </View>
              
              <TouchableOpacity 
                style={styles.passwordButton} 
                onPress={handleSavePassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.passwordButtonText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>Add an extra layer of security</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("twoFactorEnabled")}
              value={settings.twoFactorEnabled}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="location-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Location Sharing</Text>
                <Text style={styles.settingDescription}>Allow app to access your location</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("locationSharing")}
              value={settings.locationSharing}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="analytics-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Data Collection</Text>
                <Text style={styles.settingDescription}>Allow app to collect usage data</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("dataCollection")}
              value={settings.dataCollection}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingIconContainer}>
                <Ionicons name="mail-outline" size={24} color="#333" />
              </View>
              <View>
                <Text style={styles.settingTitle}>Marketing Communications</Text>
                <Text style={styles.settingDescription}>Receive promotional emails</Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#e0e0e0", true: "#cf3a23" }}
              thumbColor="#ffffff"
              ios_backgroundColor="#e0e0e0"
              onValueChange={() => toggleSwitch("marketingConsent")}
              value={settings.marketingConsent}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download-outline" size={20} color="#333" />
            <Text style={styles.actionButtonText}>Download My Data</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
            <Ionicons name="trash-outline" size={20} color="#cf3a23" />
            <Text style={styles.dangerButtonText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveSettings}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Settings</Text>
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
  passwordForm: {
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  passwordButton: {
    backgroundColor: "#cf3a23",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  passwordButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  actionButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
  dangerButton: {
    borderBottomWidth: 0,
  },
  dangerButtonText: {
    fontSize: 16,
    marginLeft: 12,
    color: "#cf3a23",
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
