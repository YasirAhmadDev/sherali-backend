import { z } from "zod";
import { KABUL_BOUNDS } from "../utils/constants.js";

export const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

export const latitude = z
  .number()
  .min(KABUL_BOUNDS.minLat, "Latitude is outside Kabul")
  .max(KABUL_BOUNDS.maxLat, "Latitude is outside Kabul");

export const longitude = z
  .number()
  .min(KABUL_BOUNDS.minLng, "Longitude is outside Kabul")
  .max(KABUL_BOUNDS.maxLng, "Longitude is outside Kabul");

export const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
};
