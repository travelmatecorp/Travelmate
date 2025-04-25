"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import {
  View,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  PanResponder,
  Modal,
  TouchableOpacity,
  Text,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { height, width } = Dimensions.get("window")

interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: number[]
  initialSnapIndex?: number
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.8],
  initialSnapIndex = 0,
}) => {
  const translateY = useRef(new Animated.Value(height)).current
  const backdropOpacity = useRef(new Animated.Value(0)).current

  // Convert snap points to actual height values
  const snapValues = snapPoints.map((point) => height * (1 - point))
  const initialSnap = snapValues[initialSnapIndex] || snapValues[0]

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: initialSnap,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [visible])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = initialSnap + gestureState.dy
        if (newPosition > initialSnap) {
          translateY.setValue(newPosition)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // User swiped down significantly, close the sheet
          onClose()
        } else {
          // Snap back to initial position
          Animated.spring(translateY, {
            toValue: initialSnap,
            useNativeDriver: true,
          }).start()
        }
      },
    }),
  ).current

  const handleBackdropPress = () => {
    onClose()
  }

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleBackdropPress}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY }] }]} {...panResponder.panHandlers}>
          <View style={styles.handle} />

          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.scrollContent} contentContainerStyle={styles.contentContainer}>
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  bottomSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: height * 0.3,
    maxHeight: height * 0.9,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    alignSelf: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    maxHeight: height * 0.7,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40, // Add extra padding at the bottom
  },
})

export default BottomSheet
