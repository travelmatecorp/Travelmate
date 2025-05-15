const mysql = require("mysql2")

// Database configuration
const db = mysql.createConnection({
  host: "172.16.100.5", // IP of the VM
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

  // Create tables if they don't exist
  createTables()
})

function createTables() {
  // Create usuarios table
  const createUsuariosTable = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      tipo ENUM('propietario', 'normal') NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create destinos table
  const createDestinosTable = `
    CREATE TABLE IF NOT EXISTS destinos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      pais VARCHAR(100) NOT NULL,
      descripcion TEXT,
      imagen_url VARCHAR(255),
      latitud DECIMAL(10,8) NOT NULL,
      longitud DECIMAL(11,8) NOT NULL,
      popularidad INT DEFAULT 0,
      destacado BOOLEAN DEFAULT FALSE,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create lugares table
  const createLugaresTable = `
    CREATE TABLE IF NOT EXISTS lugares (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      descripcion TEXT,
      ubicacion VARCHAR(255) NOT NULL,
      tipo ENUM('restaurante', 'alojamiento', 'auto', 'excursion', 'otro') NOT NULL,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create reservas table
  const createReservasTable = `
    CREATE TABLE IF NOT EXISTS reservas (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      lugar_id INT NOT NULL,
      fecha_inicio DATETIME NOT NULL,
      fecha_fin DATETIME NOT NULL,
      estado ENUM('pendiente', 'confirmada', 'cancelada') DEFAULT 'pendiente',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create planes_vacaciones table
  const createPlanesVacacionesTable = `
    CREATE TABLE IF NOT EXISTS planes_vacaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      destino_id INT NOT NULL,
      fecha_inicio DATE NOT NULL,
      fecha_fin DATE NOT NULL,
      estado ENUM('planificado', 'confirmado', 'cancelado') DEFAULT 'planificado',
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Create actividades_vacaciones table
  const createActividadesVacacionesTable = `
    CREATE TABLE IF NOT EXISTS actividades_vacaciones (
      id INT AUTO_INCREMENT PRIMARY KEY,
      plan_id INT NOT NULL,
      lugar_id INT NOT NULL,
      fecha DATE NOT NULL,
      hora_inicio TIME,
      hora_fin TIME,
      notas TEXT,
      creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `

  // Execute the create table queries
  db.query(createUsuariosTable, (err) => {
    if (err) {
      console.error("Error creating usuarios table:", err)
    } else {
      console.log("Usuarios table created or already exists")
    }
  })

  db.query(createDestinosTable, (err) => {
    if (err) {
      console.error("Error creating destinos table:", err)
    } else {
      console.log("Destinos table created or already exists")
    }
  })

  db.query(createLugaresTable, (err) => {
    if (err) {
      console.error("Error creating lugares table:", err)
    } else {
      console.log("Lugares table created or already exists")
    }
  })

  db.query(createReservasTable, (err) => {
    if (err) {
      console.error("Error creating reservas table:", err)
    } else {
      console.log("Reservas table created or already exists")
    }
  })

  db.query(createPlanesVacacionesTable, (err) => {
    if (err) {
      console.error("Error creating planes_vacaciones table:", err)
    } else {
      console.log("Planes_vacaciones table created or already exists")
    }
  })

  db.query(createActividadesVacacionesTable, (err) => {
    if (err) {
      console.error("Error creating actividades_vacaciones table:", err)
    } else {
      console.log("Actividades_vacaciones table created or already exists")

      // Close the connection after all tables are created
      db.end((err) => {
        if (err) {
          console.error("Error closing database connection:", err)
        } else {
          console.log("Database connection closed")
        }
      })
    }
  })
}
