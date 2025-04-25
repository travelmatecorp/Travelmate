import type React from "react"
import { StyleSheet, View, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"

interface BottomNavigationProps {
  currentScreen: string
  onNavigate: (screen: string) => void
  auth: any
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentScreen, onNavigate, auth }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("home")}>
        <Ionicons
          name={currentScreen === "home" ? "home" : "home-outline"}
          size={24}
          color={currentScreen === "home" ? "#cf3a23" : "black"}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("calendar")}>
        <Ionicons
          name={currentScreen === "calendar" ? "calendar" : "calendar-outline"}
          size={24}
          color={currentScreen === "calendar" ? "#cf3a23" : "black"}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("messages")}>
        <Ionicons
          name={currentScreen === "messages" ? "chatbubble" : "chatbubble-outline"}
          size={24}
          color={currentScreen === "messages" ? "#cf3a23" : "black"}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navItem} onPress={() => onNavigate(auth?.isLoggedIn ? "account" : "login")}>
        <Ionicons
          name={currentScreen === "account" || currentScreen === "login" ? "person" : "person-outline"}
          size={24}
          color={currentScreen === "account" || currentScreen === "login" ? "#cf3a23" : "black"}
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
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
})

export default BottomNavigation
