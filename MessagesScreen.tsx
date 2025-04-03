"use client"

import { useState, useEffect } from "react"
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

// Mock conversation data
// In a real app, this would come from your backend API
const mockConversations = [
  {
    id: "1",
    user: {
      id: "101",
      name: "Hotel Trenquelauquen",
      avatar:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      isOnline: true,
    },
    lastMessage: {
      text: "Your reservation has been confirmed for June 15-20.",
      timestamp: "10:30 AM",
      unread: true,
    },
  },
  {
    id: "2",
    user: {
      id: "102",
      name: "Coastal Grill Restaurant",
      avatar:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      isOnline: false,
    },
    lastMessage: {
      text: "We've reserved a table for 4 people at 8 PM tonight.",
      timestamp: "Yesterday",
      unread: false,
    },
  },
  {
    id: "3",
    user: {
      id: "103",
      name: "Mountain Trek Tours",
      avatar:
        "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      isOnline: true,
    },
    lastMessage: {
      text: "Your guide will meet you at the hotel lobby at 9 AM.",
      timestamp: "Yesterday",
      unread: false,
    },
  },
  {
    id: "4",
    user: {
      id: "104",
      name: "TravelApp Support",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
      isOnline: true,
    },
    lastMessage: {
      text: "How can we help you with your upcoming trip?",
      timestamp: "2 days ago",
      unread: false,
    },
  },
]

// Mock chat messages for a selected conversation
// In a real app, this would come from your backend API
const mockChatMessages = {
  "1": [
    {
      id: "m1",
      text: "Hello! Thank you for choosing Hotel Trenquelauquen.",
      sender: "them",
      timestamp: "10:15 AM",
    },
    {
      id: "m2",
      text: "Your reservation has been confirmed for June 15-20.",
      sender: "them",
      timestamp: "10:30 AM",
    },
    {
      id: "m3",
      text: "Great! Do you offer airport pickup service?",
      sender: "me",
      timestamp: "10:32 AM",
    },
  ],
  "2": [
    {
      id: "m1",
      text: "Hi there! Thanks for your reservation at Coastal Grill.",
      sender: "them",
      timestamp: "Yesterday",
    },
    {
      id: "m2",
      text: "We've reserved a table for 4 people at 8 PM tonight.",
      sender: "them",
      timestamp: "Yesterday",
    },
  ],
}

export default function MessagesScreen({ onNavigate, auth }) {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [message, setMessage] = useState("")
  const [conversations, setConversations] = useState(mockConversations)
  const [messages, setMessages] = useState([])

  // Load messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // In a real app, this would be an API call to fetch messages
      setMessages(mockChatMessages[selectedConversation.id] || [])
    }
  }, [selectedConversation])

  // Send a new message
  const handleSendMessage = () => {
    if (!message.trim() || !selectedConversation) return

    // Create a new message object
    const newMessage = {
      id: `m${Date.now()}`,
      text: message,
      sender: "me",
      timestamp: "Just now",
    }

    // In a real app, this would be an API call to send the message
    // Update local state
    setMessages([...messages, newMessage])

    // Update the conversation with the new last message
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          lastMessage: {
            text: message,
            timestamp: "Just now",
            unread: false,
          },
        }
      }
      return conv
    })

    setConversations(updatedConversations)
    setMessage("")
  }

  // Render a conversation item
  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationItem, selectedConversation?.id === item.id && styles.selectedConversation]}
      onPress={() => setSelectedConversation(item)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        {item.user.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationInfo}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={[styles.lastMessage, item.lastMessage.unread && styles.unreadMessage]} numberOfLines={1}>
          {item.lastMessage.text}
        </Text>
      </View>
      <View style={styles.conversationMeta}>
        <Text style={styles.timestamp}>{item.lastMessage.timestamp}</Text>
        {item.lastMessage.unread && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  )

  // Render a chat message
  const renderChatMessage = ({ item }) => (
    <View style={[styles.messageContainer, item.sender === "me" ? styles.myMessage : styles.theirMessage]}>
      <View style={[styles.messageBubble, item.sender === "me" ? styles.myMessageBubble : styles.theirMessageBubble]}>
        <Text style={styles.messageText}>{item.text}</Text>
      </View>
      <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newMessageButton}>
          <Ionicons name="create-outline" size={24} color="#cf3a23" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Conversations list */}
        <View style={styles.conversationsContainer}>
          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Chat area */}
        {selectedConversation ? (
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <TouchableOpacity style={styles.backButton} onPress={() => setSelectedConversation(null)}>
                <Ionicons name="arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <Image source={{ uri: selectedConversation.user.avatar }} style={styles.chatAvatar} />
              <View style={styles.chatHeaderInfo}>
                <Text style={styles.chatHeaderName}>{selectedConversation.user.name}</Text>
                <Text style={styles.chatHeaderStatus}>{selectedConversation.user.isOnline ? "Online" : "Offline"}</Text>
              </View>
              <TouchableOpacity style={styles.chatHeaderAction}>
                <Ionicons name="call-outline" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={messages}
              renderItem={renderChatMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesContainer}
              inverted={false}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={100}
              style={styles.inputContainer}
            >
              <TouchableOpacity style={styles.attachButton}>
                <Ionicons name="attach" size={24} color="#666" />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={message}
                onChangeText={setMessage}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, !message.trim() && styles.disabledSendButton]}
                onPress={handleSendMessage}
                disabled={!message.trim()}
              >
                <Ionicons name="send" size={20} color={message.trim() ? "white" : "#999"} />
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        ) : (
          <View style={styles.noChatSelectedContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={80} color="#ddd" />
            <Text style={styles.noChatSelectedText}>Select a conversation to start chatting</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("calendar")}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("rewards")}>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate("map")}>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navItem, styles.activeNavItem]}>
          <Feather name="message-square" size={24} color="#cf3a23" />
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
  newMessageButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  conversationsContainer: {
    width: "35%",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    backgroundColor: "white",
  },
  conversationItem: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedConversation: {
    backgroundColor: "#f9f9f9",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  conversationInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 12,
    color: "#666",
  },
  unreadMessage: {
    fontWeight: "bold",
    color: "#333",
  },
  conversationMeta: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginBottom: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#cf3a23",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  backButton: {
    marginRight: 8,
  },
  chatAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: "#666",
  },
  chatHeaderAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesContainer: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
  },
  theirMessage: {
    alignSelf: "flex-start",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: "#cf3a23",
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#333",
  },
  myMessageText: {
    color: "white",
  },
  messageTimestamp: {
    fontSize: 10,
    color: "#999",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "white",
  },
  attachButton: {
    padding: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#cf3a23",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  disabledSendButton: {
    backgroundColor: "#f0f0f0",
  },
  noChatSelectedContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  noChatSelectedText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
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

