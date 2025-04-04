require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { PrismaClient } = require("@prisma/client")

const app = express()
const prisma = new PrismaClient()

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "travelmate-secret-key-change-in-production"
const PORT = process.env.PORT || 3000

app.use(cors()) // Allow connections from Expo
app.use(express.json()) // For receiving JSON in requests

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ error: "Access denied" })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" })
    req.user = user
    next()
  })
}

// Register a new user
app.post("/register", async (req, res) => {
  try {
    const { nombre, email, password, tipo = "normal" } = req.body

    // Validate input
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check if user already exists
    const existingUser = await prisma.usuarios.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" })
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await prisma.usuarios.create({
      data: {
        nombre,
        email,
        password_hash,
        tipo,
      },
    })

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = newUser

    res.status(201).json(userWithoutPassword)
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Error creating user" })
  }
})

// Login user
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    const user = await prisma.usuarios.findUnique({
      where: { email },
    })

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" })
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password" })
    }

    // Create and assign token
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" })

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user

    res.json({
      user: userWithoutPassword,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Error logging in" })
  }
})

// Get user profile (protected route)
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await prisma.usuarios.findUnique({
      where: { id: req.user.id },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Remove password from response
    const { password_hash: _, ...userWithoutPassword } = user

    // Get user's reservations
    const reservas = await prisma.reservas.findMany({
      where: { usuario_id: req.user.id },
    })

    res.json({
      ...userWithoutPassword,
      reservas,
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ error: "Error fetching profile" })
  }
})

// Start the server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))

