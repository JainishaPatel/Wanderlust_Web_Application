const mongoose = require("mongoose");
const User = require("./models/user"); // adjust path if needed

mongoose.connect("mongodb://127.0.0.1:27017/wanderlust")
  .then(() => console.log("DB Connected"))
  .catch(err => console.error("DB Connection Error:", err));

async function createUser() {
  try {
    const user = new User({ email: "jack72@gmail.com", username: "Jack", role: "admin" });
    const registeredUser = await User.register(user, "jack72"); 
    console.log("User created:", registeredUser);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

createUser();
