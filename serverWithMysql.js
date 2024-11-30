const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Your MySQL username
  password: "Sql@07", // Your MySQL password
  database: "school_management",
});



// Connect to MySQL database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err);
    return;
  }
  console.log("Connected to MySQL database!");
});

// Add School API
app.post("/addSchool", (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate input data
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const query =
    "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)";
  db.query(query, [name, address, latitude, longitude], (err, result) => {
    if (err) {
      console.error("Error inserting school:", err);
      return res.status(500).json({ error: "Database error." });
    }
    res
      .status(201)
      .json({ id: result.insertId, name, address, latitude, longitude });
  });
});

// Haversine formula to calculate the distance between two points on the Earth's surface
function haversine(lat1, lon1, lat2, lon2) {
  // Convert latitude and longitude from degrees to radians
  const toRadians = (degrees) => degrees * (Math.PI / 180);

  lat1 = toRadians(lat1);
  lon1 = toRadians(lon1);
  lat2 = toRadians(lat2);
  lon2 = toRadians(lon2);

  // Haversine formula
  const dlon = lon2 - lon1;
  const dlat = lat2 - lat1;
  const a =
    Math.sin(dlat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dlon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(a));

  // Radius of Earth in kilometers
  const R = 6371;
  return c * R; // Distance in kilometers
}

// List Schools API
app.get("/listSchools", (req, res) => {
  const { latitude, longitude } = req.query;
let finalData = []
  // Validate input data
  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required." });
  }

  // Fetch all schools from the database
  const query = "SELECT * FROM schools";

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching schools:", err);
      return res.status(500).json({ error: "Database error." });
    }

    results.map((d) =>{
        let distance = haversine(latitude,longitude,d.latitude,d.longitude)
        distance = Math.round(distance);
        if (distance <= 50) {
            finalData.push(d)
        }
    })
    res.json(finalData);
   
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
