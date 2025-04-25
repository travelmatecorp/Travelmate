"use client"

import { useState, useEffect } from "react"

// Define types for our chat data
export interface Message {
  id: string
  text: string
  sender: "me" | "them"
  timestamp: string
}

export interface Conversation {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  unread: number
  avatar: string
  isOnline: boolean
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch conversations from API or local storage
  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use sample data
    const sampleConversations = [
      {
        id: "1",
        name: "Hotel Riviera",
        lastMessage: "Your reservation has been confirmed.",
        timestamp: "10:30 AM",
        unread: 2,
        avatar: "https://source.unsplash.com/random/?hotel",
        isOnline: true,
      },
      {
        id: "2",
        name: "Beach Tour Guide",
        lastMessage: "We'll meet at the hotel lobby at 9 AM.",
        timestamp: "Yesterday",
        unread: 0,
        avatar: "https://source.unsplash.com/random/?guide",
        isOnline: false,
      },
      {
        id: "3",
        name: "Car Rental Service",
        lastMessage: "Your car will be ready for pickup tomorrow.",
        timestamp: "Yesterday",
        unread: 1,
        avatar: "https://source.unsplash.com/random/?car",
        isOnline: true,
      },
      {
        id: "4",
        name: "Restaurant Reservation",
        lastMessage: "We look forward to serving you tonight!",
        timestamp: "2 days ago",
        unread: 0,
        avatar: "https://source.unsplash.com/random/?restaurant",
        isOnline: false,
      },
    ]

    setConversations(sampleConversations)
    setLoading(false)
  }, [])

  // Fetch messages for active conversation
  useEffect(() => {
    if (activeConversation) {
      // In a real app, you would fetch from an API
      // For now, we'll use sample data
      const sampleMessages = [
        {
          id: "1",
          text: "Hello! How can I help you with your reservation?",
          sender: "them" as const,
          timestamp: "10:30 AM",
        },
        {
          id: "2",
          text: "Hi! I'd like to confirm my booking for next weekend.",
          sender: "me" as const,
          timestamp: "10:31 AM",
        },
        {
          id: "3",
          text: "Of course! Let me check that for you.",
          sender: "them" as const,
          timestamp: "10:32 AM",
        },
        {
          id: "4",
          text: "I can confirm your reservation for 2 nights starting on Friday, June 10th. Is that correct?",
          sender: "them" as const,
          timestamp: "10:33 AM",
        },
        {
          id: "5",
          text: "Yes, that's correct. Thank you!",
          sender: "me" as const,
          timestamp: "10:34 AM",
        },
        {
          id: "6",
          text: "Perfect! Your reservation is now confirmed. We look forward to welcoming you to Hotel Riviera.",
          sender: "them" as const,
          timestamp: "10:35 AM",
        },
      ]

      setMessages(sampleMessages)

      // Mark conversation as read
      setConversations((prevConversations) =>
        prevConversations.map((conv) => (conv.id === activeConversation.id ? { ...conv, unread: 0 } : conv)),
      )
    }
  }, [activeConversation])

  // Send a new message
  const sendMessage = (text: string) => {
    if (!activeConversation || text.trim() === "") return

    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prevMessages) => [...prevMessages, newMessage])

    // Update last message in conversation list
    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.id === activeConversation.id ? { ...conv, lastMessage: text, timestamp: "Just now" } : conv,
      ),
    )

    // In a real app, you would send this to an API
    console.log("Sending message:", newMessage)

    // Simulate response after a delay
    setTimeout(() => {
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Thank you for your message. We'll get back to you shortly.",
        sender: "them",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prevMessages) => [...prevMessages, responseMessage])
    }, 1000)
  }

  return {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    loading,
  }
}
