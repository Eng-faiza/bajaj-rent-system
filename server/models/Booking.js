import mongoose from "mongoose"

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    bajaj: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bajaj",
      required: [true, "Bajaj is required"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      validate: {
        validator: (value) => value >= new Date().setHours(0, 0, 0, 0),
        message: "Start date cannot be in the past",
      },
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate
        },
        message: "End date must be after start date",
      },
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed"],
        message: "Status must be one of: pending, confirmed, cancelled, completed",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

// Index for better query performance
bookingSchema.index({ user: 1, createdAt: -1 })
bookingSchema.index({ bajaj: 1 })
bookingSchema.index({ status: 1 })

export default mongoose.model("Booking", bookingSchema)
