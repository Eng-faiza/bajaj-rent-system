import dotenv from "dotenv"
import User from "../models/User.js"
import Bajaj from "../models/Bajaj.js"
import connectDB from "../config/database.js"

dotenv.config()

const seedData = async () => {
  try {
    await connectDB()

    console.log("Clearing existing data...")
    await Bajaj.deleteMany({})

    console.log("Creating sample Bajaj vehicles...")
    const sampleBajajs = [
      {
        model: "Bajaj Pulsar 150",
        registrationNumber: "MH-01-AB-1234",
        pricePerDay: 500,
        description: "Perfect for city commuting with excellent mileage and comfort.",
        isAvailable: true,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        model: "Bajaj Avenger 220",
        registrationNumber: "MH-01-CD-5678",
        pricePerDay: 750,
        description: "Cruiser bike ideal for long distance travel and highway rides.",
        isAvailable: true,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        model: "Bajaj Dominar 400",
        registrationNumber: "MH-01-EF-9012",
        pricePerDay: 1200,
        description: "High-performance motorcycle with advanced features and power.",
        isAvailable: true,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        model: "Bajaj CT 100",
        registrationNumber: "MH-01-GH-3456",
        pricePerDay: 300,
        description: "Economical and fuel-efficient bike for everyday use.",
        isAvailable: true,
        image: "/placeholder.svg?height=300&width=400",
      },
      {
        model: "Bajaj Platina 110",
        registrationNumber: "MH-01-IJ-7890",
        pricePerDay: 350,
        description: "Comfortable commuter bike with excellent suspension.",
        isAvailable: false,
        image: "/placeholder.svg?height=300&width=400",
      },
    ]

    const createdBajajs = await Bajaj.insertMany(sampleBajajs)
    console.log(`Created ${createdBajajs.length} sample vehicles`)

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: "admin@bajajrent.com" })
    if (!adminExists) {
      const adminUser = new User({
        name: "Admin User",
        email: "admin@bajajrent.com",
        password: "admin123",
        role: "admin",
      })
      await adminUser.save()
      console.log("Created admin user: admin@bajajrent.com / admin123")
    }

    console.log("✅ Database seeded successfully!")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedData()