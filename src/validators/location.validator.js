import { z } from "zod";
import { DISTRICTS } from "../utils/constants.js";
import { latitude, longitude } from "./common.js";

const base = z.object({
  name: z.string().trim().min(2).max(120),
  district: z.enum(DISTRICTS),
  lat: latitude,
  lng: longitude,
  isActive: z.boolean(),
});

export const createLocationSchema = base.omit({ isActive: true });
export const updateLocationSchema = base.partial();

export const listLocationsQuerySchema = z.object({
  district: z.enum(DISTRICTS).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  search: z.string().trim().max(80).optional(),
});
