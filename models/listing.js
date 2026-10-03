const mongoose = require('mongoose');
const Review = require("./reviews.js");
const Room = require("./rooms.js");

const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: [
            {
                type: String,
                enum: [
                    "Iconic Cities",
                    "Mountains",
                    "Castles",
                    "Swimming Pool",
                    "Camping",
                    "Farms",
                    "Arctic",
                    "Domes",
                    "Boats",
                    "Rooms"
                ]
            }
        ],
        required: true,
        validate: {
            validator: function (arr) {
                return arr.length > 0; // must pick at least one
            },
            message: "At least one category is required."
        }
    },

    // ✅ Multiple images instead of single image
    images: [
        {
            url: { type: String, required: true },
            filename: { type: String, required: true }
        }
    ],

    price: {
        type: Number,
        required: true
    },

    // ✅ Address details
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String
    },

    location: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },

    // ✅ Contact info
    contact: {
        phone: String,
        email: String
    },

    // ✅ Property-level facilities
    propertyFacilities: [String],

    // ✅ Booking type (entire villa or per room)
    bookingType: {
        type: String,
        enum: ["Entire Property", "Per Room"],
        default: "Per Room"
    },

    // ✅ Property-level check-in / check-out
    checkin: {
        type: String,
        default: "12:00 PM"
    },
    checkout: {
        type: String,
        default: "11:00 AM"
    },

    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },

    views: {
        type: Number,
        default: 0
    },

    rooms: [
        {
            type: Schema.Types.ObjectId,
            ref: "Room"
        }
    ]

}, { timestamps: true }); // ✅ adds createdAt and updatedAt

// Cascade delete related data
listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        // Delete related reviews
        await Review.deleteMany({ _id: { $in: listing.reviews } });

        // Delete related rooms
        await Room.deleteMany({ _id: { $in: listing.rooms } });
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;
