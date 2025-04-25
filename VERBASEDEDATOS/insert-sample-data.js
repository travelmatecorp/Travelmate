const mysql = require("mysql2")

// Database configuration
const db = mysql.createConnection({
  host: "172.16.6.214", // IP of the VM
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

  // Check if destinations table has data
  db.query("SELECT COUNT(*) as count FROM destinos", (err, results) => {
    if (err) {
      console.error("Error checking destinations table:", err)
      return
    }

    const count = results[0].count
    console.log(`Found ${count} destinations in the database`)

    // If no destinations exist, insert sample data
    if (count === 0) {
      console.log("No destinations found. Inserting sample data...")
      insertSampleDestinations()
    } else {
      console.log("Destinations already exist. No need to insert sample data.")
      db.end()
    }
  })
})

function insertSampleDestinations() {
  const destinations = [
    {
      nombre: "Buenos Aires",
      pais: "Argentina",
      descripcion: "La vibrante capital de Argentina, conocida por su arquitectura europea y rica vida cultural.",
      latitud: -34.6037,
      longitud: -58.3816,
      popularidad: 100,
      destacado: 1,
    },
    {
      nombre: "Bariloche",
      pais: "Argentina",
      descripcion: "Ciudad de montaña famosa por sus paisajes alpinos y chocolates artesanales.",
      latitud: -41.1335,
      longitud: -71.3103,
      popularidad: 90,
      destacado: 1,
    },
    {
      nombre: "Mendoza",
      pais: "Argentina",
      descripcion: "Región vinícola con impresionantes paisajes montañosos y bodegas de renombre mundial.",
      latitud: -32.8895,
      longitud: -68.8458,
      popularidad: 85,
      destacado: 1,
    },
    {
      nombre: "Córdoba",
      pais: "Argentina",
      descripcion: "Ciudad universitaria con rica historia colonial y hermosas sierras cercanas.",
      latitud: -31.4201,
      longitud: -64.1888,
      popularidad: 75,
      destacado: 0,
    },
    {
      nombre: "Salta",
      pais: "Argentina",
      descripcion: "Conocida por su arquitectura colonial bien conservada y paisajes del norte.",
      latitud: -24.7859,
      longitud: -65.4117,
      popularidad: 70,
      destacado: 0,
    },
  ]

  // Insert destinations one by one
  let inserted = 0
  destinations.forEach((destination) => {
    db.query(
      "INSERT INTO destinos (nombre, pais, descripcion, latitud, longitud, popularidad, destacado) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        destination.nombre,
        destination.pais,
        destination.descripcion,
        destination.latitud,
        destination.longitud,
        destination.popularidad,
        destination.destacado,
      ],
      (err, result) => {
        if (err) {
          console.error(`Error inserting destination ${destination.nombre}:`, err)
        } else {
          console.log(`Inserted destination: ${destination.nombre}`)
          inserted++

          // Check if all destinations have been inserted
          if (inserted === destinations.length) {
            console.log("All sample destinations inserted successfully!")
            db.end()
          }
        }
      },
    )
  })
}
