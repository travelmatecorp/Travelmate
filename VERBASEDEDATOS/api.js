import { storeData, getData, removeData } from "./storage"
import axios from "axios"

// Get API URL from environment variables
const API_URL = process.env.API_URL || "http://192.168.0.54:3001"

console.log("Using API URL:", API_URL)

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

// Add request interceptor to include auth token in requests
api.interceptors.request.use(
  async (config) => {
    const token = await getData("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// User registration
export async function register(userData) {
  try {
    console.log("Registering user with data:", userData)

    // Make API request to register endpoint
    const response = await api.post("api/register", userData)

    console.log("Registration response:", response.data)
    return response.data
  } catch (error) {
    console.error("Registration error:", error)

    // Handle axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw { error: error.response.data.error || "Registration failed" }
    } else if (error.request) {
      // The request was made but no response was received
      throw { error: "No response from server. Please check your connection." }
    } else {
      // Something happened in setting up the request that triggered an Error
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// User login
export async function login(credentials) {
  try {
    console.log("Logging in with:", credentials.email)

    // Make API request to login endpoint
    const response = await api.post("/login", credentials)

    // Store token and user data
    const { token, user } = response.data
    await storeData("token", token)
    await storeData("user", user)

    console.log("Login successful:", user)
    return { user, token }
  } catch (error) {
    console.error("Login error:", error)

    if (error.response) {
      throw { error: error.response.data.error || "Login failed" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Get user profile
export async function getProfile() {
  try {
    // Get user profile from API
    const response = await api.get("/profile")
    return response.data
  } catch (error) {
    console.error("Get profile error:", error)

    if (error.response) {
      throw { error: error.response.data.error || "Failed to get profile" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Logout user
export async function logout() {
  try {
    // Clear stored auth data
    await removeData("token")
    await removeData("user")

    return true
  } catch (error) {
    console.error("Logout error:", error)
    // Even if there's an error, we still want to clear local storage
    await removeData("token")
    await removeData("user")
    throw error
  }
}

// Create a new place (for hosts)
export async function createLugar(lugarData) {
  try {
    const response = await api.post("/lugares", lugarData)
    return response.data
  } catch (error) {
    console.error("Create lugar error:", error)

    if (error.response) {
      throw { error: error.response.data.error || "Failed to create place" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Get all places
export async function getLugares(filters = {}) {
  try {
    const response = await api.get("/lugares", { params: filters })
    return response.data
  } catch (error) {
    console.error("Get lugares error:", error)

    if (error.response) {
      throw { error: error.response.data.error || "Failed to get places" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Create a reservation
export async function createReservation(reservationData) {
  try {
    const response = await api.post("/reservas", reservationData)
    return response.data
  } catch (error) {
    console.error("Create reservation error:", error)

    if (error.response) {
      throw { error: error.response.data.error || "Failed to create reservation" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Get user reservations
export async function getUserReservations() {
  try {
    const response = await api.get("/reservas/user")
    return response.data
  } catch (error) {
    console.error("Get user reservations error:", error)

    if (error.response) {
      throw { error: error.response.data.error || "Failed to get reservations" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Export the axios instance for custom requests
export { api }

