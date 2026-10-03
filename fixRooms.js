const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Room = require("./models/rooms");

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const listings = await Listing.find({});

    for (let listing of listings) {
      let fixedRooms = [];

      for (let room of listing.rooms) {
        if (room && room._id) {
          // already a Room ObjectId
          fixedRooms.push(room._id);
        } else if (room && room.roomNumber) {
          // embedded Room object → save it properly
          const newRoom = new Room({
            ...room,
            listing: listing._id,
          });
          await newRoom.save();
          fixedRooms.push(newRoom._id);
          console.log(`✅ Created Room ${newRoom._id} for Listing ${listing._id}`);
        }
      }

      listing.rooms = fixedRooms;
      await listing.save();
      console.log(`✔ Fixed Listing ${listing._id}`);
    }

    console.log("🎉 Migration complete!");
    mongoose.connection.close();
  } catch (err) {
    console.error("❌ Migration failed:", err);
    mongoose.connection.close();
  }
})();
