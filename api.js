import axios from "axios"
import { storeData, getData, removeData } from "./storage"

const API_URL = process.env.API_URL || "http://172.16.1.94:3000"

export const api = axios.create({
  baseURL: API_URL,
})

// Add a request interceptor to include the token in requests
api.interceptors.request.use(
  async (config) => {
    const token = await getData("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Authentication functions
export const register = async (userData) => {
  try {
    const response = await api.post("/register", userData)
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Registration failed" }
  }
}

export const login = async (credentials) => {
  try {
    const response = await api.post("/login", credentials)
    
    // Store token and user data
    await storeData("token", response.data.token)
    await storeData("user", JSON.stringify(response.data.user))
    
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Login failed" }
  }
}

export const logout = async () => {
  try {
    await removeData("token")
    await removeData("user")
  } catch (error) {
    console.error("Logout error:", error)
  }
}

export const getProfile = async () => {
  try {
    const response = await api.get("/profile")
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch profile" }
  }
}

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/profile", profileData)
    
    // Update stored user data
    await storeData("user", JSON.stringify(response.data))
    
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Failed to update profile" }
  }
}

// Places functions
export const getLugares = async () => {
  try {
    const response = await api.get("/lugares")
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch places" }
  }
}

export const getLugarById = async (id) => {
  try {
    const response = await api.get(`/lugares/${id}`)
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch place" }
  }
}

// Reservations functions
export const createReservation = async (reservationData) => {
  try {
    const response = await api.post("/reservas", reservationData)
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Failed to create reservation" }
  }
}

export const getUserReservations = async () => {
  try {
    const response = await api.get("/reservas")
    return response.data
  } catch (error) {
    throw error.response?.data || { error: "Failed to fetch reservations" }
  }
}
