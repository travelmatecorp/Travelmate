"use client"
import { View, Text, StyleSheet } from "react-native"

export default function ApiStatusIndicator({ isOnline = false }) {
  return (
    <View style={styles.container}>
      <View style={[styles.indicator, isOnline ? styles.available : styles.unavailable]} />
      <Text style={styles.text}>{isOnline ? "Online" : "Offline"}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    position: "absolute",
    bottom: 70,
    right: 10,
    zIndex: 1000,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  available: {
    backgroundColor: "#4CAF50",
  },
  unavailable: {
    backgroundColor: "#FFC107",
  },
  text: {
    fontSize: 10,
    color: "#666",
  },
})
