const Listing = require("../models/listing");
const Room = require("../models/rooms");
const { cloudinary } = require("../cloudConfig.js");

// ---------------- Render New Room Form ----------------
module.exports.renderNewRoomForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/room.ejs", { listing });
};

// ---------------- Create New Room ----------------
module.exports.createRoom = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  const newRoom = new Room(req.body.room);
  newRoom.listing = listing._id; // ✅ Link room to the listing
 

  
 // Add uploaded images
  if (req.files && req.files.length > 0) {
    newRoom.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
  }

   console.log(newRoom);

  await newRoom.save();
  listing.rooms.push(newRoom);
  await listing.save();

  req.flash("success", "Room added successfully!");
  res.redirect(`/listings/${id}/rooms`);
};

// ---------------- Show All Rooms for a Listing ----------------
module.exports.showRooms = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id).populate({
    path: "rooms",
    model: "Room",
    options: { sort: { createdAt: -1 } }
  });

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }
  res.render("listings/showRoom.ejs", { listing });
};

// ---------------- Render Edit Room Form ----------------
module.exports.renderEditRoomForm = async (req, res) => {
  const { id, roomId } = req.params;
  const listing = await Listing.findById(id);
  const room = await Room.findById(roomId);

  if (!listing || !room) {
    req.flash("error", "Room or Listing not found!");
    return res.redirect(`/listings/${id}/rooms`);
  }

  res.render("listings/editRoom.ejs", { listing, room });
};

// ---------------- Update Room ----------------
module.exports.updateRoom = async (req, res) => {
  const { id, roomId } = req.params;
  const room = await Room.findById(roomId);

  if (!room) {
    req.flash("error", "Room not found!");
    return res.redirect(`/listings/${id}/rooms`);
  }

  // Update all fields except images
  const { images: _, deleteImages, ...roomData } = req.body.room;
  Object.assign(room, roomData);

  // Append newly uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map(f => ({ url: f.path, filename: f.filename }));
    room.images.push(...newImages);
  }

  // Handle deletions
  if (deleteImages) {
    const deleteArray = Array.isArray(deleteImages) ? deleteImages : [deleteImages];
    if (deleteArray.length >= room.images.length) {
      req.flash("error", "You must keep at least one image!");
      return res.redirect(`/listings/${id}/rooms/${roomId}/edit`);
    }
    for (let filename of deleteArray) {
      await cloudinary.uploader.destroy(filename);
    }
    room.images = room.images.filter(img => !deleteArray.includes(img.filename));
  }

  await room.save();
  req.flash("success", "Room updated successfully!");
  res.redirect(`/listings/${id}/rooms`);
};

// ---------------- Delete Room ----------------
module.exports.deleteRoom = async (req, res) => {
  const { id, roomId } = req.params;
  const room = await Room.findById(roomId);
  if (!room) {
    req.flash("error", "Room not found!");
    return res.redirect(`/listings/${id}/rooms`);
  }

  if (room.images && room.images.length > 0) {
    try {
      await Promise.all(room.images.map(img => cloudinary.uploader.destroy(img.filename)));
    } catch (err) {
      console.error("Cloudinary bulk delete failed:", err);
    }
  }

  await Listing.findByIdAndUpdate(id, { $pull: { rooms: roomId } });
  await Room.findByIdAndDelete(roomId);

  req.flash("success", "Room deleted successfully!");
  res.redirect(`/listings/${id}/rooms`);
};

// ---------------- Delete Single Image ----------------
module.exports.deleteImage = async (req, res) => {
  const { id, roomId } = req.params;
  const { filename } = req.body;

  const room = await Room.findById(roomId);
  if (!room) {
    req.flash("error", "Room not found!");
    return res.redirect(`/listings/${id}/rooms`);
  }

  if (!filename) {
    req.flash("error", "No image specified for deletion!");
    return res.redirect(`/listings/${id}/rooms/${roomId}/images`);
  }

  if (room.images.length <= 1) {
    req.flash("error", "You must keep at least one image!");
    return res.redirect(`/listings/${id}/rooms/${roomId}/images`);
  }

  await cloudinary.uploader.destroy(filename);
  room.images = room.images.filter(img => img.filename !== filename);
  await room.save();

  req.flash("success", "Image deleted successfully!");
  res.redirect(`/listings/${id}/rooms/${roomId}/images`);
};

// ---------------- Manage Room Images Page ----------------
module.exports.manageImages = async (req, res) => {
  const { id, roomId } = req.params;
  const listing = await Listing.findById(id);
  const room = await Room.findById(roomId);

  if (!listing || !room) {
    req.flash("error", "Listing or Room not found!");
    return res.redirect(`/listings/${id}/rooms`);
  }

  res.render("listings/manageImages.ejs", { listing, room });
};
