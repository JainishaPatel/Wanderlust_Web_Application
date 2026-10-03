const Listing = require("./models/listing.js");
const Review = require("./models/reviews.js");
const Room = require("./models/rooms.js");
const { listingSchema, reviewSchema, roomSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");


module.exports.isLoggedIn = (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in to create listing!");
        return res.redirect("/login");
    }
    next();
}


module.exports.saveRedirectUrl = (req, res, next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Allow if current user is the owner OR admin
    if (res.locals.currentUser && 
        (listing.owner._id.equals(res.locals.currentUser._id) || res.locals.currentUser.role === "admin")) {
        return next();
    }

    req.flash("error", "You are not authorized to edit this listing.");
    return res.redirect(`/listings/${id}`);
};


module.exports.validateListing = (req, res, next)=>{
    let { error } = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


module.exports.validateReview = (req, res, next)=>{
    let { error } = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
        console.log(errMsg);
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
};


module.exports.validateRoom = async (req, res, next) => {
  const { id } = req.params; // parent listing ID

  // Ensure room object exists
  if (!req.body.room) req.body.room = {};

  // Attach listing ID for validation and saving
  req.body.room.listing = id;

  const { error } = roomSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    req.flash("error", errMsg);
    return res.redirect(`/listings/${id}`);
  }

  next();
};



module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    if (res.locals.currentUser && 
        (review.author._id.equals(res.locals.currentUser._id) || res.locals.currentUser.role === "admin")) {
        return next();
    }

    req.flash("error", "You are not authorized to modify this review.");
    return res.redirect(`/listings/${id}`);
};


module.exports.isRoomOwner = async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("owner");

    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    if (res.locals.currentUser && 
        (listing.owner._id.equals(res.locals.currentUser._id) || res.locals.currentUser.role === "admin")) {
        return next();
    }

    req.flash("error", "You are not authorized to manage this room.");
    return res.redirect(`/listings/${id}`);
};



// Only allow "host" or "admin" to create new listings
module.exports.isHostOrAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash("error", "You must be signed in first!");
        return res.redirect("/login");
    }
    if (req.user.role === "admin" || req.user.role === "host") {
        return next();
    }
    req.flash("error", "You don’t have permission to create a listing!");
    return res.redirect("/listings");
};



module.exports.attachImagesToBody = (req, res, next) => {
  if (!req.body.room) req.body.room = {};

  // Ensure images array exists (controller handles actual push)
  if (!req.body.room.images) req.body.room.images = [];

  next();
};

