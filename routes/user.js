const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");
const authenticateUser = passport.authenticate("local", { failureRedirect:"/login", failureFlash: true } );


router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));
    

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, authenticateUser, userController.login);


router.get("/logout", userController.logout);

module.exports = router;

// router.get("/signup", userController.renderSignupForm);
// router.post("/signup", wrapAsync(userController.signup));

// router.get("/login", userController.renderLoginForm);
// router.post("/login", saveRedirectUrl, authenticateUser, userController.login);

