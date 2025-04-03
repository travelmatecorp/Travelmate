"use client"

import { useState } from "react"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import MainScreen from "./MainScreen"
import AccountScreen from "./AccountScreen"
import LoginScreen from "./LoginScreen"
import RegisterScreen from "./RegisterScreen"
import MessagesScreen from "./MessagesScreen"
import RewardsScreen from "./RewardsScreen"
import CalendarScreen from "./CalendarScreen"
import MapScreen from "./MapScreen"

// Also ensure we initialize auth with default values to prevent undefined errors
const initialAuthState = {
  isLoggedIn: false,
  user: null,
  token: null,
}

export default function App() {
  // Authentication state
  const [auth, setAuth] = useState(initialAuthState)

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState("main")

  // Authentication handlers
  const handleLogin = (userData, token) => {
    // In a real app, you would store the token securely
    // and possibly use a state management library like Redux
    setAuth({
      isLoggedIn: true,
      user: userData,
      token: token,
    })
    setCurrentScreen("main")
  }

  const handleLogout = () => {
    // Clear auth state and any stored tokens
    setAuth(initialAuthState)
    setCurrentScreen("main")
  }

  const handleRegister = (userData) => {
    // In a real app, you would handle registration success
    // and possibly auto-login the user
    setCurrentScreen("login")
  }

  const handleNavigate = (screen) => {
    setCurrentScreen(screen)
  }

  // Screen renderer
  const renderScreen = () => {
    switch (currentScreen) {
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
      case "rewards":
        return <RewardsScreen onNavigate={handleNavigate} auth={auth} />
      case "calendar":
        return <CalendarScreen onNavigate={handleNavigate} auth={auth} />
      case "map":
        return <MapScreen onNavigate={handleNavigate} auth={auth} />
      default:
        return <MainScreen onNavigate={handleNavigate} auth={auth} />
    }
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {renderScreen()}
    </SafeAreaProvider>
  )
}

