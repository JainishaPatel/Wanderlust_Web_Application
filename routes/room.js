const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isRoomOwner, validateRoom, attachImagesToBody } = require("../middleware.js");
const roomController = require("../controllers/rooms.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// ---------------- ROUTES ---------------- //

// 1️⃣ Show all rooms for a listing & Create new room
router
  .route("/")
  .get(wrapAsync(roomController.showRooms))
  .post(
    isLoggedIn,
    upload.array("images", 10), // ✅ match input name in form: <input type="file" name="images" multiple>
    attachImagesToBody,
    validateRoom,
    wrapAsync(roomController.createRoom)
  );

// 2️⃣ Show form to add a new room
router.get(
  "/new",
  isLoggedIn,
  wrapAsync(roomController.renderNewRoomForm)
);

// 3️⃣ Update or delete a room
router
  .route("/:roomId")
  .put(
    isLoggedIn,
    isRoomOwner,
    upload.array("images", 10), // ✅ match input name in form
    attachImagesToBody,
    validateRoom,
    wrapAsync(roomController.updateRoom)
  )
  .delete(
    isLoggedIn,
    isRoomOwner,
    wrapAsync(roomController.deleteRoom)
  );

// 4️⃣ Edit a room (render edit form)
router.get(
  "/:roomId/edit",
  isLoggedIn,
  isRoomOwner,
  wrapAsync(roomController.renderEditRoomForm)
);

// 5️⃣ Manage room images page
router.get(
  "/:roomId/images",
  isLoggedIn,
  isRoomOwner,
  wrapAsync(roomController.manageImages)
);

// 6️⃣ Delete a single image from a room
router.delete(
  "/:roomId/images/delete",
  isLoggedIn,
  isRoomOwner,
  wrapAsync(roomController.deleteImage)
);

module.exports = router;
