import mongoose from "mongoose"

const bajajSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
    },
    pricePerDay: {
      type: Number,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: "/placeholder.svg?height=200&width=300",
    },
    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Bajaj", bajajSchema)
