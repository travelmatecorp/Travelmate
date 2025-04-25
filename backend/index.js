const express = require("express")
const mysql = require("mysql2")
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const path = require("path")
const app = express()
app.use(cors())
app.use(express.json())

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "Enzolorenzo1111*";
const API_URL = process.env.API_URL;

// Database configuration
const db = mysql.createConnection({
  host: "172.16.4.42", // IP of the VM
  user: "root",
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
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) return res.status(401).json({ error: "Access denied" })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" })
    req.user = user
    next()
  })
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

// Serve the admin panel
app.get("/panel", (req, res) => {
  res.sendFile(path.join(__dirname, "panel.html"))
})

// User routes
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

app.post('/api/usuarios', (req, res) => {
  console.log
}
)

// Get user profile (protected route)
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    db.query("SELECT * FROM usuarios WHERE id = ?", [req.user.id], async (err, users) => {
      if (err) {
        console.error("Error fetching user profile:", err)
        return res.status(500).json({ error: "Error fetching profile" })
      }

      if (users.length === 0) {
        return res.status(404).json({ error: "User not found" })
      }

      const user = users[0]
      // Remove password from response
      const { password_hash, ...userWithoutPassword } = user

      // Get user's reservations
      db.query("SELECT * FROM reservas WHERE usuario_id = ?", [req.user.id], async (err, reservas) => {
        if (err) {
          console.error("Error fetching reservations:", err)
          return res.status(500).json({ error: "Error fetching profile" })
        }

        // Get user's vacation plans
        db.query(
          `SELECT pv.*, d.nombre as destino_nombre, d.pais as destino_pais, d.imagen_url as destino_imagen 
           FROM planes_vacaciones pv 
           JOIN destinos d ON pv.destino_id = d.id 
           WHERE pv.usuario_id = ?`,
          [req.user.id],
          async (err, planesVacaciones) => {
            if (err) {
              console.error("Error fetching vacation plans:", err)
              return res.status(500).json({ error: "Error fetching profile" })
            }

            // Format vacation plans to include destino as a nested object
            const formattedPlanes = planesVacaciones.map((plan) => {
              const { destino_nombre, destino_pais, destino_imagen, ...planData } = plan

              return {
                ...planData,
                destino: {
                  id: plan.destino_id,
                  nombre: destino_nombre,
                  pais: destino_pais,
                  imagen_url: destino_imagen,
                },
              }
            })

            res.json({
              ...userWithoutPassword,
              reservas,
              planesVacaciones: formattedPlanes,
            })
          },
        )
      })
    })
  } catch (error) {
    console.error("Profile error:", error)
    res.status(500).json({ error: "Error fetching profile" })
  }
})

// Places routes
app.get("/api/lugares", (req, res) => {
  console.log("Fetching places...")
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
      return res.status(500).json({ error: err.message })
    }
    console.log(`Returning ${results.length} places`)
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
  const { nombre, descripcion, tipo, ubicacion, destino_id, precio } = req.body

  if (!nombre || !tipo || !ubicacion) {
    return res.status(400).json({ error: "Name, type, and location are required" })
  }

  db.query(
    "INSERT INTO lugares (nombre, descripcion, tipo, ubicacion, destino_id, precio) VALUES (?, ?, ?, ?, ?, ?)",
    [nombre, descripcion || null, tipo, ubicacion, destino_id || null, precio || null],
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

// Reservations routes
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

// Destinations routes
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

// Vacation plans routes
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
        const { destino_nombre, destino_pais, destino_imagen, ...planData } = row

        return {
          ...planData,
          destino: {
            id: row.destino_id,
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
          const { destino_nombre, destino_pais, destino_imagen, ...planData } = row

          const formattedPlan = {
            ...planData,
            destino: {
              id: row.destino_id,
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

app.put("/api/planes-vacaciones/:id/confirmar", authenticateToken, (req, res) => {
  const { id } = req.params

  db.query("SELECT * FROM planes_vacaciones WHERE id = ?", [id], (err, plans) => {
    if (err) {
      console.error("Error fetching vacation plan:", err)
      return res.status(500).json({ error: "Error confirming vacation plan" })
    }

    if (plans.length === 0) {
      return res.status(404).json({ error: "Vacation plan not found" })
    }

    const plan = plans[0]
    if (plan.usuario_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" })
    }

    db.query("UPDATE planes_vacaciones SET estado = 'confirmado' WHERE id = ?", [id], (err) => {
      if (err) {
        console.error("Error updating vacation plan:", err)
        return res.status(500).json({ error: "Error confirming vacation plan" })
      }

      // Get the updated plan with destination info
      db.query(
        `SELECT pv.*, d.nombre as destino_nombre, d.pais as destino_pais, d.imagen_url as destino_imagen 
           FROM planes_vacaciones pv 
           JOIN destinos d ON pv.destino_id = d.id 
           WHERE pv.id = ?`,
        [id],
        (err, updatedPlans) => {
          if (err) {
            console.error("Error fetching updated vacation plan:", err)
            return res.status(500).json({ error: "Error confirming vacation plan" })
          }

          if (updatedPlans.length === 0) {
            return res.status(404).json({ error: "Vacation plan not found" })
          }

          // Format the result to include destino as a nested object
          const row = updatedPlans[0]
          const { destino_nombre, destino_pais, destino_imagen, ...planData } = row

          const formattedPlan = {
            ...planData,
            destino: {
              id: row.destino_id,
              nombre: destino_nombre,
              pais: destino_pais,
              imagen_url: destino_imagen,
            },
          }

          res.json(formattedPlan)
        },
      )
    })
  })
})

// Vacation activities routes
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

app.get("/api/actividades-vacaciones", authenticateToken, (req, res) => {
  const { plan_id, fecha } = req.query
  let query = ""
  const params = []

  if (plan_id) {
    // Get activities for a specific plan
    query = `
      SELECT av.*, l.nombre as lugar_nombre, l.tipo as lugar_tipo
      FROM actividades_vacaciones av
      JOIN lugares l ON av.lugar_id = l.id
      WHERE av.plan_id = ?
    `
    params.push(plan_id)

    if (fecha) {
      query += " AND av.fecha = ?"
      params.push(fecha)
    }

    query += " ORDER BY av.fecha ASC, av.hora_inicio ASC"
  } else {
    // Get activities for all user's plans
    query = `
      SELECT av.*, l.nombre as lugar_nombre, l.tipo as lugar_tipo, 
             pv.fecha_inicio as plan_fecha_inicio, pv.fecha_fin as plan_fecha_fin,
             d.nombre as destino_nombre, d.pais as destino_pais
      FROM actividades_vacaciones av
      JOIN lugares l ON av.lugar_id = l.id
      JOIN planes_vacaciones pv ON av.plan_id = pv.id
      JOIN destinos d ON pv.destino_id = d.id
      WHERE pv.usuario_id = ?
    `
    params.push(req.user.id)

    if (fecha) {
      query += " AND av.fecha = ?"
      params.push(fecha)
    }

    query += " ORDER BY av.fecha ASC, av.hora_inicio ASC"
  }

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Error fetching vacation activities:", err)
      return res.status(500).json({ error: "Error fetching vacation activities" })
    }

    // Format the results
    const formattedResults = results.map((row) => {
      const formattedActivity = {
        id: row.id,
        plan_id: row.plan_id,
        lugar_id: row.lugar_id,
        fecha: row.fecha,
        hora_inicio: row.hora_inicio,
        hora_fin: row.hora_fin,
        notas: row.notas,
        creado_en: row.creado_en,
        lugar: {
          id: row.lugar_id,
          nombre: row.lugar_nombre,
          tipo: row.lugar_tipo,
        },
      }

      // Add plan and destination info if available
      if (row.plan_fecha_inicio) {
        formattedActivity.plan = {
          fecha_inicio: row.plan_fecha_inicio,
          fecha_fin: row.plan_fecha_fin,
          destino: {
            nombre: row.destino_nombre,
            pais: row.destino_pais,
          },
        }
      }

      return formattedActivity
    })

    res.json(formattedResults)
  })
})

app.post("/api/actividades-vacaciones", authenticateToken, (req, res) => {
  const { plan_id, lugar_id, fecha, hora_inicio, hora_fin, notas } = req.body

  if (!plan_id || !lugar_id || !fecha) {
    return res.status(400).json({ error: "Plan ID, place ID, and date are required" })
  }

  // Verify the plan belongs to the user
  db.query("SELECT * FROM planes_vacaciones WHERE id = ?", [plan_id], (err, plans) => {
    if (err) {
      console.error("Error fetching vacation plan:", err)
      return res.status(500).json({ error: "Error creating vacation activity" })
    }

    if (plans.length === 0) {
      return res.status(404).json({ error: "Vacation plan not found" })
    }

    const plan = plans[0]
    if (plan.usuario_id !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" })
    }

    db.query(
      "INSERT INTO actividades_vacaciones (plan_id, lugar_id, fecha, hora_inicio, hora_fin, notas) VALUES (?, ?, ?, ?, ?, ?)",
      [plan_id, lugar_id, fecha, hora_inicio || null, hora_fin || null, notas || null],
      (err, result) => {
        if (err) {
          console.error("Error creating vacation activity:", err)
          return res.status(500).json({ error: "Error creating vacation activity" })
        }

        // Get the created activity with place info
        db.query(
          `SELECT av.*, l.nombre as lugar_nombre, l.tipo as lugar_tipo
           FROM actividades_vacaciones av
           JOIN lugares l ON av.lugar_id = l.id
           WHERE av.id = ?`,
          [result.insertId],
          (err, activities) => {
            if (err) {
              console.error("Error fetching created vacation activity:", err)
              return res.status(500).json({ error: "Error creating vacation activity" })
            }

            if (activities.length === 0) {
              return res.status(404).json({ error: "Vacation activity not found" })
            }

            // Format the result
            const row = activities[0]
            const formattedActivity = {
              id: row.id,
              plan_id: row.plan_id,
              lugar_id: row.lugar_id,
              fecha: row.fecha,
              hora_inicio: row.hora_inicio,
              hora_fin: row.hora_fin,
              notas: row.notas,
              creado_en: row.creado_en,
              lugar: {
                id: row.lugar_id,
                nombre: row.lugar_nombre,
                tipo: row.lugar_tipo,
              },
            }

            res.status(201).json(formattedActivity)
          },
        )
      },
    )
  })
})

// Authentication routes
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

// Serve the admin panel HTML file
app.use(express.static(path.join(__dirname, "public")))

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
