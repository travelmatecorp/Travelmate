"use client"

import type React from "react"
import { createContext, useState, useContext, type ReactNode } from "react"

// Define the shape of our context state
interface Destination {
  id: number
  nombre: string
  pais: string
  descripcion?: string
  imagen_url?: string
  latitud: number
  longitud: number
  popularidad?: number
  destacado?: boolean
}

interface Place {
  id: string
  name: string
  type: string
  image?: string
  price?: string
  rating?: number
  description?: string
  cuisine?: string
  duration?: string
  latitude?: number
  longitude?: number
}

interface Reservation {
  id: string
  placeId: string
  place: Place
  startDate: Date
  endDate: Date
  status: "pending" | "confirmed" | "cancelled"
  createdAt: Date
}

interface VacationPlan {
  id?: number
  destino: Destination
  fechaInicio: Date
  fechaFin: Date
  actividades?: any[]
  reservations?: Reservation[]
}

interface VacationContextType {
  selectedDestination: Destination | null
  setSelectedDestination: (destination: Destination | null) => void
  vacationPlan: VacationPlan | null
  setVacationPlan: (plan: VacationPlan | null) => void
  isCreatingVacation: boolean
  setIsCreatingVacation: (isCreating: boolean) => void
  startDate: Date | null
  setStartDate: (date: Date | null) => void
  endDate: Date | null
  setEndDate: (date: Date | null) => void
  clearVacationData: () => void
  reservations: Reservation[]
  addReservation: (reservation: Reservation) => void
  removeReservation: (reservationId: string) => void
  selectedPlace: Place | null
  setSelectedPlace: (place: Place | null) => void
}

// Create the context with a default value
const VacationContext = createContext<VacationContextType>({
  selectedDestination: null,
  setSelectedDestination: () => {},
  vacationPlan: null,
  setVacationPlan: () => {},
  isCreatingVacation: false,
  setIsCreatingVacation: () => {},
  startDate: null,
  setStartDate: () => {},
  endDate: null,
  setEndDate: () => {},
  clearVacationData: () => {},
  reservations: [],
  addReservation: () => {},
  removeReservation: () => {},
  selectedPlace: null,
  setSelectedPlace: () => {},
})

// Create a provider component
export const VacationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null)
  const [vacationPlan, setVacationPlan] = useState<VacationPlan | null>(null)
  const [isCreatingVacation, setIsCreatingVacation] = useState(false)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  const clearVacationData = () => {
    setSelectedDestination(null)
    setVacationPlan(null)
    setStartDate(null)
    setEndDate(null)
    setIsCreatingVacation(false)
    setReservations([])
  }

  const addReservation = (reservation: Reservation) => {
    setReservations((prev) => [...prev, reservation])

    // Also add to vacation plan if it exists
    if (vacationPlan) {
      const updatedPlan = {
        ...vacationPlan,
        reservations: [...(vacationPlan.reservations || []), reservation],
      }
      setVacationPlan(updatedPlan)
    }
  }

  const removeReservation = (reservationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== reservationId))

    // Also remove from vacation plan if it exists
    if (vacationPlan && vacationPlan.reservations) {
      const updatedPlan = {
        ...vacationPlan,
        reservations: vacationPlan.reservations.filter((r) => r.id !== reservationId),
      }
      setVacationPlan(updatedPlan)
    }
  }

  return (
    <VacationContext.Provider
      value={{
        selectedDestination,
        setSelectedDestination,
        vacationPlan,
        setVacationPlan,
        isCreatingVacation,
        setIsCreatingVacation,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        clearVacationData,
        reservations,
        addReservation,
        removeReservation,
        selectedPlace,
        setSelectedPlace,
      }}
    >
      {children}
    </VacationContext.Provider>
  )
}

// Create a custom hook to use the vacation context
export const useVacation = () => useContext(VacationContext)
