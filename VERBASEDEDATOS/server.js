const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const path = require("path")

const app = express()
// Configure CORS to allow requests from any origin
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())

// JWT Secret
const JWT_SECRET = "Enzolorenzo1111*"
const secret = "Enzolorenzo1111*" // El mismo secreto utilizado para firmar el token

// Database configuration
const db = mysql.createConnection({
  host: "172.16.4.42", // IP of the VM
  user: "pepe",
  password: "Enzolorenzo1111*",
  database: "TravelMate",
  port: 3306,
})

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err)
    return
  }
  console.log("Connected to the MySQL database")

  // Test query to check if destinations table has data
  db.query("SELECT COUNT(*) as count FROM destinos", (err, results) => {
    if (err) {
      console.error("Error checking destinations table:", err)
    } else {
      console.log(`Found ${results[0].count} destinations in the database`)
    }
  })
})

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  // Obtener el token del encabezado Authorization
  const token = req.headers["authorization"]?.split(" ")[1] // El token está después de "Bearer"

  if (!token) {
    return res.status(403).json({ error: "Token is required" })
  }

  // Verificar el token usando el secreto
  jwt.verify(token, secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" })
    }

    // Si la verificación es exitosa, agregar los datos del usuario a la solicitud
    req.user = user
    next()
  })
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    server: "TravelMate API",
    database: db.state === "authenticated" ? "connected" : "disconnected",
  })
})

// Routes for the HTML dashboard
app.get("/api/usuarios", (req, res) => {
  console.log("Fetching all users...")
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) {
      console.error("Error fetching users:", err)
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} users`)
    res.json(results)
  })
})

app.get("/api/lugares", (req, res) => {
  console.log("Fetching all places...")
  db.query("SELECT * FROM lugares", (err, results) => {
    if (err) {
      console.error("Error fetching places:", err)
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} places`)
    res.json(results)
  })
})

app.get("/api/reservas", (req, res) => {
  console.log("Fetching all reservations...")
  db.query("SELECT * FROM reservas", (err, results) => {
    if (err) {
      console.error("Error fetching reservations:", err)
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} reservations`)
    res.json(results)
  })
})

app.get("/api/destinos", (req, res) => {
  console.log("Fetching all destinations...")
  db.query("SELECT * FROM destinos", (err, results) => {
    if (err) {
      console.error("Error fetching destinations:", err)
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} destinations`)
    res.json(results)
  })
})

app.get("/api/planes_vacaciones", (req, res) => {
  console.log("Fetching all vacation plans...")
  db.query("SELECT * FROM planes_vacaciones", (err, results) => {
    if (err) {
      console.error("Error fetching vacation plans:", err)
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} vacation plans`)
    res.json(results)
  })
})

app.get("/api/actividades_vacaciones", (req, res) => {
  console.log("Fetching all vacation activities...")
  db.query("SELECT * FROM actividades_vacaciones", (err, results) => {
    if (err) {
      console.error("Error fetching vacation activities:", err)
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} vacation activities`)
    res.json(results)
  })
})

// User Authentication Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { nombre, email, password, tipo } = req.body

    // Validate input
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "All fields are required" })
    }

    // Check if user already exists
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("Error checking existing user:", err)
        return res.status(500).json({ error: "Error creating user" })
      }

      if (results.length > 0) {
        return res.status(400).json({ error: "User with this email already exists" })
      }

      // Hash password
      const salt = await bcrypt.genSalt(10)
      const password_hash = await bcrypt.hash(password, salt)

      // Create user
      const userType = tipo || "normal"
      db.query(
        "INSERT INTO usuarios (nombre, email, password_hash, tipo) VALUES (?, ?, ?, ?)",
        [nombre, email, password_hash, userType],
        (err, result) => {
          if (err) {
            console.error("Error creating user:", err)
            return res.status(500).json({ error: "Error creating user" })
          }

          // Get the created user
          db.query("SELECT id, nombre, email, tipo FROM usuarios WHERE id = ?", [result.insertId], (err, users) => {
            if (err) {
              console.error("Error fetching created user:", err)
              return res.status(500).json({ error: "Error creating user" })
            }

            res.status(201).json(users[0])
          })
        },
      )
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Error creating user" })
  }
})

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user
    db.query("SELECT * FROM usuarios WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("Error finding user:", err)
        return res.status(500).json({ error: "Error logging in" })
      }

      if (results.length === 0) {
        return res.status(400).json({ error: "Invalid email or password" })
      }

      const user = results[0]

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash)
      if (!validPassword) {
        return res.status(400).json({ error: "Invalid email or password" })
      }

      // Create and assign token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" })

      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user

      res.json({
        user: userWithoutPassword,
        token,
      })
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Error logging in" })
  }
})

// API endpoints for the mobile app
app.get("/api/destinos/destacados", (req, res) => {
  db.query("SELECT * FROM destinos WHERE destacado = 1 ORDER BY popularidad DESC LIMIT 5", (err, results) => {
    if (err) {
      console.error("Error fetching featured destinations:", err)
      return res.status(500).json({ error: "Error fetching featured destinations" })
    }
    res.json(results)
  })
})

app.get("/api/destinos/:id", (req, res) => {
  const { id } = req.params
  db.query("SELECT * FROM destinos WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching destination:", err)
      return res.status(500).json({ error: "Error fetching destination" })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Destination not found" })
    }

    res.json(results[0])
  })
})

// Places Routes
app.get("/api/lugares/by-destination", (req, res) => {
  const { destino_id, tipo } = req.query
  let query = "SELECT * FROM lugares"
  const params = []

  if (destino_id || tipo) {
    query += " WHERE"

    if (destino_id) {
      query += " destino_id = ?"
      params.push(destino_id)
    }

    if (tipo) {
      if (destino_id) query += " AND"
      query += " tipo = ?"
      params.push(tipo)
    }
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching places:", err)
      return res.status(500).json({ error: "Error fetching places" })
    }
    res.json(results)
  })
})

app.get("/api/lugares/:id", (req, res) => {
  const { id } = req.params
  db.query("SELECT * FROM lugares WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching place:", err)
      return res.status(500).json({ error: "Error fetching place" })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Place not found" })
    }

    res.json(results[0])
  })
})


app.post("/api/lugares", authenticateToken, (req, res) => {
  const { nombre, descripcion, tipo, ubicacion, precio, horario_checkin, horario_checkout, amenities } = req.body

  if (!nombre || !tipo || !ubicacion) {
    return res.status(400).json({ error: "Name, type, and location are required" })
  }

  console.log("Creating lugar with data:", req.body)

  db.query(
    "INSERT INTO lugares (nombre, descripcion, tipo, ubicacion, precio, horario_checkin, horario_checkout, amenities) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [
      nombre,
      descripcion || null,
      tipo,
      ubicacion,
      precio || null,
      horario_checkin || "14:00",
      horario_checkout || "12:00",
      amenities || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Error creating place:", err)
        return res.status(500).json({ error: "Error creating place" })
      }

      db.query("SELECT * FROM lugares WHERE id = ?", [result.insertId], (err, places) => {
        if (err) {
          console.error("Error fetching created place:", err)
          return res.status(500).json({ error: "Error creating place" })
        }

        res.status(201).json(places[0])
      })
    },
  )
})

// Vacation Plans Routes
app.get("/api/planes-vacaciones/usuario/:userId", (req, res) => {
  const { userId } = req.params
  db.query(
    `SELECT pv.*, d.nombre as destino_nombre, d.pais as destino_pais, d.imagen_url as destino_imagen 
     FROM planes_vacaciones pv 
     JOIN destinos d ON pv.destino_id = d.id 
     WHERE pv.usuario_id = ? 
     ORDER BY pv.fecha_inicio ASC`,
    [userId],
    (err, results) => {
      if (err) {
        console.error("Error fetching vacation plans:", err)
        return res.status(500).json({ error: "Error fetching vacation plans" })
      }

      // Format the results to include destino as a nested object
      const formattedResults = results.map((row) => {
        const {
          id,
          usuario_id,
          destino_id,
          fecha_inicio,
          fecha_fin,
          estado,
          creado_en,
          destino_nombre,
          destino_pais,
          destino_imagen,
        } = row

        return {
          id,
          usuario_id,
          destino_id,
          fecha_inicio,
          fecha_fin,
          estado,
          creado_en,
          destino: {
            id: destino_id,
            nombre: destino_nombre,
            pais: destino_pais,
            imagen_url: destino_imagen,
          },
        }
      })

      res.json(formattedResults)
    },
  )
})

app.post("/api/planes-vacaciones", authenticateToken, (req, res) => {
  const { destino_id, fecha_inicio, fecha_fin } = req.body

  if (!destino_id || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "Destination, start date, and end date are required" })
  }

  db.query(
    "INSERT INTO planes_vacaciones (usuario_id, destino_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, destino_id, fecha_inicio, fecha_fin, "planificado"],
    (err, result) => {
      if (err) {
        console.error("Error creating vacation plan:", err)
        return res.status(500).json({ error: "Error creating vacation plan" })
      }

      // Get the created plan with destination info
      db.query(
        `SELECT pv.*, d.nombre as destino_nombre, d.pais as destino_pais, d.imagen_url as destino_imagen 
         FROM planes_vacaciones pv 
         JOIN destinos d ON pv.destino_id = d.id 
         WHERE pv.id = ?`,
        [result.insertId],
        (err, plans) => {
          if (err) {
            console.error("Error fetching created vacation plan:", err)
            return res.status(500).json({ error: "Error creating vacation plan" })
          }

          if (plans.length === 0) {
            return res.status(404).json({ error: "Vacation plan not found" })
          }

          // Format the result to include destino as a nested object
          const row = plans[0]
          const {
            id,
            usuario_id,
            destino_id,
            fecha_inicio,
            fecha_fin,
            estado,
            creado_en,
            destino_nombre,
            destino_pais,
            destino_imagen,
          } = row

          const formattedPlan = {
            id,
            usuario_id,
            destino_id,
            fecha_inicio,
            fecha_fin,
            estado,
            creado_en,
            destino: {
              id: destino_id,
              nombre: destino_nombre,
              pais: destino_pais,
              imagen_url: destino_imagen,
            },
          }

          res.status(201).json(formattedPlan)
        },
      )
    },
  )
})

// Add endpoint to create reservations
app.post("/api/reservas", authenticateToken, (req, res) => {
  const { lugar_id, fecha_inicio, fecha_fin } = req.body
  const usuario_id = req.user.id

  if (!lugar_id || !fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: "Place ID, start date, and end date are required" })
  }

  db.query(
    "INSERT INTO reservas (usuario_id, lugar_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)",
    [usuario_id, lugar_id, fecha_inicio, fecha_fin, "pendiente"],
    (err, result) => {
      if (err) {
        console.error("Error creating reservation:", err)
        return res.status(500).json({ error: "Error creating reservation" })
      }

      db.query("SELECT * FROM reservas WHERE id = ?", [result.insertId], (err, reservations) => {
        if (err) {
          console.error("Error fetching created reservation:", err)
          return res.status(500).json({ error: "Error creating reservation" })
        }

        res.status(201).json(reservations[0])
      })
    },
  )
})

// Serve static files
app.use(express.static(path.join(__dirname)))

// Start the server
const PORT = 3001
// Listen on all network interfaces (0.0.0.0) instead of just localhost
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT} (accessible from all network interfaces)`)
})
