// repairRooms.js
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Room = require("./models/rooms.js");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

async function repairRooms() {
  const listings = await Listing.find({}).populate("rooms");

  for (let listing of listings) {
    for (let room of listing.rooms) {
      if (!room.listing) {
        console.log(`Fixing room ${room._id} -> ${listing._id}`);
        room.listing = listing._id;
        await room.save();
      }
    }
  }

  console.log("Repair complete ✅");
  mongoose.connection.close();
}

repairRooms();
