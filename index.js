const express = require("express");
const bodyParser = require("body-parser");
const db = require("./firebase");
const {
  validateInputFields,
  getAllSchools,
  haversine,
} = require("./Helper/helper");
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
  let inputError = validateInputFields(name, address, latitude, longitude);
  if (inputError != null || inputError != undefined) {
    res.status(400).json(inputError);
  } else {
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
  }
});

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
