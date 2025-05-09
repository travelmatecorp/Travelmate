"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { getVacationActivities, deleteVacationActivity, formatDate, getVacationPlans } from "./api"
import { useVacation } from "./context/VacationContext"

export default function VacationTimelineScreen({ onNavigate, auth, route }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [vacationPlan, setVacationPlan] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [vacationStarted, setVacationStarted] = useState(false)

  const [currentDay, setCurrentDay] = useState(1)
  const [totalDays, setTotalDays] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableDates, setAvailableDates] = useState([])
  const { setSelectedDestination } = useVacation()

  // Debug logging
  useEffect(() => {
    console.log("VacationTimelineScreen mounted with route params:", route?.params)
  }, [])

  useEffect(() => {
    const loadPlanData = async () => {
      try {
        setLoading(true)

        // Check if we have a planId
        if (!route?.params?.planId) {
          console.error("No planId provided in route params")
          setLoading(false)
          Alert.alert("Error", "No vacation plan ID provided")
          return
        }

        const planId = route.params.planId
        console.log(`Loading plan data for planId: ${planId}`)

        // If we have a complete plan object in params, use it
        if (route.params.plan && route.params.plan.destino) {
          console.log("Using plan from route params:", route.params.plan)
          setVacationPlan(route.params.plan)
        }
        // Otherwise, fetch the plan data from the API
        else {
          console.log("Fetching plan data from API")
          // Get the user ID from auth
          const userId = auth?.user?.id
          if (!userId) {
            console.error("No user ID available")
            setLoading(false)
            Alert.alert("Error", "User not authenticated")
            return
          }

          // Fetch all vacation plans for the user
          const plans = await getVacationPlans(userId)
          console.log(`Fetched ${plans.length} vacation plans`)

          // Find the plan with the matching ID
          const plan = plans.find((p) => p.id === planId)
          if (!plan) {
            console.error(`Plan with ID ${planId} not found`)
            setLoading(false)
            Alert.alert("Error", "Vacation plan not found")
            return
          }

          console.log("Found plan:", plan)
          setVacationPlan(plan)
        }

        // Fetch activities for the plan
        fetchActivities(planId)

        // Check if vacation has started
        if (vacationPlan && vacationPlan.fecha_inicio) {
          const today = new Date()
          const startDate = new Date(vacationPlan.fecha_inicio)
          setVacationStarted(today >= startDate)
        }
      } catch (error) {
        console.error("Error loading plan data:", error)
        setLoading(false)
        Alert.alert("Error", "Failed to load vacation plan data")
      }
    }

    loadPlanData()
  }, [route?.params?.planId, auth?.user?.id])

  useEffect(() => {
    console.log("vacationPlan updated:", vacationPlan)

    if (vacationPlan && vacationPlan.fecha_inicio && vacationPlan.fecha_fin) {
      const startDate = new Date(vacationPlan.fecha_inicio)
      const endDate = new Date(vacationPlan.fecha_fin)

      // Calculate total days
      const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      setTotalDays(days)

      // Generate array of available dates
      const dates = []
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        dates.push(date)
      }
      setAvailableDates(dates)

      // Set selected date to today if within vacation, otherwise first day
      const today = new Date()
      if (today >= startDate && today <= endDate) {
        const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1
        setCurrentDay(dayDiff)
        setSelectedDate(today)
      } else {
        setCurrentDay(1)
        setSelectedDate(startDate)
      }

      // Set destination in context for adding activities
      if (vacationPlan.destino) {
        console.log("Setting selected destination:", vacationPlan.destino)
        setSelectedDestination(vacationPlan.destino)
      } else {
        console.warn("No destination in vacation plan")
      }
    } else {
      console.warn("Missing date information in vacation plan")
    }
  }, [vacationPlan])

  const fetchActivities = async (planId) => {
    try {
      console.log(`Fetching activities for plan ${planId}`)
      const activitiesData = await getVacationActivities({ plan_id: planId })
      console.log(`Fetched ${activitiesData.length} activities`)

      // Group activities by date
      const groupedActivities = groupActivitiesByDate(activitiesData)
      setActivities(groupedActivities)
    } catch (error) {
      console.error("Error fetching activities:", error)
      Alert.alert("Error", "Failed to load vacation activities")
    } finally {
      setLoading(false)
    }
  }

  const groupActivitiesByDate = (activitiesData) => {
    const grouped = {}

    if (!activitiesData || !Array.isArray(activitiesData)) {
      console.warn("Invalid activities data:", activitiesData)
      return {}
    }

    activitiesData.forEach((activity) => {
      if (!activity || !activity.fecha) {
        console.warn("Invalid activity data:", activity)
        return
      }

      const date = new Date(activity.fecha).toISOString().split("T")[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(activity)
    })

    // Sort activities by time within each day
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        if (!a.hora_inicio || !b.hora_inicio) return 0
        return new Date(`${a.fecha}T${a.hora_inicio}`) - new Date(`${b.fecha}T${b.hora_inicio}`)
      })
    })

    return grouped
  }

  const handleDateSelect = (date) => {
    if (!vacationPlan || !vacationPlan.fecha_inicio) {
      console.warn("Cannot select date: missing vacation plan data")
      return
    }

    setSelectedDate(date)
    const startDate = new Date(vacationPlan.fecha_inicio)
    const dayDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1
    setCurrentDay(dayDiff)
  }

  const handleAddActivity = () => {
    // Navigate to map screen to select a place
    if (!vacationPlan || !vacationPlan.destino) {
      Alert.alert("Error", "Vacation plan or destination not found")
      return
    }

    onNavigate("map", {
      destination: vacationPlan.destino,
      planId: vacationPlan.id,
      selectedDate: selectedDate ? selectedDate.toISOString() : new Date().toISOString(),
    })
  }

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity)
    setShowDeleteModal(true)
  }

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return

    try {
      await deleteVacationActivity(selectedActivity.id)

      // Refresh activities
      if (vacationPlan && vacationPlan.id) {
        fetchActivities(vacationPlan.id)
      }
      setShowDeleteModal(false)
      setSelectedActivity(null)

      Alert.alert("Success", "Activity removed from your vacation")
    } catch (error) {
      console.error("Error deleting activity:", error)
      Alert.alert("Error", "Failed to remove activity")
    }
  }

  const renderTimelineItem = (activity, index, isLast) => {
    const isAccommodation = activity.lugar?.tipo === "alojamiento"
    const canEdit = !vacationStarted || !isAccommodation

    return (
      <View key={activity.id} style={styles.timelineItem}>
        <View style={styles.timelineLine}>
          <View style={styles.timelineDot} />
          {!isLast && <View style={styles.timelineConnector} />}
        </View>

        <View style={styles.timelineContent}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineTime}>
              {activity.hora_inicio ? activity.hora_inicio.substring(0, 5) : "All day"}
            </Text>
            <Text style={styles.timelineTitle}>{activity.lugar?.nombre || "Unknown Place"}</Text>

            {isEditing && canEdit && (
              <TouchableOpacity style={styles.editButton} onPress={() => handleEditActivity(activity)}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.timelineDetails}>
            <View style={styles.timelineType}>
              <Ionicons
                name={
                  activity.lugar?.tipo === "alojamiento"
                    ? "bed-outline"
                    : activity.lugar?.tipo === "restaurante"
                      ? "restaurant-outline"
                      : activity.lugar?.tipo === "excursion"
                        ? "walk"
                        : activity.lugar?.tipo === "auto"
                          ? "car-outline"
                          : "business-outline"
                }
                size={16}
                color="#666"
              />
              <Text style={styles.timelineTypeText}>
                {activity.lugar?.tipo === "alojamiento"
                  ? "Accommodation"
                  : activity.lugar?.tipo === "restaurante"
                    ? "Restaurant"
                    : activity.lugar?.tipo === "excursion"
                      ? "Excursion"
                      : activity.lugar?.tipo === "auto"
                        ? "Car Rental"
                        : "Other"}
              </Text>
            </View>

            {activity.lugar?.ubicacion && (
              <View style={styles.timelineLocation}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.timelineLocationText} numberOfLines={1}>
                  {activity.lugar.ubicacion}
                </Text>
              </View>
            )}

            {activity.notas && <Text style={styles.timelineNotes}>{activity.notas}</Text>}
          </View>
        </View>
      </View>
    )
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

  // If we still don't have a vacation plan after loading, show an error
  if (!vacationPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate("calendar")} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Vacation Timeline</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#d32f2f" />
          <Text style={styles.errorText}>Could not load vacation plan</Text>
          <TouchableOpacity style={styles.errorButton} onPress={() => onNavigate("calendar")}>
            <Text style={styles.errorButtonText}>Return to Calendar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("calendar")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vacation Timeline</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editToggleButton}>
          <Ionicons name={isEditing ? "checkmark" : "pencil"} size={24} color="#cf3a23" />
        </TouchableOpacity>
      </View>

      <View style={styles.vacationHeader}>
        <Text style={styles.vacationTitle}>{vacationPlan?.destino?.nombre || "Unknown Destination"}</Text>
        <Text style={styles.vacationDates}>
          {formatDate(vacationPlan?.fecha_inicio)} - {formatDate(vacationPlan?.fecha_fin)}
        </Text>

        {totalDays > 0 && (
          <View style={styles.dayIndicator}>
            <Text style={styles.dayIndicatorText}>
              Day {currentDay} of {totalDays}
            </Text>
          </View>
        )}
      </View>

      {/* Add date selector */}
      <View style={styles.dateSelector}>
        <Text style={styles.dateSelectorLabel}>Select Day:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSelectorContent}
        >
          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                selectedDate && date.toDateString() === selectedDate.toDateString() && styles.dateButtonSelected,
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text
                style={[
                  styles.dateButtonDay,
                  selectedDate && date.toDateString() === selectedDate.toDateString() && styles.dateButtonTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
              <Text
                style={[
                  styles.dateButtonMonth,
                  selectedDate && date.toDateString() === selectedDate.toDateString() && styles.dateButtonTextSelected,
                ]}
              >
                {date.toLocaleString("default", { month: "short" })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {Object.keys(activities).length > 0 ? (
          Object.keys(activities)
            .sort()
            .map((date) => (
              <View key={date} style={styles.dayContainer}>
                <Text style={styles.dayHeader}>{formatDate(date)}</Text>
                <View style={styles.timelineContainer}>
                  {activities[date].map((activity, index) =>
                    renderTimelineItem(activity, index, index === activities[date].length - 1),
                  )}
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#ddd" />
            <Text style={styles.emptyText}>No activities planned yet</Text>
            <Text style={styles.emptySubtext}>Add activities to your vacation to see them here</Text>
          </View>
        )}
      </ScrollView>

      {!isEditing && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddActivity}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Remove Activity</Text>
            <Text style={styles.modalText}>Are you sure you want to remove this activity from your vacation?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDeleteActivity}>
                <Text style={styles.deleteButtonText}>Remove</Text>
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
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  errorButton: {
    backgroundColor: "#cf3a23",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
  editToggleButton: {
    padding: 8,
  },
  vacationHeader: {
    padding: 16,
    backgroundColor: "#cf3a23",
  },
  vacationTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  vacationDates: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  content: {
    flex: 1,
  },
  dayContainer: {
    marginBottom: 24,
  },
  dayHeader: {
    fontSize: 18,
    fontWeight: "bold",
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  timelineContainer: {
    paddingLeft: 16,
  },
  timelineItem: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  timelineLine: {
    width: 24,
    alignItems: "center",
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#cf3a23",
    marginTop: 4,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: "#e0e0e0",
    marginTop: 4,
    marginLeft: 5,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingRight: 16,
  },
  timelineHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#cf3a23",
    marginRight: 8,
    width: 50,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  timelineDetails: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#cf3a23",
  },
  timelineType: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineTypeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  timelineLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineLocationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  timelineNotes: {
    fontSize: 14,
    color: "#333",
    marginTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#cf3a23",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "80%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "500",
  },
  dayIndicator: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  dayIndicatorText: {
    color: "white",
    fontWeight: "bold",
  },
  dateSelector: {
    backgroundColor: "white",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  dateSelectorLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dateSelectorContent: {
    paddingVertical: 4,
  },
  dateButton: {
    width: 60,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    padding: 8,
  },
  dateButtonSelected: {
    backgroundColor: "#cf3a23",
  },
  dateButtonDay: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateButtonMonth: {
    fontSize: 12,
    marginTop: 4,
  },
  dateButtonTextSelected: {
    color: "white",
  },
})
