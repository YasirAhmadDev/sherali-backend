import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Location from "../models/Location.js";

// Run once:  npm run seed:locations
//
// SAMPLE DATA ONLY. Coordinates are approximate and the district numbers are
// best guesses. Check and correct them with the Kabul Traffic Department
// (or edit them later from the Locations page).
const locations = [
  { name: "Karte Parwan", district: "PD3", lat: 34.517, lng: 69.147 },
  { name: "Karte Char", district: "PD6", lat: 34.5, lng: 69.132 },
  { name: "Shahre Naw", district: "PD10", lat: 34.53, lng: 69.17 },
  { name: "Qala-e-Fathullah", district: "PD10", lat: 34.533, lng: 69.162 },
  { name: "Dashte-Barchi", district: "PD13", lat: 34.504, lng: 69.1 },
  { name: "Darulaman Road", district: "PD7", lat: 34.488, lng: 69.1 },
  { name: "Khair Khana", district: "PD16", lat: 34.573, lng: 69.125 },
  { name: "Pul-e-Surkh", district: "PD12", lat: 34.539, lng: 69.219 },
  { name: "Char Rahi Qambar", district: "PD4", lat: 34.542, lng: 69.131 },
  { name: "Kote Sangi", district: "PD5", lat: 34.503, lng: 69.133 },
  { name: "Microrayan", district: "PD9", lat: 34.535, lng: 69.222 },
  { name: "Chaman-e-Hozori", district: "PD2", lat: 34.5155, lng: 69.1775 },
];

const run = async () => {
  await connectDB();

  const result = await Location.bulkWrite(
    locations.map((loc) => ({
      updateOne: { filter: { name: loc.name }, update: { $setOnInsert: loc }, upsert: true },
    }))
  );

  console.log(`Locations added: ${result.upsertedCount}, already existed: ${locations.length - result.upsertedCount}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
