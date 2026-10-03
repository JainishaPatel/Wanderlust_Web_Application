if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MAP_TOKEN value:", process.env.MAP_TOKEN);

const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

const MONGOOSE_URL = 'mongodb://127.0.0.1:27017/wanderlust';


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

async function addGeometry(listing) {
    let response = await geocodingClient.forwardGeocode({
        query: `${listing.location}, ${listing.country}`,
        limit: 1
    }).send();

    if (response.body.features.length) {
        listing.geometry = {
            type: "Point",
            coordinates: response.body.features[0].geometry.coordinates,
        };
    } else {
        console.log(`No geometry found for ${listing.location}, ${listing.country}`);
        // fallback to [0,0] so validation won’t fail
        listing.geometry = {
            type: "Point",
            coordinates: [0, 0]
        };
    }
    return listing;
}

const initDB = async ()=>{
    await Listing.deleteMany({});
    console.log("Old data cleared");

    
    let listingsWithGeo = [];
    for (let obj of initData.data) {
        let listing = { ...obj, owner: '68bd3b45a2f79a85ae0bd150' };
        let withGeo = await addGeometry(listing);
        listingsWithGeo.push(withGeo);
    }

    // Use the updated array here
    await Listing.insertMany( listingsWithGeo );
    console.log("Data was initialized with geometry");
    
}

initDB();


/*

const sampleListings = [
    {...},
    {...},
    {...}
];

const initData = {
    data: sampleListings
}


*/