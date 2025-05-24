import express from "express"
import multer from "multer"
import path from "path"
import Bajaj from "../models/Bajaj.js"
import { authenticateToken, requireAdmin } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, "bajaj-" + uniqueSuffix + path.extname(file.originalname))
  },
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

// Get all Bajaj vehicles
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all Bajaj vehicles...")
    const bajajs = await Bajaj.find().sort({ createdAt: -1 })
    console.log(`Found ${bajajs.length} vehicles`)
    res.json(bajajs)
  } catch (error) {
    console.error("Error fetching Bajaj vehicles:", error)
    res.status(500).json({
      message: "Failed to fetch vehicles",
      error: error.message,
    })
  }
})

// Get available Bajaj vehicles
router.get("/available", async (req, res) => {
  try {
    console.log("Fetching available Bajaj vehicles...")
    const bajajs = await Bajaj.find({ isAvailable: true }).sort({ createdAt: -1 })
    console.log(`Found ${bajajs.length} available vehicles`)
    res.json(bajajs)
  } catch (error) {
    console.error("Error fetching available Bajaj vehicles:", error)
    res.status(500).json({
      message: "Failed to fetch available vehicles",
      error: error.message,
    })
  }
})

// Add new Bajaj with image upload (Admin only)
router.post("/", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { model, registrationNumber, pricePerDay, description } = req.body

    const existingBajaj = await Bajaj.findOne({ registrationNumber })
    if (existingBajaj) {
      return res.status(400).json({ message: "Bajaj with this registration number already exists" })
    }

    const bajaj = new Bajaj({
      model,
      registrationNumber,
      pricePerDay: Number(pricePerDay),
      description,
      image: req.file ? `/uploads/${req.file.filename}` : "/placeholder.svg?height=300&width=400",
    })

    await bajaj.save()
    res.status(201).json(bajaj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update Bajaj with image upload (Admin only)
router.put("/:id", authenticateToken, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { model, registrationNumber, pricePerDay, description } = req.body

    const updateData = {
      model,
      registrationNumber,
      pricePerDay: Number(pricePerDay),
      description,
    }

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`
    }

    const bajaj = await Bajaj.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!bajaj) {
      return res.status(404).json({ message: "Bajaj not found" })
    }
    res.json(bajaj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete Bajaj (Admin only)
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const bajaj = await Bajaj.findByIdAndDelete(req.params.id)
    if (!bajaj) {
      return res.status(404).json({ message: "Bajaj not found" })
    }
    res.json({ message: "Bajaj deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Update Bajaj availability
router.patch("/:id/availability", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isAvailable } = req.body
    const bajaj = await Bajaj.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true })
    if (!bajaj) {
      return res.status(404).json({ message: "Bajaj not found" })
    }
    res.json(bajaj)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
