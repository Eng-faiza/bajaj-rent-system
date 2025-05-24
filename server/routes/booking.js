import express from "express"
import Booking from "../models/Booking.js"
import Bajaj from "../models/Bajaj.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Create booking
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { bajajId, startDate, endDate } = req.body

    // Validate required fields
    if (!bajajId || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const bajaj = await Bajaj.findById(bajajId)
    if (!bajaj) {
      return res.status(404).json({ message: "Bajaj not found" })
    }

    if (!bajaj.isAvailable) {
      return res.status(400).json({ message: "Bajaj is not available" })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate dates
    if (start >= end) {
      return res.status(400).json({ message: "End date must be after start date" })
    }

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    const totalAmount = days * bajaj.pricePerDay

    const booking = new Booking({
      user: req.user.userId,
      bajaj: bajajId,
      startDate: start,
      endDate: end,
      totalAmount,
    })

    await booking.save()

    // Update Bajaj availability
    await Bajaj.findByIdAndUpdate(bajajId, { isAvailable: false })

    const populatedBooking = await Booking.findById(booking._id)
      .populate("bajaj", "model registrationNumber pricePerDay image")
      .populate("user", "name email")

    res.status(201).json(populatedBooking)
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

// Get user bookings
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    console.log("Fetching bookings for user:", req.user.userId)

    // Check if user exists and has valid ID
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Invalid user authentication" })
    }

    const bookings = await Booking.find({ user: req.user.userId })
      .populate({
        path: "bajaj",
        select: "model registrationNumber pricePerDay image",
      })
      .sort({ createdAt: -1 })
      .lean()

    console.log(`Found ${bookings.length} bookings for user ${req.user.userId}`)

    // Handle cases where referenced documents might be deleted
    const validBookings = bookings.map((booking) => ({
      ...booking,
      bajaj: booking.bajaj || {
        model: "Deleted Vehicle",
        registrationNumber: "N/A",
        pricePerDay: 0,
        image: "/placeholder.svg?height=200&width=300",
      },
    }))

    res.json(validBookings)
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

// Get all bookings (Admin only)
router.get("/all", authenticateToken, async (req, res) => {
  try {
    console.log("Admin fetching all bookings...")
    console.log("User role:", req.user?.role)
    console.log("User ID:", req.user?.userId)

    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Authentication required" })
    }

    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    // Try to fetch bookings with error handling for each step
    let bookings = []

    try {
      bookings = await Booking.find()
        .populate({
          path: "bajaj",
          select: "model registrationNumber pricePerDay image",
        })
        .populate({
          path: "user",
          select: "name email",
        })
        .sort({ createdAt: -1 })
        .lean()

      console.log(`Successfully fetched ${bookings.length} bookings`)
    } catch (populateError) {
      console.error("Error with populate:", populateError)

      // Fallback: fetch without populate
      bookings = await Booking.find().sort({ createdAt: -1 }).lean()
      console.log(`Fetched ${bookings.length} bookings without populate`)
    }

    // Handle cases where referenced documents might be deleted
    const validBookings = bookings.map((booking) => ({
      ...booking,
      bajaj: booking.bajaj || {
        _id: "deleted",
        model: "Deleted Vehicle",
        registrationNumber: "N/A",
        pricePerDay: 0,
        image: "/placeholder.svg?height=200&width=300",
      },
      user: booking.user || {
        _id: "deleted",
        name: "Deleted User",
        email: "N/A",
      },
    }))

    console.log(`Returning ${validBookings.length} processed bookings`)
    res.json(validBookings)
  } catch (error) {
    console.error("Error fetching all bookings:", error)
    console.error("Error stack:", error.stack)
    res.status(500).json({
      message: "Internal server error while fetching bookings",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Update booking status
router.patch("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.body
    const bookingId = req.params.id

    console.log(`Updating booking ${bookingId} status to ${status}`)

    // Validate status
    const validStatuses = ["pending", "confirmed", "completed", "cancelled"]
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Check if user has permission to update this booking
    if (req.user.role !== "admin" && booking.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Update booking status
    booking.status = status
    await booking.save()

    // If booking is completed or cancelled, make Bajaj available again
    if (status === "completed" || status === "cancelled") {
      await Bajaj.findByIdAndUpdate(booking.bajaj, { isAvailable: true })
    } else if (status === "confirmed") {
      await Bajaj.findByIdAndUpdate(booking.bajaj, { isAvailable: false })
    }

    const updatedBooking = await Booking.findById(bookingId)
      .populate("bajaj", "model registrationNumber pricePerDay image")
      .populate("user", "name email")

    res.json(updatedBooking)
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

// Delete booking (Admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin role required." })
    }

    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    // Make the Bajaj available again
    if (booking.bajaj) {
      await Bajaj.findByIdAndUpdate(booking.bajaj, { isAvailable: true })
    }

    await Booking.findByIdAndDelete(req.params.id)

    res.json({ message: "Booking deleted successfully" })
  } catch (error) {
    console.error("Error deleting booking:", error)
    res.status(500).json({ message: "Internal server error", error: error.message })
  }
})

// Health check for bookings
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Booking API",
    timestamp: new Date().toISOString(),
  })
})

export default router
