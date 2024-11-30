const express = require("express");
const bodyParser = require("body-parser");
const db = require("./firebase");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

// Define a simple route
app.get("/", (req, res) => {
  res.json("Api is working Fine");
});

app.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;

  // Validate input data
  if (!name || !address || !latitude || !longitude) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Add school data to Firestore
    const schoolData = {
      name,
      address,
      latitude,
      longitude,
    };

    const docRef = await db.collection("user").add(schoolData);

    res
      .status(201)
      .json({ message: "School added successfully!", id: docRef.id });
  } catch (error) {
    console.error("Error adding school: ", error);
    res.status(500).json({ error: "Failed to add school." });
  }
});

async function getAllSchools() {
  try {
    const colRef = db.collection("user");
    const snapshot = await colRef.get();

    // Map through the documents and return an array of data
    const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    console.log(users); // Logs all documents in the "user" collection
    return users; // Return the retrieved users if needed
  } catch (error) {
    console.error("Error getting documents: ", error);
  }
}

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
app.get("/listSchools", async (req, res) => {
  const { latitude, longitude } = req.query;
  let finalData = [];
  // Validate input data
  if (!latitude || !longitude) {
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required." });
  }

  let results = await getAllSchools();
  if (results != undefined && results != null) {
    results.map((d) => {
      let distance = haversine(latitude, longitude, d.latitude, d.longitude);
      distance = Math.round(distance);
      if (distance <= 50) {
        finalData.push(d);
      }
    });
    res.json(finalData);
  } else {
    res.json("Something went wrong in your api");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
