"use client"

import { useState, useEffect } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { View, ActivityIndicator } from "react-native"
import HomeScreen from "./HomeScreen"
import MainScreen from "./MainScreen"
import AccountScreen from "./AccountScreen"
import LoginScreen from "./LoginScreen"
import RegisterScreen from "./RegisterScreen"
import MessagesScreen from "./MessagesScreen"
import CalendarScreen from "./CalendarScreen"
import MapScreen from "./MapScreen"
import AddPlaceScreen from "./AddPlaceScreen"
import { getData } from "./storage"
import { VacationProvider } from "./context/VacationContext"

// Add the new PlaceDetailScreen and VacationTimelineScreen to the App.tsx file
// Import the new screens
import PlaceDetailScreen from "./PlaceDetailScreen"
import VacationTimelineScreen from "./VacationTimelineScreen"

// Initialize auth with default values
const initialAuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
}

export default function App() {
  // Authentication state
  const [auth, setAuth] = useState(initialAuthState)
  const [loading, setLoading] = useState(true)

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState("home")
  const [routeParams, setRouteParams] = useState({})

  // Check for stored authentication on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getData("token")
        const user = await getData("user")

        if (token && user) {
          setAuth({
            isLoggedIn: true,
            user,
            token,
          })
        }
      } catch (error) {
        console.error("Error checking auth:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Authentication handlers
  const handleLogin = (userData, token) => {
    setAuth({
      isLoggedIn: true,
      user: userData,
      token: token,
    })
    setCurrentScreen("home")
  }

  const handleLogout = () => {
    setAuth(initialAuthState)
    setCurrentScreen("home")
  }

  const handleRegister = (userData) => {
    setCurrentScreen("login")
  }

  const handleNavigate = (screen, params = {}) => {
    // Check if the screen requires authentication
    if ((screen === "addPlace" || screen === "account") && !auth.isLoggedIn) {
      // If not logged in and trying to access protected screens, redirect to login
      setCurrentScreen("login")
      return
    }

    // Set route params if provided
    if (Object.keys(params).length > 0) {
      setRouteParams(params)
    }

    // Otherwise, navigate normally
    setCurrentScreen(screen)
  }

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#cf3a23" />
      </View>
    )
  }

  // Screen renderer
  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen onNavigate={handleNavigate} auth={auth} />
      case "main":
        return <MainScreen onNavigate={handleNavigate} auth={auth} />
      case "account":
        return <AccountScreen onNavigate={handleNavigate} onLogout={handleLogout} user={auth.user} />
      case "login":
        return <LoginScreen onLogin={handleLogin} onNavigate={handleNavigate} />
      case "register":
        return <RegisterScreen onRegister={handleRegister} onNavigate={handleNavigate} />
      case "messages":
        return <MessagesScreen onNavigate={handleNavigate} auth={auth} />
      case "calendar":
        return <CalendarScreen onNavigate={handleNavigate} auth={auth} route={routeParams} />
      case "map":
        return <MapScreen onNavigate={handleNavigate} auth={auth} route={routeParams} />
      case "addPlace":
        return <AddPlaceScreen onNavigate={handleNavigate} auth={auth} />
      case "placeDetail":
        return <PlaceDetailScreen onNavigate={handleNavigate} auth={auth} route={routeParams} />
      case "vacationTimeline":
        return <VacationTimelineScreen onNavigate={handleNavigate} auth={auth} route={routeParams} />
      default:
        return <HomeScreen onNavigate={handleNavigate} auth={auth} />
    }
  }

  return (
    <SafeAreaProvider>
      <VacationProvider>
        <StatusBar style="dark" />
        {renderScreen()}
      </VacationProvider>
    </SafeAreaProvider>
  )
}
