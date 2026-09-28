import Location from "../models/Location.js";
import Accident from "../models/Accident.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/locations   (all roles)
export const listLocations = asyncHandler(async (req, res) => {
  const { district, isActive, search } = req.query;

  const filter = {};
  if (district) filter.district = district;
  if (isActive) filter.isActive = isActive === "true";
  if (search) filter.name = { $regex: escapeRegex(search), $options: "i" };

  const [locations, counts] = await Promise.all([
    Location.find(filter).sort({ name: 1 }).lean(),
    Accident.aggregate([
      { $match: { isDeleted: false, location: { $ne: null } } },
      { $group: { _id: "$location", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const data = locations.map((l) => ({ ...l, accidentCount: countMap.get(String(l._id)) || 0 }));

  res.json({ data });
});

// GET /api/locations/:id   (all roles)
export const getLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, "Location not found");
  res.status(200).json({ location });
});

// POST /api/locations   (admin)
export const createLocation = asyncHandler(async (req, res) => {
  const location = await Location.create(req.body);
  res.status(201).json({ location });
});

// PUT /api/locations/:id   (admin)
export const updateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, "Location not found");
  location.set(req.body);
  await location.save();
  res.json({ location });
});

// DELETE /api/locations/:id   (admin) -> deactivates, old accidents keep their reference
export const deactivateLocation = asyncHandler(async (req, res) => {
  const location = await Location.findById(req.params.id);
  if (!location) throw new ApiError(404, "Location not found");
  location.isActive = false;
  await location.save();
  res.json({ message: "Location deactivated", location });
});
