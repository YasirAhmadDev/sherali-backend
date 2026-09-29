import Accident from "../models/Accident.js";
import Location from "../models/Location.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { buildAccidentFilter } from "../utils/accidentFilter.js";
import { presentAccident } from "../utils/sanitize.js";
import { ROLES } from "../utils/constants.js";

const isOwnerOrAdmin = (accident, user) =>
  user.role === ROLES.ADMIN || String(accident.createdBy) === String(user._id);

const findActiveLocation = async (id) => {
  const location = await Location.findOne({ _id: id, isActive: true });
  if (!location) throw new ApiError(400, "Selected location does not exist or is inactive");
  return location;
};

// A location may not have coordinates saved (they are optional now)
const hasCoordinates = (location) => location.lat != null && location.lng != null;

const findAccidentOr404 = async (id) => {
  const accident = await Accident.findOne({ _id: id, isDeleted: false });
  if (!accident) throw new ApiError(404, "Accident not found");
  return accident;
};

// Viewers must never receive officer info, so only populate it for staff
const populateFor = (query, role) => {
  query.populate("location", "name district lat lng");
  if (role !== ROLES.VIEWER) query.populate("createdBy", "name badgeNumber district");
  return query;
};

// POST /api/accidents   (admin, officer)
export const createAccident = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  if (data.location) {
    const location = await findActiveLocation(data.location);
    if (!data.coordinates && hasCoordinates(location)) {
      data.coordinates = { lat: location.lat, lng: location.lng };
    }
  }

  // createdBy always comes from the token, never from the form
  const accident = await Accident.create({ ...data, createdBy: req.user._id });
  res.status(201).json({ accident });
});

// GET /api/accidents   (all roles, viewers get a reduced version)
export const listAccidents = asyncHandler(async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const filter = buildAccidentFilter(filters);

  const query = Accident.find(filter)
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  populateFor(query, req.user.role);

  const [accidents, total] = await Promise.all([query, Accident.countDocuments(filter)]);

  res.json({
    data: accidents.map((a) => presentAccident(a, req.user.role)),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/accidents/:id   (all roles)
export const getAccident = asyncHandler(async (req, res) => {
  const query = Accident.findOne({ _id: req.params.id, isDeleted: false });
  populateFor(query, req.user.role);
  const accident = await query;
  if (!accident) throw new ApiError(404, "Accident not found");

  res.json({ accident: presentAccident(accident, req.user.role) });
});

// PUT /api/accidents/:id   (admin, or the officer who created it)
export const updateAccident = asyncHandler(async (req, res) => {
  const accident = await findAccidentOr404(req.params.id);
  if (!isOwnerOrAdmin(accident, req.user)) {
    throw new ApiError(403, "You can only edit accidents that you created");
  }

  const data = { ...req.body };
  if (data.location) {
    const location = await findActiveLocation(data.location);
    if (!data.coordinates && hasCoordinates(location)) {
      data.coordinates = { lat: location.lat, lng: location.lng };
    }
  }

  accident.set(data); // severity is recalculated automatically on save
  accident.updatedBy = req.user._id;
  await accident.save();

  res.json({ accident });
});

// DELETE /api/accidents/:id   (admin) -> soft delete
export const deleteAccident = asyncHandler(async (req, res) => {
  const accident = await findAccidentOr404(req.params.id);

  accident.isDeleted = true;
  accident.deletedAt = new Date();
  accident.deletedBy = req.user._id;
  await accident.save();

  res.json({ message: "Accident deleted" });
});