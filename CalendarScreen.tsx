"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import Calendar from "./components/Calendar"
import BottomNavigation from "./components/BottomNavigation"
import { useVacation } from "./context/VacationContext"
import { getVacationPlans, createVacationPlan, confirmVacationPlan, deleteVacationPlan } from "./api"

const CalendarScreen = ({ onNavigate, auth }) => {
  const {
    selectedDestination,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isCreatingVacation,
    setIsCreatingVacation,
    setVacationPlan,
    vacationPlan,
    reservations,
  } = useVacation()

  const [isLoading, setIsLoading] = useState(false)
  const [vacationPlans, setVacationPlans] = useState([])
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: start date, 2: end date, 3: confirm
  const [dateSelectionMode, setDateSelectionMode] = useState("start") // 'start' or 'end'
  const [rangeHighlightAnim] = useState(new Animated.Value(0))
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [confirmModalVisible, setConfirmModalVisible] = useState(false)
  const [planToConfirm, setPlanToConfirm] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [planToDelete, setPlanToDelete] = useState(null)

  // Debug logging
  useEffect(() => {
    console.log("CalendarScreen mounted")
  }, [])

  // Fetch vacation plans on component mount
  useEffect(() => {
    if (auth?.isLoggedIn) {
      fetchVacationPlans()
    }
  }, [auth?.isLoggedIn])

  // Reset state when destination changes
  useEffect(() => {
    if (selectedDestination) {
      setIsCreatingVacation(true)
      setStartDate(null)
      setEndDate(null)
      setCurrentStep(1)
      setDateSelectionMode("start")
      setShowCalendarModal(true)
    }
  }, [selectedDestination])

  // Animate range highlight when dates are selected
  useEffect(() => {
    if (startDate && endDate) {
      Animated.timing(rangeHighlightAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    } else {
      rangeHighlightAnim.setValue(0)
    }
  }, [startDate, endDate])

  // Fix for onScroll error - ensure we pass a function, not an object
  const handleScroll = (event) => {
    // You can add scroll handling logic here if needed
  }

  const fetchVacationPlans = async () => {
    try {
      setIsLoading(true)
      console.log("Fetching vacation plans for user:", auth?.user?.id)
      const plans = await getVacationPlans(auth?.user?.id)
      console.log(`Fetched ${plans.length} vacation plans:`, plans)
      setVacationPlans(plans)
    } catch (error) {
      console.error("Error fetching vacation plans:", error)
      Alert.alert("Error", "Failed to fetch vacation plans. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateVacation = () => {
    if (!auth?.isLoggedIn) {
      Alert.alert("Login Required", "Please log in to create a vacation plan.", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => onNavigate("login") },
      ])
      return
    }

    setShowCalendarModal(true)
    setDateSelectionMode("start")
    setCurrentStep(1)
    setStartDate(null)
    setEndDate(null)
  }

  const handleDateSelect = (date) => {
    if (dateSelectionMode === "start") {
      setStartDate(date)
      setDateSelectionMode("end")
      setCurrentStep(2)
    } else {
      // Ensure end date is not before start date
      if (startDate && date < startDate) {
        Alert.alert("Invalid Date", "End date cannot be before start date.")
        return
      }

      setEndDate(date)
      setCurrentStep(3)

      // Animate the date range on the calendar
      Animated.timing(rangeHighlightAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()

      // After a short delay, proceed to confirmation
      setTimeout(() => {
        setShowCalendarModal(false)
        setShowConfirmationModal(true)
      }, 800)
    }
  }

  const handleCreateNewVacation = async () => {
    if (!selectedDestination || !startDate || !endDate) {
      Alert.alert("Missing Information", "Please select destination and dates.")
      return
    }

    if (!auth?.user?.id) {
      Alert.alert("Login Required", "Please log in to create a vacation plan.")
      return
    }

    try {
      setIsLoading(true)

      const vacationData = {
        destino_id: selectedDestination.id,
        usuario_id: auth.user.id,
        fecha_inicio: startDate.toISOString().split("T")[0],
        fecha_fin: endDate.toISOString().split("T")[0],
      }

      console.log("Creating vacation plan with data:", vacationData)
      const newVacation = await createVacationPlan(vacationData)
      console.log("Created vacation plan:", newVacation)

      // Update local state
      setVacationPlan({
        id: newVacation.id,
        destino: selectedDestination,
        fechaInicio: startDate,
        fechaFin: endDate,
        reservations: [],
        estado: "planificado",
      })

      setShowConfirmationModal(false)

      // Show success message and stay on calendar screen
      Alert.alert("Success", "Vacation plan created successfully!")

      // Refresh vacation plans
      fetchVacationPlans()
    } catch (error) {
      console.error("Error creating vacation plan:", error)
      Alert.alert("Error", "Failed to create vacation plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmExistingVacation = async (planId) => {
    try {
      setIsLoading(true)
      await confirmVacationPlan(planId)

      // Update local state
      const updatedPlans = vacationPlans.map((plan) => (plan.id === planId ? { ...plan, estado: "confirmado" } : plan))
      setVacationPlans(updatedPlans)

      // If this is the currently selected vacation plan, update it
      if (vacationPlan && vacationPlan.id === planId) {
        setVacationPlan({
          ...vacationPlan,
          estado: "confirmado",
        })
      }

      Alert.alert("Success", "Vacation plan confirmed!")
    } catch (error) {
      console.error("Error confirming vacation plan:", error)
      Alert.alert("Error", "Failed to confirm vacation plan. Please try again.")
    } finally {
      setIsLoading(false)
      setSelectedPlanId(null)
    }
  }

  const handleDeleteVacation = async () => {
    if (!planToDelete) return

    try {
      setIsLoading(true)
      await deleteVacationPlan(planToDelete.id)

      // Update local state by removing the deleted plan
      setVacationPlans(vacationPlans.filter((plan) => plan.id !== planToDelete.id))

      // If this is the currently selected vacation plan, clear it
      if (vacationPlan && vacationPlan.id === planToDelete.id) {
        setVacationPlan(null)
      }

      // Close modal and clear state
      setDeleteModalVisible(false)
      setPlanToDelete(null)

      // Show success message
      Alert.alert("Success", "Vacation plan deleted successfully!")
    } catch (error) {
      console.error("Error deleting vacation plan:", error)
      Alert.alert("Error", "Failed to delete vacation plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderCalendarModal = () => {
    return (
      <Modal
        visible={showCalendarModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <SafeAreaView style={styles.fullScreenModalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {dateSelectionMode === "start" ? "Select Start Date" : "Select End Date"}
            </Text>
            <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.destinationBanner}>
            <Ionicons name="location" size={20} color="#cf3a23" />
            <Text style={styles.destinationText}>
              Planning trip to: {selectedDestination?.nombre}, {selectedDestination?.pais}
            </Text>
          </View>

          <Calendar
            onDateSelect={handleDateSelect}
            selectedStartDate={startDate}
            selectedEndDate={endDate}
            minDate={new Date()}
            fullScreenMode={true}
          />

          <View style={styles.dateSelectionInfo}>
            {startDate && (
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Start Date:</Text>
                <Text style={styles.dateValue}>{startDate.toLocaleDateString()}</Text>
              </View>
            )}

            {endDate && (
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>End Date:</Text>
                <Text style={styles.dateValue}>{endDate.toLocaleDateString()}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  const renderConfirmationModal = () => {
    return (
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Vacation</Text>
              <TouchableOpacity onPress={() => setShowConfirmationModal(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryDropdown}>
              <View style={styles.summaryHeader}>
                <Ionicons name="calendar" size={24} color="#cf3a23" />
                <Text style={styles.summaryTitle}>Vacation Summary</Text>
              </View>

              <View style={styles.confirmationCard}>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Destination:</Text>
                  <Text style={styles.confirmationValue}>
                    {selectedDestination?.nombre}, {selectedDestination?.pais}
                  </Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Start Date:</Text>
                  <Text style={styles.confirmationValue}>{startDate?.toLocaleDateString()}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>End Date:</Text>
                  <Text style={styles.confirmationValue}>{endDate?.toLocaleDateString()}</Text>
                </View>
                <View style={styles.confirmationItem}>
                  <Text style={styles.confirmationLabel}>Duration:</Text>
                  <Text style={styles.confirmationValue}>
                    {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} days
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.confirmationText}>
              Ready to confirm your vacation to {selectedDestination?.nombre}?
            </Text>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.cancelButtonText}>No, Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.confirmButton} onPress={handleCreateNewVacation} disabled={isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Yes, Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  const renderPlanConfirmationModal = () => {
    const plan = vacationPlans.find((p) => p.id === selectedPlanId)

    if (!plan) return null

    return (
      <Modal
        visible={!!selectedPlanId}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedPlanId(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirm Vacation Plan</Text>
              <TouchableOpacity onPress={() => setSelectedPlanId(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmationText}>
              Are you sure you want to confirm your vacation to {plan.destino?.nombre}?
            </Text>

            <View style={styles.confirmationCard}>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Destination:</Text>
                <Text style={styles.confirmationValue}>
                  {plan.destino?.nombre}, {plan.destino?.pais}
                </Text>
              </View>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Start Date:</Text>
                <Text style={styles.confirmationValue}>{new Date(plan.fecha_inicio).toLocaleDateString()}</Text>
              </View>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>End Date:</Text>
                <Text style={styles.confirmationValue}>{new Date(plan.fecha_fin).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setSelectedPlanId(null)}
              >
                <Text style={styles.cancelButtonText}>No, Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => handleConfirmExistingVacation(plan.id)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Yes, Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  const renderDeleteConfirmationModal = () => {
    if (!planToDelete) return null

    return (
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setDeleteModalVisible(false)
          setPlanToDelete(null)
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete Vacation</Text>
              <TouchableOpacity
                onPress={() => {
                  setDeleteModalVisible(false)
                  setPlanToDelete(null)
                }}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.confirmationText}>
              Are you sure you want to delete your vacation to {planToDelete.destino?.nombre}? This action cannot be
              undone.
            </Text>

            <View style={styles.confirmationCard}>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Destination:</Text>
                <Text style={styles.confirmationValue}>
                  {planToDelete.destino?.nombre}, {planToDelete.destino?.pais}
                </Text>
              </View>
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Dates:</Text>
                <Text style={styles.confirmationValue}>
                  {new Date(planToDelete.fecha_inicio).toLocaleDateString()} -{" "}
                  {new Date(planToDelete.fecha_fin).toLocaleDateString()}
                </Text>
              </View>
            </View>

            <View style={styles.confirmationButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#666" }]}
                onPress={() => {
                  setDeleteModalVisible(false)
                  setPlanToDelete(null)
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: "#d32f2f" }]}
                onPress={handleDeleteVacation}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.confirmButtonText}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    )
  }

  const handleVacationConfirmation = async () => {
    if (!planToConfirm) return

    try {
      setIsLoading(true)
      await confirmVacationPlan(planToConfirm.id)

      // Update local state
      const updatedPlans = vacationPlans.map((plan) =>
        plan.id === planToConfirm.id ? { ...plan, estado: "confirmado" } : plan,
      )
      setVacationPlans(updatedPlans)

      // Close modal
      setConfirmModalVisible(false)
      setPlanToConfirm(null)

      // Show success message
      Alert.alert("Success", "Vacation plan confirmed successfully!")
    } catch (error) {
      console.error("Error confirming vacation plan:", error)
      Alert.alert("Error", "Failed to confirm vacation plan. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const renderVacationItem = (plan) => {
    const isPlanConfirmed = plan.estado === "confirmado"

    return (
      <View key={plan.id} style={styles.vacationPlanItem}>
        <TouchableOpacity
          style={styles.vacationPlanInfo}
          onPress={() => {
            // Navigate to vacation details
            setVacationPlan({
              id: plan.id,
              destino: plan.destino,
              fechaInicio: new Date(plan.fecha_inicio),
              fechaFin: new Date(plan.fecha_fin),
              estado: plan.estado,
            })
            onNavigate("main")
          }}
        >
          <Text style={styles.vacationPlanDestination}>{plan.destino?.nombre || "Unknown Destination"}</Text>
          <Text style={styles.vacationPlanDates}>
            {new Date(plan.fecha_inicio).toLocaleDateString()} - {new Date(plan.fecha_fin).toLocaleDateString()}
          </Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusIndicator, { backgroundColor: isPlanConfirmed ? "#4CAF50" : "#FFC107" }]} />
            <Text style={styles.statusText}>{isPlanConfirmed ? "Confirmed" : "Planned"}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.vacationPlanActions}>
          {plan.estado === "planificado" && (
            <TouchableOpacity
              style={styles.confirmPlanButton}
              onPress={() => {
                setPlanToConfirm(plan)
                setConfirmModalVisible(true)
              }}
            >
              <Text style={styles.confirmPlanButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.editPlanButton}
            onPress={() => {
              // Debug logging
              console.log("Timeline button clicked for plan:", plan)
              console.log("Plan ID:", plan.id)
              console.log("Plan destino:", plan.destino)

              // Make sure we have the complete plan data before navigating
              if (!plan || !plan.id) {
                console.error("Missing plan ID")
                Alert.alert("Error", "Cannot view timeline: Missing plan ID")
                return
              }

              // Set the vacation plan in context
              setVacationPlan({
                id: plan.id,
                destino: plan.destino,
                fechaInicio: new Date(plan.fecha_inicio),
                fechaFin: new Date(plan.fecha_fin),
                estado: plan.estado,
              })

              // Pass only the plan ID to the timeline screen
              // The VacationTimelineScreen will fetch the complete plan data
              onNavigate("vacationTimeline", {
                planId: plan.id,
              })
            }}
          >
            <Ionicons name="calendar-outline" size={18} color="#007bff" />
            <Text style={styles.editPlanButtonText}>Timeline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deletePlanButton}
            onPress={() => {
              setPlanToDelete(plan)
              setDeleteModalVisible(true)
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#d32f2f" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderReservationItem = (reservation) => {
    return (
      <TouchableOpacity
        key={reservation.id}
        style={styles.reservationItem}
        onPress={() => {
          // Navigate to reservation details
        }}
      >
        <View style={styles.reservationInfo}>
          <Text style={styles.reservationPlace}>{reservation.place.name}</Text>
          <Text style={styles.reservationDates}>
            {reservation.startDate.toLocaleDateString()} - {reservation.endDate.toLocaleDateString()}
          </Text>
          <View style={styles.reservationStatus}>
            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: reservation.status === "confirmed" ? "#4CAF50" : "#FFC107" },
              ]}
            />
            <Text style={styles.statusText}>
              {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <TouchableOpacity onPress={() => onNavigate("rewards")} style={styles.rewardsButton}>
          <Ionicons name="gift-outline" size={24} color="#cf3a23" />
        </TouchableOpacity>
      </View>

      {selectedDestination && (
        <View style={styles.destinationBanner}>
          <Ionicons name="location" size={20} color="#cf3a23" />
          <Text style={styles.destinationText}>You are planning in: {selectedDestination.nombre}</Text>
        </View>
      )}

      <ScrollView
        style={styles.content}
        onScroll={(event) => {
          // Handle scroll event properly
          const offsetY = event.nativeEvent.contentOffset.y
          // Your scroll handling logic here
        }}
        scrollEventThrottle={16}
      >
        <View style={styles.calendarContainer}>
          <Calendar selectedStartDate={startDate} selectedEndDate={endDate} />
        </View>

        <View style={styles.vacationsSection}>
          <Text style={styles.sectionTitle}>Your Vacations</Text>
          {isLoading ? (
            <ActivityIndicator size="small" color="#cf3a23" />
          ) : vacationPlans.length > 0 ? (
            vacationPlans.map(renderVacationItem)
          ) : (
            <Text style={styles.noVacationsText}>No vacations planned yet</Text>
          )}
        </View>

        {reservations.length > 0 && (
          <View style={styles.reservationsSection}>
            <Text style={styles.sectionTitle}>Your Reservations</Text>
            {reservations.map(renderReservationItem)}
          </View>
        )}

        {/* Add extra padding at the bottom */}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={styles.createVacationButton} onPress={handleCreateVacation}>
        <Text style={styles.createVacationButtonText}>Create Vacation</Text>
      </TouchableOpacity>

      {renderCalendarModal()}
      {renderConfirmationModal()}
      {renderPlanConfirmationModal()}
      {renderDeleteConfirmationModal()}

      {/* Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={confirmModalVisible}
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Vacation</Text>
            <Text style={styles.modalText}>Are you sure you want to confirm this vacation plan?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setConfirmModalVisible(false)
                  setPlanToConfirm(null)
                }}
              >
                <Text style={styles.cancelButtonText}>No, cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleVacationConfirmation}>
                <Text style={styles.confirmButtonText}>Yes, confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BottomNavigation currentScreen="calendar" onNavigate={onNavigate} auth={auth} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  rewardsButton: {
    padding: 8,
  },
  destinationBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(207, 58, 35, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  destinationText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#cf3a23",
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    margin: 16,
  },
  vacationsSection: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reservationsSection: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  vacationPlanItem: {
    flexDirection: "column",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  vacationPlanInfo: {
    flex: 1,
    marginBottom: 8,
  },
  vacationPlanDestination: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  vacationPlanDates: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  vacationPlanActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  confirmPlanButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  confirmPlanButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  editPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginRight: 8,
  },
  editPlanButtonText: {
    color: "#007bff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  deletePlanButton: {
    backgroundColor: "#ffebee",
    padding: 6,
    borderRadius: 4,
  },
  reservationItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reservationInfo: {
    flex: 1,
  },
  reservationPlace: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  reservationDates: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  reservationStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  noVacationsText: {
    textAlign: "center",
    color: "#999",
    paddingVertical: 20,
  },
  createVacationButton: {
    backgroundColor: "#cf3a23",
    borderRadius: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  createVacationButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  dateSelectionInfo: {
    marginTop: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  dateInfo: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateLabel: {
    width: 80,
    fontSize: 14,
    color: "#666",
  },
  dateValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  confirmationCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
  },
  confirmationItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  confirmationLabel: {
    width: 100,
    fontSize: 16,
    color: "#666",
  },
  confirmationValue: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  confirmationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    flex: 1,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    minWidth: "45%",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  summaryDropdown: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  confirmationText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
})

export default CalendarScreen
