const Joi = require('joi');


// ---------------- Listing Schema ----------------
module.exports.listingSchema = Joi.object({
    Listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required().min(0),
        location: Joi.string().required(),
        country: Joi.array().items(Joi.string()).min(1).required(),

        geometry: Joi.object({
            type: Joi.string().valid("Point").required(),
            coordinates: Joi.array().items(
                Joi.number().min(-180).max(180), // longitude
                Joi.number().min(-90).max(90)    // latitude
            ).length(2).required()
        }).required(),

        category: Joi.string().valid("Iconic Cities", "Mountains", "Castles", "Swimming Pool", "Camping", "Farms", "Arctic", "Domes", "Boats").required(),
        images: Joi.array().items(
            Joi.object({
                url: Joi.string().uri().required(),
                filename: Joi.string().required()
            })
        ).min(1).required(), // at least 1 image required

        

    }).required(),

});



// ---------------- Review Schema ----------------
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});



// ---------------- User Schema ----------------
module.exports.userValidationSchema = Joi.object({
    user: Joi.object({
        email: Joi.string()
            .email({ tlds: { allow: false } }) // valid email format
            .required()
    }).required()
});



// ---------------- Room Schema ----------------


module.exports.roomSchema = Joi.object({
  room: Joi.object({
    roomNumber: Joi.number().integer().min(1).required(),
    roomBeds: Joi.number().integer().min(1).required(),
    bedTypes: Joi.array().items(Joi.string().valid("King", "Queen", "Double", "Single")).default([]),
    occupancy: Joi.number().integer().min(1).required(),
    checkin: Joi.string().required(),
    checkout: Joi.string().required(),
    amenities: Joi.array().items(Joi.string().valid("Wi-Fi", "TV", "Air Conditioning")).default([]),
    rules: Joi.string().allow("").optional(),
    floor: Joi.number().integer().min(0).optional(),
    price: Joi.number().min(0).required(),
    bathroom: Joi.string().valid("Attached Bathroom", "Shared Bathroom", "Private (Outside)").required(),
    toiletType: Joi.string().valid("Western Toilet", "Indian Toilet", "Both Available").required(),
    isAvailable: Joi.boolean().optional(),
    images: Joi.array()
      .items(
        Joi.object({
          url: Joi.string().uri().required(),
          filename: Joi.string().required()
        })
      )
      .optional()
      .default([]),
    deleteImages: Joi.array().items(Joi.string()).optional().default([]),
    listing: Joi.string().required()

  }).required()
});


