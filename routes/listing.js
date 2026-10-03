const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing,  isHostOrAdmin,} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });


router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn,  isHostOrAdmin, validateListing, upload.array('images', 10), wrapAsync(listingController.createListing));
   

// GET Route :- Show Create Listing Page
router.get("/new", isLoggedIn,  isHostOrAdmin, listingController.renderNewForm);


router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, validateListing, upload.array('images', 10), wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));


// GET Route :- Show Edit Page 
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));


router.delete("/listings/:id/images/:imgId", wrapAsync(listingController.deleteImage));







module.exports = router;



// // GET Route :- Show All Listings
// router.get("/", wrapAsync(listingController.index));

// // POST Route :- Post new listing info or details on "/listings"
// router.post("/", isLoggedIn, validateListing, wrapAsync(listingController.createListing));

// // GET Route :- Show Individual Listing
// router.get("/:id", wrapAsync(listingController.showListing));

// // PUT or UPDATE Route :- Update Listing
// router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing));

// // DELETE Route :- Delete Listing
// router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));