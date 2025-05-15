"use client"

import { useState, useEffect, useRef } from "react"
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import BottomNavigation from "./components/BottomNavigation"

// Sample data for conversations
const SAMPLE_CONVERSATIONS = [
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

// Sample data for chat messages
const SAMPLE_MESSAGES = [
  {
    id: "1",
    text: "Hello! How can I help you with your reservation?",
    sender: "them",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    text: "Hi! I'd like to confirm my booking for next weekend.",
    sender: "me",
    timestamp: "10:31 AM",
  },
  {
    id: "3",
    text: "Of course! Let me check that for you.",
    sender: "them",
    timestamp: "10:32 AM",
  },
  {
    id: "4",
    text: "I can confirm your reservation for 2 nights starting on Friday, June 10th. Is that correct?",
    sender: "them",
    timestamp: "10:33 AM",
  },
  {
    id: "5",
    text: "Yes, that's correct. Thank you!",
    sender: "me",
    timestamp: "10:34 AM",
  },
  {
    id: "6",
    text: "Perfect! Your reservation is now confirmed. We look forward to welcoming you to Hotel Riviera.",
    sender: "them",
    timestamp: "10:35 AM",
  },
  {
    id: "7",
    text: "Do you have any special requests or questions before your stay?",
    sender: "them",
    timestamp: "10:36 AM",
  },
  {
    id: "8",
    text: "Yes, I was wondering if you offer airport pickup services?",
    sender: "me",
    timestamp: "10:37 AM",
  },
  {
    id: "9",
    text: "Yes, we do! The cost is $30 each way. Would you like me to arrange that for you?",
    sender: "them",
    timestamp: "10:38 AM",
  },
  {
    id: "10",
    text: "That would be great! My flight arrives at 2 PM on Friday.",
    sender: "me",
    timestamp: "10:39 AM",
  },
]

export default function MessagesScreen({ onNavigate, auth, route }) {
  const [activeConversation, setActiveConversation] = useState(null)
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS)
  const [messages, setMessages] = useState(SAMPLE_MESSAGES)
  const [newMessage, setNewMessage] = useState("")
  const flatListRef = useRef(null)

  useEffect(() => {
    // If a conversation ID is passed in the route, set it as active
    if (route?.params?.conversationId) {
      const conversation = conversations.find((c) => c.id === route.params.conversationId)
      if (conversation) {
        setActiveConversation(conversation)
      }
    }
  }, [route?.params?.conversationId, conversations])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return

    const newMsg = {
      id: String(Date.now()),
      text: newMessage,
      sender: "me",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prevMessages) => [...prevMessages, newMsg])
    setNewMessage("")

    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }

  const handleBackToConversations = () => {
    setActiveConversation(null)
  }

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity style={styles.conversationItem} onPress={() => setActiveConversation(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      <View style={styles.conversationDetails}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName}>{item.name}</Text>
          <Text style={styles.conversationTime}>{item.timestamp}</Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text style={styles.conversationLastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderMessageItem = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.sender === "me" ? styles.sentMessageContainer : styles.receivedMessageContainer,
      ]}
    >
      {item.sender !== "me" && activeConversation && (
        <Text style={styles.messageSender}>{activeConversation.name}</Text>
      )}
      <View
        style={[styles.messageBubble, item.sender === "me" ? styles.sentMessageBubble : styles.receivedMessageBubble]}
      >
        <Text style={[styles.messageText, item.sender === "me" ? styles.sentMessageText : styles.receivedMessageText]}>
          {item.text}
        </Text>
      </View>
      <Text style={styles.messageTimestamp}>{item.timestamp}</Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {activeConversation ? (
        // Chat view
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToConversations} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>{activeConversation.name}</Text>
              <Text style={styles.headerSubtitle}>{activeConversation.isOnline ? "Online" : "Offline"}</Text>
            </View>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="call-outline" size={22} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />

          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.attachButton}>
              <Ionicons name="attach" size={24} color="#666" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, newMessage.trim() === "" && styles.sendButtonDisabled]}
              onPress={handleSendMessage}
              disabled={newMessage.trim() === ""}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      ) : (
        // Conversations list view
        <>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Messages</Text>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="create-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <FlatList
            data={conversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.conversationsList}
          />

          <BottomNavigation currentScreen="messages" onNavigate={onNavigate} auth={auth} />
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  headerAction: {
    padding: 8,
  },

  // Conversations List Styles
  conversationsList: {
    paddingVertical: 8,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    backgroundColor: "white",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
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
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  conversationDetails: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
  },
  conversationTime: {
    fontSize: 12,
    color: "#666",
  },
  conversationFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  conversationLastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#cf3a23",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: "center",
  },
  unreadBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Chat View Styles
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: "80%",
  },
  sentMessageContainer: {
    alignSelf: "flex-end",
  },
  receivedMessageContainer: {
    alignSelf: "flex-start",
  },
  messageSender: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
    marginLeft: 4,
  },
  messageBubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sentMessageBubble: {
    backgroundColor: "#cf3a23",
    borderTopRightRadius: 4,
  },
  receivedMessageBubble: {
    backgroundColor: "#e0e0e0",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  sentMessageText: {
    color: "white",
  },
  receivedMessageText: {
    color: "#333",
  },
  messageTimestamp: {
    fontSize: 11,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
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
    marginHorizontal: 8,
  },
  sendButton: {
    backgroundColor: "#cf3a23",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
})
