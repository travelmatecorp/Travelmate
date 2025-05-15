"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

// Types
// Añadir esta interfaz para las fechas marcadas
interface MarkedDateRange {
  startDate: Date
  endDate: Date
  color: string
}

// Modificar la definición de props para incluir markedDates
interface CalendarProps {
  selectedStartDate?: Date | null
  selectedEndDate?: Date | null
  onDateSelect?: (date: Date) => void
  selectedStartDate?: Date | null
  selectedEndDate?: Date | null
  highlightedDates?: Date[]
  minDate?: Date
  maxDate?: Date
  onMonthChange?: (month: number, year: number) => void
  fullScreenMode?: boolean
  markedDates?: MarkedDateRange[]
}

interface Day {
  date: Date | null
  day: number | null
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  isInRange: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
}

const Calendar: React.FC<CalendarProps> = ({
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  highlightedDates = [],
  minDate,
  maxDate,
  onMonthChange,
  fullScreenMode = false,
  markedDates,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [calendarDays, setCalendarDays] = useState<Day[]>([])
  const fadeAnim = useRef(new Animated.Value(1)).current
  const rangeHighlightAnim = useRef(new Animated.Value(0)).current

  // Month names
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // Day names
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const today = new Date()

  // Generate calendar days
  useEffect(() => {
    generateCalendarDays()
  }, [currentMonth, currentYear, selectedStartDate, selectedEndDate])

  // Animate range highlight when dates are selected
  useEffect(() => {
    if (selectedStartDate && selectedEndDate) {
      Animated.timing(rangeHighlightAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false, // We need to animate backgroundColor
      }).start()
    } else {
      rangeHighlightAnim.setValue(0)
    }
  }, [selectedStartDate, selectedEndDate])

  const generateCalendarDays = () => {
    const days: Day[] = []

    // First day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    const firstDayOfWeek = firstDayOfMonth.getDay()

    // Last day of the month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const daysInMonth = lastDayOfMonth.getDate()

    // Previous month days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate()

    // Add previous month days
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i)
      days.push({
        date,
        day: prevMonthLastDay - i,
        inMonth: false,
        isToday: isDateEqual(date, today),
        isSelected: isDateEqual(date, selectedStartDate) || isDateEqual(date, selectedEndDate),
        isInRange: isDateInRange(date),
        isRangeStart: isDateEqual(date, selectedStartDate),
        isRangeEnd: isDateEqual(date, selectedEndDate),
      })
    }

    // Add current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i)
      days.push({
        date,
        day: i,
        inMonth: true,
        isToday: isDateEqual(date, today),
        isSelected: isDateEqual(date, selectedStartDate) || isDateEqual(date, selectedEndDate),
        isInRange: isDateInRange(date),
        isRangeStart: isDateEqual(date, selectedStartDate),
        isRangeEnd: isDateEqual(date, selectedEndDate),
      })
    }

    // Add next month days to fill the calendar
    const remainingDays = 42 - days.length // 6 rows of 7 days
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(currentYear, currentMonth + 1, i)
      days.push({
        date,
        day: i,
        inMonth: false,
        isToday: false,
        isSelected: isDateEqual(date, selectedStartDate) || isDateEqual(date, selectedEndDate),
        isInRange: isDateInRange(date),
        isRangeStart: isDateEqual(date, selectedStartDate),
        isRangeEnd: isDateEqual(date, selectedEndDate),
      })
    }

    setCalendarDays(days)
  }

  // Helper function to check if two dates are the same day
  const isDateEqual = (date1: Date | null, date2: Date | null): boolean => {
    if (!date1 || !date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  // Helper function to check if a date is in the selected range
  const isDateInRange = (date: Date): boolean => {
    // Verificar si la fecha está en el rango seleccionado
    if (selectedStartDate && selectedEndDate) {
      return date >= selectedStartDate && date <= selectedEndDate
    }

    // Verificar si la fecha está en alguno de los rangos marcados
    if (markedDates && markedDates.length > 0) {
      return markedDates.some((range) => date >= range.startDate && date <= range.endDate)
    }

    return false
  }

  // Navigate to previous month
  const goToPreviousMonth = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()

    let newMonth = currentMonth - 1
    let newYear = currentYear

    if (newMonth < 0) {
      newMonth = 11
      newYear -= 1
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)

    if (onMonthChange) {
      onMonthChange(newMonth, newYear)
    }
  }

  // Navigate to next month
  const goToNextMonth = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start()

    let newMonth = currentMonth + 1
    let newYear = currentYear

    if (newMonth > 11) {
      newMonth = 0
      newYear += 1
    }

    setCurrentMonth(newMonth)
    setCurrentYear(newYear)

    if (onMonthChange) {
      onMonthChange(newMonth, newYear)
    }
  }

  // Handle date selection
  const handleDateSelect = (day: Day) => {
    if (!day.date) return

    // Check if date is selectable
    if (minDate && day.date < minDate) return
    if (maxDate && day.date > maxDate) return

    if (onDateSelect) {
      onDateSelect(day.date)
    }
  }

  // Modificar la función que determina el color de fondo de una fecha
  const getDateBackgroundColor = (date: Date) => {
    if (selectedStartDate && date.toDateString() === selectedStartDate.toDateString()) {
      return "#cf3a23" // Color para fecha de inicio
    }

    if (selectedEndDate && date.toDateString() === selectedEndDate.toDateString()) {
      return "#cf3a23" // Color para fecha de fin
    }

    if (isDateInRange(date)) {
      // Si está en el rango seleccionado
      if (selectedStartDate && selectedEndDate) {
        return "rgba(207, 58, 35, 0.2)" // Color para fechas en el rango seleccionado
      }

      // Si está en alguno de los rangos marcados
      if (markedDates && markedDates.length > 0) {
        const matchingRange = markedDates.find((range) => date >= range.startDate && date <= range.endDate)
        if (matchingRange) {
          return `${matchingRange.color}40` // Añadir transparencia al color
        }
      }
    }

    return "transparent"
  }

  // Modificar la función que determina el color del texto de una fecha
  const getDateTextColor = (date: Date) => {
    if (
      (selectedStartDate && date.toDateString() === selectedStartDate.toDateString()) ||
      (selectedEndDate && date.toDateString() === selectedEndDate.toDateString())
    ) {
      return "white"
    }

    // Si la fecha está en el mes actual
    if (date.getMonth() === currentMonth) {
      // Si es hoy
      if (date.toDateString() === today.toDateString()) {
        return "#cf3a23"
      }

      // Si está en alguno de los rangos marcados
      if (markedDates && markedDates.length > 0) {
        const isInMarkedRange = markedDates.some((range) => date >= range.startDate && date <= range.endDate)
        if (isInMarkedRange) {
          return "#333" // Color más oscuro para fechas marcadas
        }
      }

      return "#333" // Color normal para fechas del mes actual
    }

    return "#aaa" // Color para fechas de otros meses
  }

  // Render day cell
  const renderDay = (day: Day, index: number) => {
    const dayStyles = [styles.dayCell]
    const textStyles = [styles.dayText]
    const rangeBackgroundStyles = [styles.rangeBackground]

    if (!day.inMonth) {
      dayStyles.push(styles.outOfMonthDay)
      textStyles.push(styles.outOfMonthDayText)
    }

    if (day.isToday) {
      dayStyles.push(styles.today)
      textStyles.push(styles.todayText)
    }

    if (day.isSelected) {
      dayStyles.push(styles.selectedDay)
      textStyles.push(styles.selectedDayText)
    }

    if (day.isInRange && !day.isSelected) {
      rangeBackgroundStyles.push(styles.inRangeDay)
    }

    if (day.isRangeStart) {
      rangeBackgroundStyles.push(styles.rangeStartDay)
    }

    if (day.isRangeEnd) {
      rangeBackgroundStyles.push(styles.rangeEndDay)
    }

    // Determine if this day is disabled
    const isDisabled =
      (minDate && day.date && day.date < minDate) || (maxDate && day.date && day.date > maxDate) || !day.inMonth

    return (
      <TouchableOpacity
        key={index}
        style={dayStyles}
        onPress={() => handleDateSelect(day)}
        disabled={isDisabled}
        activeOpacity={0.7}
      >
        {day.isInRange && (
          <Animated.View
            style={[
              rangeBackgroundStyles,
              {
                opacity: rangeHighlightAnim,
                backgroundColor: rangeHighlightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["rgba(207, 58, 35, 0)", getDateBackgroundColor(day.date)],
                }),
              },
            ]}
          />
        )}
        <Text style={[textStyles, { color: getDateTextColor(day.date) }]}>{day.day}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, fullScreenMode && styles.fullScreenContainer]}>
      {/* Calendar header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{`${monthNames[currentMonth]} ${currentYear}`}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Weekday names */}
      <View style={styles.weekdayRow}>
        {dayNames.map((day, index) => (
          <Text key={index} style={styles.weekdayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar grid */}
      <Animated.View style={[styles.calendarGrid, { opacity: fadeAnim }]}>
        {calendarDays.map((day, index) => renderDay(day, index))}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fullScreenContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  navButton: {
    padding: 8,
  },
  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  weekdayText: {
    width: width / 7 - 10,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: width / 7 - 10,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
    borderRadius: 20,
    position: "relative",
  },
  dayText: {
    fontSize: 14,
    color: "#333",
    zIndex: 2,
  },
  outOfMonthDay: {
    opacity: 0.3,
  },
  outOfMonthDayText: {
    color: "#999",
  },
  today: {
    backgroundColor: "#f0f0f0",
  },
  todayText: {
    fontWeight: "bold",
  },
  selectedDay: {
    backgroundColor: "#cf3a23",
  },
  selectedDayText: {
    color: "white",
    fontWeight: "bold",
  },
  rangeBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    zIndex: 1,
  },
  inRangeDay: {
    backgroundColor: "rgba(207, 58, 35, 0.2)",
  },
  rangeStartDay: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  rangeEndDay: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
})

export default Calendar
