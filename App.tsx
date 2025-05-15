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

// Añadir las importaciones de las nuevas pantallas al inicio del archivo, junto con las otras importaciones
import PersonalInformationScreen from "./account/PersonalInformationScreen"
import PaymentMethodsScreen from "./account/PaymentMethodsScreen"
import NotificationsScreen from "./account/NotificationsScreen"
import PrivacySecurityScreen from "./account/PrivacySecurityScreen"

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
    console.log(`[NAVIGATE] To screen: ${screen} with params:`, params)

    // Asegurarse de siempre setear los params, incluso si están vacíos
    setCurrentScreen(screen)
    setRouteParams(params || {})
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
    // Ensure routeParams is always an object
    const safeRouteParams = routeParams || {}

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
        return <MessagesScreen onNavigate={handleNavigate} auth={auth} route={safeRouteParams} />
      case "calendar":
        return <CalendarScreen onNavigate={handleNavigate} auth={auth} route={safeRouteParams} />
      case "map":
        return <MapScreen onNavigate={handleNavigate} auth={auth} route={safeRouteParams} />
      case "addPlace":
        return <AddPlaceScreen onNavigate={handleNavigate} auth={auth} />
      case "placeDetail":
        return <PlaceDetailScreen onNavigate={handleNavigate} auth={auth} route={safeRouteParams} />
      case "vacationTimeline":
        return <VacationTimelineScreen onNavigate={handleNavigate} auth={auth} route={{ params: safeRouteParams }} />
      // Añadir los nuevos casos para las pantallas de cuenta
      case "personalInformation":
        return (
          <PersonalInformationScreen
            navigation={{ goBack: () => handleNavigate("account") }}
            route={{ params: { user: auth.user } }}
          />
        )
      case "paymentMethods":
        return <PaymentMethodsScreen navigation={{ goBack: () => handleNavigate("account") }} />
      case "notifications":
        return <NotificationsScreen navigation={{ goBack: () => handleNavigate("account") }} />
      case "privacySecurity":
        return <PrivacySecurityScreen navigation={{ goBack: () => handleNavigate("account") }} />
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
