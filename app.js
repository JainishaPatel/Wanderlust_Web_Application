if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MAP_TOKEN:", process.env.MAP_TOKEN ? "Loaded ✅" : "❌ Missing");

const express = require("express");
const app = express();

const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js")
const reviewRouter = require("./routes/review.js");
const roomRoutes = require("./routes/room.js");
const userRouter = require("./routes/user.js");


const MONGOOSE_URL = 'mongodb://127.0.0.1:27017/wanderlust';

// ----- View Engine -----
app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// ----- Middleware -----
app.use(express.static(path.join(__dirname, "/public") ) );
app.use(express.urlencoded( {extended: true} ) );
app.use(methodOverride('_method'));

main()
    .then(()=>{
        console.log("Database in connected")
    })
    .catch((err)=>{
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGOOSE_URL);
}


const sessionOptions = {
    secret: "mySuperSecretCode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 *24 * 60 * 60 * 1000,
        maxAge: 7 *24 * 60 * 60 * 1000,
        httpOnly: true,
    }
};


app.use(session(sessionOptions));
app.use(flash());


app.use(passport.initialize());
app.use(passport.session());
// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// locals must come before routes
app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});


// ----- Routes -----
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/rooms", roomRoutes);
app.use("/", userRouter);


// 404 handler
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});


// ----- Error handler -----
app.use((err, req, res, next)=>{
    let { statusCode = 500, message = "Something was wrong !" } = err;
    res.status(statusCode).render("error.ejs", { err });
    // res.status(statusCode).send(message);
});


app.listen(8080, ()=>{
    console.log("Listening on port: 8080");
});




/*
// ----- 404 handler (after all routes) -----
app.all("*", (req, res) => {
  res.status(404).render("error.ejs", {
    err: { statusCode: 404, message: "Page Not Found" },
  });
});

app.get("/demouser", async(req, res)=>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });
    
    let registerUser = await User.register(fakeUser, "helloworld");
    res.send(registerUser);
});

app.get("/testListing", async (req , res)=>{
    let userListing = new Listing({
        title: "My Cottage at Golden Beach",
        description: "Escape to this charming beachfront cottage for a relaxing getaway. Enjoy stunning ocean views and easy access to the beach.",
        price: 1500,
        location: "California",
        country: "United States",
    });

    await userListing.save();

    res.send("Success");
});

app.get("/", (req , res)=>{
    res.send("Root path is workinng");
});
*/
