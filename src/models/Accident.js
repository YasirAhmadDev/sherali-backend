import mongoose from "mongoose";
import {
  DISTRICTS,
  ACCIDENT_TYPES,
  ACCIDENT_CAUSES,
  VEHICLE_TYPES,
  SEVERITIES,
} from "../utils/constants.js";
import { calculateSeverity } from "../utils/severity.js";

const vehicleSchema = new mongoose.Schema(
  {
    type: { type: String, enum: VEHICLE_TYPES, required: true },
    plate: { type: String, trim: true, uppercase: true, maxlength: 20 },
  },
  { _id: false }
);

const accidentSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    district: { type: String, enum: DISTRICTS, required: true },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    roadName: { type: String, trim: true, maxlength: 150 },
    coordinates: {
      lat: { type: Number, min: -90, max: 90 },
      lng: { type: Number, min: -180, max: 180 },
    },
    type: { type: String, enum: ACCIDENT_TYPES, required: true },
    cause: { type: String, enum: ACCIDENT_CAUSES, required: true },
    vehicles: { type: [vehicleSchema], default: [] },
    injured: { type: Number, min: 0, default: 0 },
    deaths: { type: Number, min: 0, default: 0 },
    severity: { type: String, enum: SEVERITIES }, // auto-calculated
    photos: { type: [String], default: [] }, // file names inside /uploads
    notes: { type: String, trim: true, maxlength: 1000 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Soft delete: records are never removed from the database
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

accidentSchema.pre("validate", function () {
  this.severity = calculateSeverity(this.injured, this.deaths);
});

accidentSchema.index({ isDeleted: 1, date: -1 });
accidentSchema.index({ district: 1, date: -1 });
accidentSchema.index({ location: 1 });
accidentSchema.index({ type: 1 });
accidentSchema.index({ cause: 1 });

export default mongoose.model("Accident", accidentSchema);
