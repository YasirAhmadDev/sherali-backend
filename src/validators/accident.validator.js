import { z } from "zod";
import {
  DISTRICTS,
  ACCIDENT_TYPES,
  ACCIDENT_CAUSES,
  VEHICLE_TYPES,
  SEVERITIES,
} from "../utils/constants.js";
import { objectId, latitude, longitude, pagination } from "./common.js";

const vehicle = z.object({
  type: z.enum(VEHICLE_TYPES),
  plate: z.string().trim().max(20).optional(),
});

const accidentBase = z.object({
  date: z.coerce
    .date()
    .refine((d) => d.getTime() <= Date.now() + 5 * 60 * 1000, "Date cannot be in the future"),
  district: z.enum(DISTRICTS),
  location: objectId,
  roadName: z.string().trim().max(150),
  coordinates: z.object({ lat: latitude, lng: longitude }),
  type: z.enum(ACCIDENT_TYPES),
  cause: z.enum(ACCIDENT_CAUSES),
  vehicles: z.array(vehicle).max(10),
  injured: z.coerce.number().int().min(0).max(500),
  deaths: z.coerce.number().int().min(0).max(500),
  notes: z.string().trim().max(1000),
});

// Required: date, district, type, cause. Everything else optional,
// but the place must be known somehow (location, coordinates or road name).
export const createAccidentSchema = accidentBase
  .partial({
    location: true,
    roadName: true,
    coordinates: true,
    vehicles: true,
    injured: true,
    deaths: true,
    notes: true,
  })
  .refine((d) => d.location || d.coordinates || d.roadName, {
    message: "Provide a location, coordinates or a road name",
    path: ["location"],
  });

export const updateAccidentSchema = accidentBase.partial();

// Filters shared by list, map, stats and reports
export const accidentFilterSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  district: z.enum(DISTRICTS).optional(),
  type: z.enum(ACCIDENT_TYPES).optional(),
  cause: z.enum(ACCIDENT_CAUSES).optional(),
  severity: z.enum(SEVERITIES).optional(),
  location: objectId.optional(),
  search: z.string().trim().max(100).optional(),
});

export const listAccidentsQuerySchema = accidentFilterSchema.extend(pagination);

export const dashboardQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});
