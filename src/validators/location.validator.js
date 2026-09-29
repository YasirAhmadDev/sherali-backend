import { z } from "zod";
import { DISTRICTS } from "../utils/constants.js";
import { latitude, longitude } from "./common.js";

const base = z.object({
  name: z.string().trim().min(2).max(120),
  district: z.enum(DISTRICTS),
  // Optional now: both must be given together, or both left out
  lat: latitude.optional(),
  lng: longitude.optional(),
  isActive: z.boolean(),
});

export const createLocationSchema = base
  .omit({ isActive: true })
  .refine((d) => (d.lat === undefined) === (d.lng === undefined), {
    message: "Provide both latitude and longitude, or leave both empty",
    path: ["lng"],
  });

export const updateLocationSchema = base.partial().refine(
  (d) => (d.lat === undefined) === (d.lng === undefined) || d.lat === undefined || d.lng === undefined
    ? true
    : true,
  {}
);

export const listLocationsQuerySchema = z.object({
  district: z.enum(DISTRICTS).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  search: z.string().trim().max(80).optional(),
});