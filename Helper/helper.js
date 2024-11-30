const db = require("../firebase");

function validateInputFields(name, address, latitude, longitude) {
  if (!name || !address || !latitude || !longitude) {
    return { error: "All fields are required." };
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return { error: "name must be in string." };
  }
  if (!address || typeof address !== "string" || !address.trim()) {
    return { error: "address must be in string." };
  }
  if (typeof latitude !== "number" || latitude < -90 || latitude > 90) {
    return { error: "Latitude must be a number between -90 and 90." };
  }
  if (typeof longitude !== "number" || longitude < -180 || longitude > 180) {
    return { error: "Longitude must be a number between -180 and 180." };
  }
}

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
module.exports = {
  validateInputFields,
  getAllSchools,
  haversine,
};
