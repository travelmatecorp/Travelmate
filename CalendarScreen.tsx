"use client"

import { useState } from "react"
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

// Mock calendar data
const currentDate = new Date()
const currentMonth = currentDate.getMonth()
const currentYear = currentDate.getFullYear()

// Mock trips data
const tripsData = [
  {
    id: "1",
    title: "Beach Vacation",
    location: "Cancun, Mexico",
    startDate: new Date(currentYear, currentMonth, 15),
    endDate: new Date(currentYear, currentMonth, 22),
    status: "upcoming",
    color: "#4285F4",
  },
  {
    id: "2",
    title: "Business Trip",
    location: "New York, USA",
    startDate: new Date(currentYear, currentMonth, 5),
    endDate: new Date(currentYear, currentMonth, 8),
    status: "completed",
    color: "#34A853",
  },
  {
    id: "3",
    title: "Mountain Retreat",
    location: "Aspen, Colorado",
    startDate: new Date(currentYear, currentMonth + 1, 10),
    endDate: new Date(currentYear, currentMonth + 1, 15),
    status: "upcoming",
    color: "#FBBC05",
  },
]

// Mock events data
const eventsData = [
  {
    id: "e1",
    title: "Hotel Check-in",
    location: "Hotel Trenquelauquen",
    date: new Date(currentYear, currentMonth, 15, 14, 0),
    type: "hotel",
    color: "#4285F4",
    tripId: "1",
  },
  {
    id: "e2",
    title: "Dinner Reservation",
    location: "Coastal Grill Restaurant",
    date: new Date(currentYear, currentMonth, 15, 19, 30),
    type: "restaurant",
    color: "#EA4335",
    tripId: "1",
  },
  {
    id: "e3",
    title: "Snorkeling Tour",
    location: "Coral Reef",
    date: new Date(currentYear, currentMonth, 16, 10, 0),
    type: "excursion",
    color: "#34A853",
    tripId: "1",
  },
  {
    id: "e4",
    title: "Business Meeting",
    location: "Corporate Office",
    date: new Date(currentYear, currentMonth, 6, 9, 0),
    type: "meeting",
    color: "#4285F4",
    tripId: "2",
  },
  {
    id: "e5",
    title: "Ski Lesson",
    location: "Snowmass Mountain",
    date: new Date(currentYear, currentMonth + 1, 11, 10, 0),
    type: "excursion",
    color: "#34A853",
    tripId: "3",
  },
]

// Helper functions
const getDaysInMonth = (month, year) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (month, year) => {
  return new Date(year, month, 1).getDay()
}

const formatDate = (date) => {
  const options = { weekday: "short", month: "short", day: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

const formatTime = (date) => {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
}

export default function CalendarScreen({ onNavigate, auth }) {
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedDate, setSelectedDate] = useState(currentDate)
  const [view, setView] = useState("month") // "month" or "agenda"

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear)
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear)

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: "", empty: true })
    }

    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(selectedYear, selectedMonth, i)

      // Check if there are events on this day
      const hasEvents = eventsData.some(
        (event) =>
          event.date.getDate() === i &&
          event.date.getMonth() === selectedMonth &&
          event.date.getFullYear() === selectedYear,
      )

      // Check if this day is part of a trip
      const isInTrip = tripsData.some((trip) => {
        const tripStartDate = trip.startDate
        const tripEndDate = trip.endDate
        return date >= tripStartDate && date <= tripEndDate
      })

      days.push({
        day: i,
        date,
        hasEvents,
        isInTrip,
        isToday:
          i === currentDate.getDate() &&
          selectedMonth === currentDate.getMonth() &&
          selectedYear === currentDate.getFullYear(),
        isSelected:
          i === selectedDate.getDate() &&
          selectedMonth === selectedDate.getMonth() &&
          selectedYear === selectedDate.getFullYear(),
      })
    }

    return days
  }

  // Get events for selected date
  const getEventsForSelectedDate = () => {
    return eventsData
      .filter(
        (event) =>
          event.date.getDate() === selectedDate.getDate() &&
          event.date.getMonth() === selectedDate.getMonth() &&
          event.date.getFullYear() === selectedDate.getFullYear(),
      )
      .sort((a, b) => a.date - b.date)
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
  }

  // Navigate to next month
  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
  }

  // Select a date
  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setView("agenda")
  }

  // Render calendar day
  const renderCalendarDay = ({ item, index }) => {
    if (item.empty) {
      return <View style={styles.emptyDay} />
    }

    return (
      <TouchableOpacity
        style={[styles.calendarDay, item.isToday && styles.today, item.isSelected && styles.selectedDay]}
        onPress={() => handleDateSelect(item.date)}
      >
        <Text
          style={[styles.calendarDayText, item.isToday && styles.todayText, item.isSelected && styles.selectedDayText]}
        >
          {item.day}
        </Text>
        {item.hasEvents && <View style={styles.eventDot} />}
        {item.isInTrip && <View style={styles.tripIndicator} />}
      </TouchableOpacity>
    )
  }

  // Render event item
  const renderEventItem = ({ item }) => (
    <TouchableOpacity style={styles.eventItem}>
      <View style={[styles.eventColorIndicator, { backgroundColor: item.color }]} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTime}>{formatTime(item.date)}</Text>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text style={styles.eventLocation}>{item.location}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  )

  // Render trip item
  const renderTripItem = ({ item }) => {
    const isActive =
      (selectedDate >= item.startDate && selectedDate <= item.endDate) ||
      (currentDate >= item.startDate && currentDate <= item.endDate)

    return (
      <TouchableOpacity style={[styles.tripItem, isActive && styles.activeTripItem]}>
        <View style={[styles.tripColorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.tripInfo}>
          <Text style={styles.tripTitle}>{item.title}</Text>
          <Text style={styles.tripLocation}>{item.location}</Text>
          <Text style={styles.tripDates}>
            {formatDate(item.startDate)} - {formatDate(item.endDate)}
          </Text>
        </View>
        <View style={styles.tripStatus}>
          <Text
            style={[
              styles.tripStatusText,
              item.status === "completed" ? styles.completedStatus : styles.upcomingStatus,
            ]}
          >
            {item.status === "completed" ? "Completed" : "Upcoming"}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  const calendarDays = generateCalendarDays()
  const eventsForSelectedDate = getEventsForSelectedDate()
  const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" })
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.viewToggleButton, view === "month" && styles.activeViewToggleButton]}
            onPress={() => setView("month")}
          >
            <Ionicons name="calendar" size={20} color={view === "month" ? "#cf3a23" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleButton, view === "agenda" && styles.activeViewToggleButton]}
            onPress={() => setView("agenda")}
          >
            <Ionicons name="list" size={20} color={view === "agenda" ? "#cf3a23" : "#666"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.monthSelector}>
        <TouchableOpacity onPress={goToPreviousMonth}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthYearText}>
          {monthName} {selectedYear}
        </Text>
        <TouchableOpacity onPress={goToNextMonth}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {view === "month" ? (
        <View style={styles.calendarContainer}>
          <View style={styles.weekdaysRow}>
            {weekdays.map((day, index) => (
              <Text key={index} style={styles.weekdayText}>
                {day}
              </Text>
            ))}
          </View>

          <FlatList
            data={calendarDays}
            renderItem={renderCalendarDay}
            keyExtractor={(item, index) => index.toString()}
            numColumns={7}
            scrollEnabled={false}
          />

          <View style={styles.tripsSection}>
            <Text style={styles.sectionTitle}>Your Trips</Text>
            <FlatList
              data={tripsData}
              renderItem={renderTripItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      ) : (
        <View style={styles.agendaContainer}>
          <View style={styles.selectedDateHeader}>
            <Text style={styles.selectedDateText}>{formatDate(selectedDate)}</Text>
          </View>

          {eventsForSelectedDate.length > 0 ? (
            <FlatList
              data={eventsForSelectedDate}
              renderItem={renderEventItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.eventsList}
            />
          ) : (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={80} color="#ddd" />
              <Text style={styles.noEventsText}>No events scheduled for this day</Text>
              <TouchableOpacity style={styles.addEventButton}>
                <Text style={styles.addEventButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Ionicons name="calendar" size={24} color="#cf3a23" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("rewards")}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("map")}>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("messages")}>
          <Feather name="message-square" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate(auth?.isLoggedIn ? "account" : "login")}>
          <Ionicons name="person-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
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
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    padding: 4,
  },
  viewToggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeViewToggleButton: {
    backgroundColor: "white",
  },
  monthSelector: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  calendarContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  weekdaysRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  weekdayText: {
    width: 40,
    textAlign: "center",
    fontSize: 14,
    color: "#666",
  },
  calendarDay: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  emptyDay: {
    width: 40,
    height: 40,
    margin: 2,
  },
  calendarDayText: {
    fontSize: 14,
  },
  today: {
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
  },
  todayText: {
    fontWeight: "bold",
  },
  selectedDay: {
    backgroundColor: "#cf3a23",
    borderRadius: 20,
  },
  selectedDayText: {
    color: "white",
    fontWeight: "bold",
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cf3a23",
    position: "absolute",
    bottom: 6,
  },
  tripIndicator: {
    width: 20,
    height: 3,
    backgroundColor: "#4285F4",
    position: "absolute",
    bottom: 2,
    borderRadius: 1.5,
  },
  tripsSection: {
    flex: 1,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tripItem: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeTripItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#4285F4",
  },
  tripColorIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 12,
    color: "#999",
  },
  tripStatus: {
    justifyContent: "center",
  },
  tripStatusText: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedStatus: {
    backgroundColor: "#E8F5E9",
    color: "#4CAF50",
  },
  upcomingStatus: {
    backgroundColor: "#E3F2FD",
    color: "#2196F3",
  },
  agendaContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  selectedDateHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  eventsList: {
    padding: 16,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  eventColorIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTime: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  eventLocation: {
    fontSize: 14,
    color: "#666",
  },
  noEventsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noEventsText: {
    fontSize: 16,
    color: "#999",
    marginTop: 16,
    marginBottom: 24,
  },
  addEventButton: {
    backgroundColor: "#cf3a23",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addEventButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
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
  activeNavItem: {
    borderRadius: 24,
  },
})

