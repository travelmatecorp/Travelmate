import { storeData, getData, removeData } from "./storage"
import axios from "axios"

// Get API URL from environment variables
const API_URL = process.env.API_URL || "http://172.16.1.94:3001/"

console.log("API Configuration:", {
  url: API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
})

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
})

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getData("token")
      console.log("Token:", token) // Verificar si el token está presente

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    } catch (error) {
      console.error("Error in request interceptor:", error)
      return config
    }
  },
  (error) => Promise.reject(error),
)

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error("API Error:", error?.response?.data || error.message)
    console.error("Request URL:", error?.config?.url)
    console.error("Request Method:", error?.config?.method)

    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      // Clear stored auth data
      await removeData("token")
      await removeData("user")
    }

    return Promise.reject(error)
  },
)

// User registration - modified to use /usuarios endpoint
// Función de registro
export async function register(userData) {
  try {
    console.log("Registering user with data:", userData)

    // Hacer la solicitud al endpoint de registro
    const response = await api.post("api/auth/register", userData)

    console.log("Registration response:", response.data)

    // Si el registro es exitoso, guardamos el token
    const { token } = response.data

    // Guardamos el token y los datos del usuario en el almacenamiento local
    await storeData("token", token) // Asumiendo que tienes una función storeData para guardar datos
    await storeData("user", response.data.user) // También guardamos los datos del usuario, si es necesario

    // Retornar los datos del usuario y el token (puedes hacer lo que necesites con ellos)
    return response.data
  } catch (error) {
    console.error("Registration error:", error)

    // Manejo de errores de Axios
    if (error.response) {
      throw { error: error.response.data.error || "Registration failed" }
    } else if (error.request) {
      throw { error: "No response from server. Please check your connection." }
    } else {
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// User login - modified to use /usuarios endpoint
export async function login(credentials) {
  try {
    console.log("Logging in with:", credentials.email)

    // Hacer la solicitud al endpoint de login real
    const response = await api.post("api/auth/login", credentials)

    // Obtener los datos de la respuesta, que incluyen el token y los datos del usuario
    const { token, user } = response.data

    if (!token || !user) {
      throw { error: "Invalid login response. Token or user data missing." }
    }

    // Almacenar el token y los datos del usuario
    await storeData("token", token) // Almacenar el token JWT
    await storeData("user", user) // Almacenar los datos del usuario

    console.log("Login successful:", user)
    return { user, token }
  } catch (error) {
    console.error("Login error:", error)

    if (error.response) {
      // El servidor respondió, pero con un error
      throw { error: error.response.data.error || "Login failed" }
    } else if (error.request) {
      // No hubo respuesta del servidor
      throw { error: "No response from server. Please check your connection." }
    } else {
      // Error inesperado
      throw { error: error.message || "An unexpected error occurred" }
    }
  }
}

// Get user profile - modified to use /usuarios endpoint
export async function getProfile() {
  try {
    // Get the user ID from stored user data
    const userData = await getData("user")
    if (!userData || !userData.id) {
      throw { error: "User data not found in storage" }
    }

    // Get all users and find the current one
    const response = await api.get("api/usuarios")
    const users = response.data

    // Find the current user
    const currentUser = users.find((u) => u.id === userData.id)

    if (!currentUser) {
      throw { error: "User not found" }
    }

    return currentUser
  } catch (error) {
    console.error("Get profile error:", error)

    if (error.response && error.response.status === 404) {
      throw { error: "User endpoint not found. Check your API configuration." }
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

// Get all destinations
export async function getDestinations(params = {}) {
  try {
    const response = await api.get("api/destinos", { params })
    return response.data
  } catch (error) {
    console.error("Get destinations error:", error)
    throw { error: error.response?.data?.error || "Failed to get destinations" }
  }
}

// Get featured destinations
export async function getFeaturedDestinations() {
  try {
    const response = await api.get("api/destinos/")
    return response.data
  } catch (error) {
    console.error("Get featured destinations error:", error)
    throw { error: error.response?.data?.error || "Failed to get featured destinations" }
  }
}
export async function getVacationPlans(userId) {
  try {
    const response = await api.get(`api/planes-vacaciones/usuario/${userId}`)
    return response.data
  } catch (error) {
    console.error("Error fetching vacation plans:", error)
    throw {
      error: error.response?.data?.error || "Failed to fetch vacation plans",
      status: error.response?.status || 500,
    }
  }
}

// Create vacation plan
export async function createVacationPlan(planData) {
  try {
    const response = await api.post("api/planes-vacaciones", planData)
    return response.data
  } catch (error) {
    console.error("Error creating vacation plan:", error)
    throw {
      error: error.response?.data?.error || "Failed to create vacation plan",
      status: error.response?.status || 500,
    }
  }
}

// Update vacation plan
export async function updateVacationPlan(planId, planData) {
  try {
    const response = await api.put(`api/planes-vacaciones/${planId}`, planData)
    return response.data
  } catch (error) {
    console.error("Error updating vacation plan:", error)

    if (error.response) {
      // Si el error tiene respuesta, devolvemos el error detallado
      throw {
        status: error.response.status,
        error: error.response?.data?.error || "Failed to update vacation plan",
      }
    } else if (error.request) {
      // Si no hubo respuesta del servidor
      throw {
        error: "No response from server. Please check your connection.",
        status: 503,
      }
    } else {
      // Si el error ocurrió al configurar la solicitud
      throw {
        error: error.message || "An unexpected error occurred",
        status: 500,
      }
    }
  }
}

// Get vacation activities
export async function getVacationActivities(params = {}) {
  try {
    const response = await api.get("api/actividades-vacaciones", { params })
    return response.data
  } catch (error) {
    console.error("Error fetching vacation activities:", error)
    throw {
      error: error.response?.data?.error || "Failed to fetch vacation activities",
      status: error.response?.status || 500,
    }
  }
}

// Create vacation activity
export async function createVacationActivity(activityData) {
  try {
    const response = await api.post("api/actividades-vacaciones", activityData)
    return response.data
  } catch (error) {
    console.error("Error creating vacation activity:", error)
    throw {
      error: error.response?.data?.error || "Failed to create vacation activity",
      status: error.response?.status || 500,
    }
  }
}

// Delete vacation activity
export async function deleteVacationActivity(activityId) {
  try {
    const response = await api.delete(`api/actividades-vacaciones/${activityId}`)
    return response.data
  } catch (error) {
    console.error("Error deleting vacation activity:", error)
    throw {
      error: error.response?.data?.error || "Failed to delete vacation activity",
      status: error.response?.status || 500,
    }
  }
}

// Confirm vacation plan
export async function confirmVacationPlan(planId) {
  try {
    const response = await api.put(`api/planes-vacaciones/${planId}/confirmar`)
    return response.data
  } catch (error) {
    console.error("Error confirming vacation plan:", error)
    throw {
      error: error.response?.data?.error || "Failed to confirm vacation plan",
      status: error.response?.status || 500,
    }
  }
}

// Get places by destination
export async function getPlacesByDestination(destinationId, type = null) {
  try {
    const params = { destination_id: destinationId }
    if (type) params.type = type

    console.log(`Fetching places for destination ${destinationId}, type: ${type || "all"}`)
    const response = await api.get("api/lugares", { params })
    return response.data
  } catch (error) {
    console.error("Get places error:", error)

    throw { error: error.response?.data?.error || "Failed to get places" }
  }
}

// Get place by ID
export async function getPlaceById(placeId) {
  try {
    console.log(`Making API request to: api/lugares/${placeId}`)
    const response = await api.get(`api/lugares/${placeId}`)
    console.log("API response status:", response.status)
    console.log("API response data:", response.data)
    return response.data
  } catch (error) {
    console.error("Get place error:", error)
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    })

    // If we got a 404, the place doesn't exist
    if (error.response?.status === 404) {
      throw { error: `Place with ID ${placeId} not found` }
    }

    // For other errors
    throw {
      error: error.response?.data?.error || "Failed to get place",
      details: `Request to api/lugares/${placeId} failed`,
    }
  }
}

// Create a new place (for hosts)
export async function createLugar(lugarData) {
  try {
    console.log("Creating lugar with data:", lugarData)

    // Get the token for authorization
    const token = await getData("token")
    if (!token) {
      throw new Error("Authentication required. Please log in.")
    }

    // Make API request to create lugar endpoint
    const response = await api.post("api/lugares", lugarData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("Create lugar response:", response.data)
    return response.data
  } catch (error) {
    console.error("Create lugar error:", error)

    // Handle axios errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Server responded with error:", error.response.status, error.response.data)
      throw { error: error.response.data.error || "Create lugar failed", status: error.response.status }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received from server")
      throw { error: "No response from server. Please check your connection.", status: 503 }
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error setting up request:", error.message)
      throw { error: error.message || "An unexpected error occurred", status: 500 }
    }
  }
}

// Add place to favorites
export async function addToFavorites(placeId) {
  try {
    const response = await api.post("/favorites", { lugar_id: placeId })
    return response.data
  } catch (error) {
    console.error("Add to favorites error:", error)
    throw { error: error.response?.data?.error || "Failed to add to favorites" }
  }
}

// Remove place from favorites
export async function removeFromFavorites(placeId) {
  try {
    const response = await api.delete(`/favorites/${placeId}`)
    return response.data
  } catch (error) {
    console.error("Remove from favorites error:", error)
    throw { error: error.response?.data?.error || "Failed to remove from favorites" }
  }
}

// Get user favorites
export async function getFavorites() {
  try {
    const response = await api.get("/favorites")
    return response.data
  } catch (error) {
    console.error("Get favorites error:", error)
    throw { error: error.response?.data?.error || "Failed to get favorites" }
  }
}

// Create a reservation
export async function createReservation(reservationData) {
  try {
    const response = await api.post("api/reservas", reservationData)
    return response.data
  } catch (error) {
    console.error("Create reservation error:", error)
    throw { error: error.response?.data?.error || "Failed to create reservation" }
  }
}

// Get user reservations
export async function getUserReservations() {
  try {
    const response = await api.get("api/reservas")
    return response.data
  } catch (error) {
    console.error("Get user reservations error:", error)
    throw { error: error.response?.data?.error || "Failed to get reservations" }
  }
}

// Format date to dd/mm/yyyy
export function formatDate(date) {
  if (!date) return ""
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

// Get all users
export async function getAllUsers() {
  try {
    const response = await api.get("api/usuarios")
    return response.data
  } catch (error) {
    console.error("Get all users error:", error)
    throw { error: error.response?.data?.error || "Failed to get users" }
  }
}

// Delete vacation plan - FIXED to use axios instead of fetch
export async function deleteVacationPlan(planId) {
  try {
    console.log(`Deleting vacation plan with ID: ${planId}`)
    const response = await api.delete(`api/planes-vacaciones/${planId}`)

    // Return the data directly from the axios response
    return response.data
  } catch (error) {
    console.error("Error deleting vacation plan:", error)

    // Improved error handling
    if (error.response) {
      // The server responded with an error status
      throw {
        error: error.response.data?.error || "Failed to delete vacation plan",
        status: error.response.status,
      }
    } else if (error.request) {
      // No response received
      throw { error: "No response from server. Please check your connection.", status: 503 }
    } else {
      // Request setup error
      throw { error: error.message || "An unexpected error occurred", status: 500 }
    }
  }
}

// Export the axios instance for custom requests
export { api }
