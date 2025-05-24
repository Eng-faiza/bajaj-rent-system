import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
import authRoutes from "./routes/auth.js"
import bajajRoutes from "./routes/bajaj.js"
import bookingRoutes from "./routes/booking.js"
import connectDB from "./config/database.js"
import { errorHandler, notFound } from "./middleware/errorHandler.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT

// Middleware
app.use(cors())
app.use(express.json())

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Connect to MongoDB
connectDB()

  // Add a simple health check routemongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Database connection error:", err));

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/bajaj", bajajRoutes)
app.use("/api/booking", bookingRoutes)

// Add a catch-all route for API debugging
app.get("/api/*", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    path: req.path,
    method: req.method,
  })
})

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
