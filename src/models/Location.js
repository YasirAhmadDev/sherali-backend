import mongoose from "mongoose";
import { DISTRICTS } from "../utils/constants.js";

const locationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 120 },
    district: { type: String, enum: DISTRICTS, required: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

locationSchema.index({ district: 1 });

export default mongoose.model("Location", locationSchema);
