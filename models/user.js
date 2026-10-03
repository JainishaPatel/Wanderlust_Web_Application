const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String, // full name of user
        trim: true
    },
    role: { 
        type: String, 
        enum: ["user", "host", "admin"], // define access levels
        default: "user"
    },
    profileImage: {
        url: String,
        filename: String
    },
    phone: {
        type: String // optional contact number
    },
    address: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String
    }
}, { timestamps: true }); // automatically adds createdAt & updatedAt

// Use PassportLocalMongoose for authentication
// By default adds username, hash, salt, and authentication methods
// Optionally, you can use email as the login username
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
