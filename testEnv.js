// testEnv.js
require("dotenv").config();

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Cloud Name:", process.env.CLOUD_NAME);
console.log("Cloud API Key:", process.env.CLOUD_API_KEY);
console.log("Cloud API Secret:", process.env.CLOUD_API_SECRET);
console.log("Mapbox Token:", process.env.MAP_TOKEN);
