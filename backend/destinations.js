const express = require("express")
const router = express.Router()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
const axios = require("axios")

// Get all destinations
router.get("/", async (req, res) => {
  try {
    const destinos = await prisma.destinos.findMany({
      orderBy: {
        popularidad: "desc",
      },
    })
    res.json(destinos)
  } catch (error) {
    console.error("Error fetching destinations:", error)
    res.status(500).json({ error: "Error fetching destinations" })
  }
})

// Get featured destinations
router.get("/featured", async (req, res) => {
  try {
    const featuredDestinos = await prisma.destinos.findMany({
      where: {
        destacado: true,
      },
      orderBy: {
        popularidad: "desc",
      },
      take: 5,
    })
    res.json(featuredDestinos)
  } catch (error) {
    console.error("Error fetching featured destinations:", error)
    res.status(500).json({ error: "Error fetching featured destinations" })
  }
})

// Get destination by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const destination = await prisma.destinos.findUnique({
      where: { id: Number(id) },
    })

    if (!destination) {
      return res.status(404).json({ error: "Destination not found" })
    }

    res.json(destination)
  } catch (error) {
    console.error("Error fetching destination:", error)
    res.status(500).json({ error: "Error fetching destination" })
  }
})

// Populate destinations from external API (admin only)
router.post("/populate", async (req, res) => {
  try {
    // This would be protected by admin authentication in a real app

    // Example of using an external API to populate destinations
    // In a real app, you would use a proper API key and error handling
    const response = await axios.get("https://restcountries.com/v3.1/name/argentina")
    const country = response.data[0]

    // Just an example - in a real app you'd get actual cities
    const cities = [
      { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
      { name: "Córdoba", lat: -31.4201, lng: -64.1888 },
      { name: "Rosario", lat: -32.9442, lng: -60.6505 },
      // Add more cities as needed
    ]

    // Insert cities into database
    for (const city of cities) {
      await prisma.destinos.create({
        data: {
          nombre: city.name,
          pais: "Argentina",
          latitud: city.lat,
          longitud: city.lng,
          popularidad: Math.floor(Math.random() * 100),
          destacado: Math.random() > 0.5,
        },
      })
    }

    res.json({ message: "Destinations populated successfully" })
  } catch (error) {
    console.error("Error populating destinations:", error)
    res.status(500).json({ error: "Error populating destinations" })
  }
})

module.exports = router
