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
  console.log("Successfully connected to the MySQL database!")

  // Test query
  db.query("SELECT * FROM usuarios LIMIT 5", (err, results) => {
    if (err) {
      console.error("Error executing query:", err)
      return
    }
    console.log("Sample users from database:")
    console.log(results)

    // Close the connection
    db.end((err) => {
      if (err) {
        console.error("Error closing connection:", err)
        return
      }
      console.log("Database connection closed.")
    })
  })
})
