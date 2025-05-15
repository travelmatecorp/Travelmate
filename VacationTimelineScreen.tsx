"use client"

import { useState, useEffect } from "react"
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { getVacationActivities, deleteVacationActivity, formatDate } from "./api"
import { useVacation } from "./context/VacationContext"

export default function VacationTimelineScreen({ onNavigate, auth, route }) {
  const { setSelectedDestination, vacationPlan: contextVacationPlan } = useVacation()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [vacationPlan, setVacationPlan] = useState(contextVacationPlan || null)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [vacationStarted, setVacationStarted] = useState(false)
  const [viewMode, setViewMode] = useState("list") // "list" o "calendar"
  const [showAllDays, setShowAllDays] = useState(true) // Mostrar todos los días por defecto

  const [currentDay, setCurrentDay] = useState(1)
  const [totalDays, setTotalDays] = useState(0)
  const [selectedDate, setSelectedDate] = useState(null)
  const [availableDates, setAvailableDates] = useState([])

  useEffect(() => {
    const loadPlanAndActivities = () => {
      const planId = route?.params?.planId
      const planFromParams = route?.params?.plan || {}
      const planFromContext = contextVacationPlan
      console.log("route?.params:", route?.params)
      console.log("planId:", route?.params?.planId)
      if (!planId) {
        setLoading(false)
        Alert.alert("Error", "No vacation plan provided")
        return
      }

      // Determinar el plan más completo disponible
      let finalPlan = planFromParams
      if ((!planFromParams.fecha_inicio || !planFromParams.fecha_fin) && planFromContext?.id === planId) {
        finalPlan = planFromContext
      }

      // Asegurar que el plan tenga fechas válidas
      if (finalPlan.fecha_inicio && finalPlan.fecha_fin) {
        setVacationPlan(finalPlan)
        fetchActivities(planId)

        // Verificar si las vacaciones ya comenzaron
        const today = new Date()
        const startDate = new Date(finalPlan.fecha_inicio)
        setVacationStarted(today >= startDate)
      } else {
        console.warn("Plan data is incomplete")
        Alert.alert("Error", "Vacation plan data is incomplete")
      }

      setLoading(false)
    }

    loadPlanAndActivities()
  }, [route?.params?.planId, contextVacationPlan, route?.params?.plan])

  useEffect(() => {
    if (vacationPlan) {
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
        setSelectedDestination(vacationPlan.destino)
      }
    }
  }, [vacationPlan, setSelectedDestination])

  const fetchActivities = async (planId) => {
    try {
      setLoading(true)
      const activitiesData = await getVacationActivities({ plan_id: planId })

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
    const startDate = new Date(vacationPlan.fecha_inicio)
    const endDate = new Date(vacationPlan.fecha_fin)

    activitiesData.forEach((activity) => {
      const activityDate = new Date(activity.fecha)

      // Omitir si la actividad está fuera del rango del plan
      if (activityDate < startDate || activityDate > endDate) return

      const dateKey = activityDate.toISOString().split("T")[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(activity)
    })

    // Ordenar actividades por hora
    Object.keys(grouped).forEach((date) => {
      grouped[date].sort((a, b) => {
        if (!a.hora_inicio || !b.hora_inicio) return 0
        return new Date(`${a.fecha}T${a.hora_inicio}`) - new Date(`${b.fecha}T${b.hora_inicio}`)
      })
    })

    return grouped
  }

  // Función para generar slots de tiempo dinámicos basados en las actividades del día
  const generateDynamicTimeSlots = (dateKey) => {
    if (!activities[dateKey]) return []

    // Recopilar todas las horas de inicio y fin
    const timePoints = []
    activities[dateKey].forEach((activity) => {
      if (activity.hora_inicio) {
        const [hour, minute] = activity.hora_inicio.split(":").map(Number)
        timePoints.push(hour * 60 + minute)
      }
      if (activity.hora_fin) {
        const [hour, minute] = activity.hora_fin.split(":").map(Number)
        timePoints.push(hour * 60 + minute)
      }
    })

    // Si no hay horas específicas, usar horas estándar
    if (timePoints.length === 0) {
      return generateStandardTimeSlots()
    }

    // Ordenar y eliminar duplicados
    const uniqueTimePoints = [...new Set(timePoints)].sort((a, b) => a - b)

    // Asegurar que tenemos al menos horas completas
    for (let i = 0; i < 24; i++) {
      uniqueTimePoints.push(i * 60)
    }

    // Ordenar y eliminar duplicados nuevamente
    const finalTimePoints = [...new Set(uniqueTimePoints)].sort((a, b) => a - b)

    // Convertir minutos a formato de hora
    return finalTimePoints.map((minutes) => {
      const hour = Math.floor(minutes / 60)
      const minute = minutes % 60
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    })
  }

  // Función para generar slots de tiempo estándar (cada hora)
  const generateStandardTimeSlots = () => {
    const hours = []
    for (let i = 0; i < 24; i++) {
      const hour = i < 10 ? `0${i}:00` : `${i}:00`
      hours.push(hour)
    }
    return hours
  }

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setShowAllDays(false) // Al seleccionar un día específico, desactivamos "Ver todos"
    const startDate = new Date(vacationPlan.fecha_inicio)
    const dayDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1
    setCurrentDay(dayDiff)
  }

  const handleShowAllDays = () => {
    setShowAllDays(true)
  }

  const handleAddActivity = () => {
    // Navigate to map screen to select a place
    onNavigate("main", {
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
      fetchActivities(vacationPlan.id)
      setShowDeleteModal(false)
      setSelectedActivity(null)

      Alert.alert("Success", "Activity removed from your vacation")
    } catch (error) {
      console.error("Error deleting activity:", error)
      Alert.alert("Error", "Failed to remove activity")
    }
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === "list" ? "calendar" : "list")
  }

  // Obtener color según el tipo de actividad
  const getActivityColor = (type) => {
    switch (type) {
      case "alojamiento":
        return "#4285F4" // Azul de Google
      case "restaurante":
        return "#0F9D58" // Verde de Google
      case "excursion":
        return "#F4B400" // Amarillo de Google
      case "auto":
        return "#DB4437" // Rojo de Google
      case "transporte":
        return "#673AB7" // Morado
      case "evento":
        return "#FF5722" // Naranja
      default:
        return "#7986CB" // Azul grisáceo
    }
  }

  // Renderizar un elemento de la línea de tiempo (vista de lista)
  const renderTimelineItem = (activity, index, isLast) => {
    const isAccommodation = activity.lugar?.tipo === "alojamiento"
    const canEdit = !vacationStarted || !isAccommodation
    const activityColor = getActivityColor(activity.lugar?.tipo)

    return (
      <View key={activity.id} style={styles.timelineItem}>
        <View style={styles.timelineLine}>
          <View style={[styles.timelineDot, { backgroundColor: activityColor }]} />
          {!isLast && <View style={styles.timelineConnector} />}
        </View>

        <View style={styles.timelineContent}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.timelineTime, { color: activityColor }]}>
              {activity.hora_inicio ? activity.hora_inicio.substring(0, 5) : "Todo el día"}
              {activity.hora_fin ? ` - ${activity.hora_fin.substring(0, 5)}` : ""}
            </Text>
            <Text style={styles.timelineTitle}>{activity.lugar?.nombre || "Lugar desconocido"}</Text>

            {isEditing && canEdit && (
              <TouchableOpacity style={styles.editButton} onPress={() => handleEditActivity(activity)}>
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.timelineDetails, { borderLeftColor: activityColor }]}>
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
                  ? "Alojamiento"
                  : activity.lugar?.tipo === "restaurante"
                    ? "Restaurante"
                    : activity.lugar?.tipo === "excursion"
                      ? "Excursión"
                      : activity.lugar?.tipo === "auto"
                        ? "Alquiler de auto"
                        : "Otro"}
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

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate("calendar")} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Itinerario de Vacaciones</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={toggleViewMode} style={styles.viewModeButton}>
            <Ionicons name={viewMode === "list" ? "calendar-outline" : "list-outline"} size={24} color="#cf3a23" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editToggleButton}>
            <Ionicons name={isEditing ? "checkmark" : "pencil"} size={24} color="#cf3a23" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.vacationHeader}>
        <Text style={styles.vacationTitle}>{vacationPlan?.destino?.nombre || "Mis Vacaciones"}</Text>
        <Text style={styles.vacationDates}>
          {vacationPlan?.fecha_inicio ? formatDate(vacationPlan.fecha_inicio) : ""} -{" "}
          {vacationPlan?.fecha_fin ? formatDate(vacationPlan.fecha_fin) : ""}
        </Text>

        {totalDays > 0 && (
          <View style={styles.dayIndicator}>
            <Text style={styles.dayIndicatorText}>
              {showAllDays ? `${totalDays} días de vacaciones` : `Día ${currentDay} de ${totalDays}`}
            </Text>
          </View>
        )}
      </View>

      {/* Add date selector with "All Days" button */}
      <View style={styles.dateSelector}>
        <Text style={styles.dateSelectorLabel}>Seleccionar día:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateSelectorContent}
        >
          <TouchableOpacity
            style={[styles.dateButton, styles.allDaysButton, showAllDays && styles.dateButtonSelected]}
            onPress={handleShowAllDays}
          >
            <Text style={[styles.allDaysButtonText, showAllDays && styles.dateButtonTextSelected]}>Todos</Text>
          </TouchableOpacity>

          {availableDates.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dateButton,
                !showAllDays &&
                  selectedDate &&
                  date.toDateString() === selectedDate.toDateString() &&
                  styles.dateButtonSelected,
              ]}
              onPress={() => handleDateSelect(date)}
            >
              <Text
                style={[
                  styles.dateButtonDay,
                  !showAllDays &&
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString() &&
                    styles.dateButtonTextSelected,
                ]}
              >
                {date.getDate()}
              </Text>
              <Text
                style={[
                  styles.dateButtonMonth,
                  !showAllDays &&
                    selectedDate &&
                    date.toDateString() === selectedDate.toDateString() &&
                    styles.dateButtonTextSelected,
                ]}
              >
                {date.toLocaleString("default", { month: "short" })}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {/* Vista de lista (predeterminada) */}
        {viewMode === "list" && (
          <View>
            {/* Si showAllDays es true, mostrar todas las fechas */}
            {showAllDays
              ? Object.keys(activities)
                  .sort()
                  .map((date) => (
                    <View key={date} style={styles.dayContainer}>
                      <Text style={styles.dayHeader}>{formatDate(date)}</Text>
                      <View style={styles.timelineContainer}>
                        {activities[date].length > 0 ? (
                          activities[date].map((activity, index) =>
                            renderTimelineItem(activity, index, index === activities[date].length - 1),
                          )
                        ) : (
                          <View style={styles.emptyDayContainer}>
                            <Text style={styles.emptyDayText}>No hay actividades planificadas para este día</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
              : // Si showAllDays es false, mostrar solo la fecha seleccionada
                selectedDate &&
                Object.keys(activities)
                  .filter((date) => new Date(date).toDateString() === selectedDate.toDateString())
                  .map((date) => (
                    <View key={date} style={styles.dayContainer}>
                      <Text style={styles.dayHeader}>{formatDate(date)}</Text>
                      <View style={styles.timelineContainer}>
                        {activities[date].length > 0 ? (
                          activities[date].map((activity, index) =>
                            renderTimelineItem(activity, index, index === activities[date].length - 1),
                          )
                        ) : (
                          <View style={styles.emptyDayContainer}>
                            <Text style={styles.emptyDayText}>No hay actividades planificadas para este día</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))}

            {/* Mensaje si no hay actividades */}
            {(showAllDays && Object.keys(activities).length === 0) ||
            (!showAllDays &&
              selectedDate &&
              !Object.keys(activities).some(
                (date) => new Date(date).toDateString() === selectedDate.toDateString(),
              )) ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={64} color="#ddd" />
                <Text style={styles.emptyText}>No hay actividades planificadas</Text>
                <Text style={styles.emptySubtext}>Agrega actividades a tus vacaciones para verlas aquí</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Vista de calendario */}
        {viewMode === "calendar" && selectedDate && !showAllDays && (
          <View style={styles.calendarContainer}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineHeaderText}>{formatDate(selectedDate)}</Text>
            </View>

            <View style={styles.calendarGrid}>
              <View style={styles.timeColumn}>
                {generateDynamicTimeSlots(selectedDate.toISOString().split("T")[0]).map((time) => (
                  <View key={time} style={styles.hourSlot}>
                    <Text style={styles.hourText}>{time}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.eventsColumn}>
                {generateDynamicTimeSlots(selectedDate.toISOString().split("T")[0]).map((time) => (
                  <View key={time} style={styles.eventSlot} />
                ))}

                {selectedDate &&
                  Object.keys(activities)
                    .filter((date) => new Date(date).toDateString() === selectedDate.toDateString())
                    .map((date) =>
                      activities[date].map((activity, index) => {
                        // Calcular posición y altura basada en hora_inicio y hora_fin
                        const startTime = activity.hora_inicio ? activity.hora_inicio : "00:00"
                        const endTime = activity.hora_fin
                          ? activity.hora_fin
                          : activity.hora_inicio
                            ? `${Number.parseInt(activity.hora_inicio.split(":")[0]) + 1}:${
                                activity.hora_inicio.split(":")[1]
                              }`
                            : "01:00"

                        const [startHour, startMinute] = startTime.split(":").map(Number)
                        const [endHour, endMinute] = endTime.split(":").map(Number)

                        const startPosition = startHour * 60 + startMinute
                        const endPosition = endHour * 60 + endMinute
                        const duration = endPosition - startPosition

                        // Convertir minutos a altura en píxeles (60 minutos = altura de hourSlot)
                        const hourSlotHeight = 60 // Altura en píxeles de cada slot de hora
                        const top = (startPosition / 60) * hourSlotHeight
                        const height = Math.max((duration / 60) * hourSlotHeight, 30) // Mínimo 30px de altura

                        const backgroundColor = getActivityColor(activity.lugar?.tipo)

                        return (
                          <TouchableOpacity
                            key={activity.id}
                            style={[
                              styles.eventItem,
                              {
                                top,
                                height,
                                backgroundColor,
                              },
                            ]}
                            onLongPress={() => isEditing && handleEditActivity(activity)}
                          >
                            <Text style={styles.eventTime}>
                              {activity.hora_inicio ? activity.hora_inicio.substring(0, 5) : "Todo el día"}
                              {activity.hora_fin ? ` - ${activity.hora_fin.substring(0, 5)}` : ""}
                            </Text>
                            <Text style={styles.eventTitle} numberOfLines={1}>
                              {activity.lugar?.nombre || "Lugar desconocido"}
                            </Text>
                            {activity.lugar?.ubicacion && (
                              <Text style={styles.eventLocation} numberOfLines={1}>
                                <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.8)" />
                                {" " + activity.lugar.ubicacion}
                              </Text>
                            )}
                          </TouchableOpacity>
                        )
                      }),
                    )}
              </View>
            </View>
          </View>
        )}

        {/* Mensaje para vista de calendario cuando se selecciona "Todos los días" */}
        {viewMode === "calendar" && showAllDays && (
          <View style={styles.calendarAllDaysMessage}>
            <Ionicons name="information-circle-outline" size={32} color="#666" />
            <Text style={styles.calendarAllDaysText}>Selecciona un día específico para ver la vista de calendario</Text>
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
            <Text style={styles.modalTitle}>Eliminar Actividad</Text>
            <Text style={styles.modalText}>¿Estás seguro de que deseas eliminar esta actividad de tus vacaciones?</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={handleDeleteActivity}>
                <Text style={styles.deleteButtonText}>Eliminar</Text>
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
  headerButtons: {
    flexDirection: "row",
  },
  viewModeButton: {
    padding: 8,
    marginRight: 8,
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
    width: 80,
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
  emptyDayContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyDayText: {
    fontSize: 14,
    color: "#999",
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
  allDaysButton: {
    backgroundColor: "#f0f0f0",
  },
  allDaysButtonText: {
    fontSize: 16,
    fontWeight: "bold",
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
  calendarContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  timelineHeader: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  timelineHeaderText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  calendarGrid: {
    flexDirection: "row",
    flex: 1,
  },
  timeColumn: {
    width: 60,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  hourSlot: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingRight: 8,
  },
  hourText: {
    fontSize: 12,
    color: "#666",
  },
  eventsColumn: {
    flex: 1,
    position: "relative",
  },
  eventSlot: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  eventItem: {
    position: "absolute",
    left: 4,
    right: 4,
    borderRadius: 4,
    padding: 8,
    overflow: "hidden",
  },
  eventTime: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  eventLocation: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  calendarAllDaysMessage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  calendarAllDaysText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
})
