const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
const { cloudinary } = require("../cloudConfig.js");


// ---------------- Index ----------------
module.exports.index = async (req, res)=>{
    let { q } = req.query;
    let allListings;
    
     if (q) {
        if (q === "Trending") {
            allListings = await Listing.find().sort({ views: -1 }).limit(10);
        } else {
            allListings = await Listing.find({
                $or: [
                    { location: { $regex: q, $options: 'i' } },
                    { country: { $regex: q, $options: 'i' } },
                    { category: { $regex: q, $options: 'i' } }
                ]
            });
        }
    } else {
        allListings = await Listing.find();
    }

    // console.log(allListing);
    res.render("listings/index.ejs", { allListings, q } );
}


// ---------------- Render New Form ----------------
module.exports.renderNewForm = (req , res)=>{
    res.render("listings/new.ejs");
}


// ---------------- Create Listing ----------------
module.exports.createListing = async (req , res)=>{
    const response = await geocodingClient.forwardGeocode({
        query: req.body.Listing.location,
        limit: 1,
    })
    .send();

    if (!response.body.features.length) {
        req.flash("error", "Invalid location. Please try again.");
        return res.redirect("/listings/new");
    }

    // console.log(response.body.features[0].geometry);
    const geoData = response.body.features[0].geometry; // { type: 'Point', coordinates: [lng, lat] }
        
    // let newListing = new Listing({});
    // console.log(req.body);
    const newListing = new Listing( req.body.Listing );

    // console.log(req.user);
    newListing.owner = req.user._id;
    
    newListing.geometry = geoData;

     // Handle multiple images
    if (req.files && req.files.length > 0) {
        newListing.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    }

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
}

// ---------------- Show Listing ----------------
module.exports.showListing = async (req , res)=>{
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { $inc : {views: 1} } );
    const listing = await Listing.findById(id).populate({ path: "reviews", populate:({path: "author"}) }).populate("owner").populate("rooms");
    // console.log(listing);

    if(!listing){
        req.flash("error", "Listing you requested for does not exits!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing } );
}

// ---------------- Render Edit Form ----------------
module.exports.renderEditForm = async (req , res)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        return res.redirect("/listings");
    }

    res.render("listings/edit.ejs", { listing });
}

// ---------------- Update Listing ----------------
module.exports.updateListing = async (req , res)=>{
    // console.log(req.body.Listing);
    let { id } = req.params;
    let updateListing = req.body.Listing;

    let listing = await Listing.findByIdAndUpdate(id, {...updateListing}, { new: true } );

    // append new images instead of replacing
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
        listing.images.push(...newImages);
    }

     // Delete selected images
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename); // remove from Cloudinary
        }
        // remove from MongoDB by filename
        await listing.updateOne({
            $pull: { images: { filename: { $in: req.body.deleteImages } } }
        });
    }

    await listing.save();

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

// ---------------- Destroy Listing ----------------
module.exports.destroyListing = async (req , res)=>{
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    // console.log(deleteListing);

    if (deleteListing.images && deleteListing.images.length > 0) {
        for (let img of deleteListing.images) {
            await cloudinary.uploader.destroy(img.filename);
        }
    }

    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}

// ---------------- Delete Single Image ----------------
module.exports.deleteImage = async (req, res) => {
  let { id, imgId } = req.params;
  let listing = await Listing.findById(id);
  let image = listing.images.id(imgId);

  if (image) {
    await cloudinary.uploader.destroy(image.filename);
    await listing.updateOne({ $pull: { images: { _id: imgId } } });
  }

  req.flash("success", "Image Deleted!");
  res.redirect(`/listings/${id}/edit`);
};




