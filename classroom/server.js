const express = require("express");
const app = express();
const users = require("./routes/user.js")
const posts = require("./routes/post.js");
const cookieParser = require('cookie-parser')
app.use(cookieParser("secretcode"));
const session = require('express-session')
const flash = require('connect-flash');
const path = require("path");

app.set("viw engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

const sessionOption = {
        secret: "mySuperSecretString",
        resave: false,
        saveUninitialized: true
}

app.use(session(sessionOption));  // session() as a middle-ware
app.use(flash());


app.use((req, res, next)=>{
    res.locals.errorMsg = req.flash("error");
    res.locals.successMsg = req.flash("success");
    next();
});

app.get("/register", (req, res)=>{
    let { name = "anonymous" } = req.query;
    req.session.name = name;
    if(name === "anonymous"){
        req.flash("error","user not registered !");
    } else {
        req.flash("success", "user registered successfully !");
    }
    res.redirect("/hello");
});

app.get("/hello", (req, res)=>{
    // console.log(req.flash("success"));
    // const msg = req.flash("success");
    // const message = msg[0];
    // console.log(msg[0]);
    res.render("msg.ejs", {name: req.session.name} );
});


// app.get("/reqCount", (req, res)=>{
//     if(req.session.count){
//         req.session.count++;
//     } else {
//         req.session.count = 1;
//     }
//     res.send(`You sent a request ${req.session.count} time`);
// });

// app.get("/test", (req, res)=>{
//     res.send("test successful !");
// });

// app.get("/getSignedCookie", (req, res)=>{
//     res.cookie("made-in", "India", {signed: true});
//     res.send("Signed cookie send!");
// });

// app.get("/verify", (req, res)=>{
//     console.log(req.signedCookies);
//     res.send("Cookie was verify");
// });

// app.get("/getcookies", (req, res)=>{
//     res.cookie("greet", "hello");
//     res.cookie("madeIn", "India");
//     res.send("sent you some cookies!");
// });

// app.get("/greet", (req, res)=>{
//     let { name="Jenny" } = req.cookies;
//     res.send(`Hi, ${name}`);
// });

// app.get("/", (req, res)=>{
//     console.dir(req.cookies);
//     res.send("Root is working");

// });

// app.use("/users", users );
// app.use("/posts", posts);

app.listen(3000, ()=>{
    console.log("server is listening to 3000")
});

