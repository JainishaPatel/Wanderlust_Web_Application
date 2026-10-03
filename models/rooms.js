const mongoose = require("mongoose");
const { Schema } = mongoose;

const roomSchema = new Schema(
  {
    roomNumber: { type: Number },

    roomBeds: { type: Number, default: 1 },

    bedTypes: { type: [String], default: [] },

    occupancy: { type: Number, default: 1 },

    checkin: { type: String },

    checkout: { type: String },

    amenities: { type: [String], default: [] },

    rules: { type: String },

    price: { type: Number, required: true }, // ✅ Required for bookings

    bathroom: {
      type: String,
      enum: ["Attached Bathroom", "Shared Bathroom", "Private (Outside)"],
    },

    toiletType: {
      type: String,
      enum: ["Western Toilet", "Indian Toilet", "Both Available"],
    },

    floor: { type: Number },

    // ✅ Cloudinary images
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
      },
    ],

    isAvailable: { type: Boolean, default: true },

    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
module.exports = Room;
