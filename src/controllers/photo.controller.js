import fs from "fs";
import path from "path";
import Accident from "../models/Accident.js";
import { UPLOAD_DIR } from "../config/paths.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { safeFileName } from "../middleware/upload.js";
import { MAX_PHOTOS_PER_ACCIDENT, ROLES } from "../utils/constants.js";

const removeFiles = (files) =>
  Promise.all(files.map((f) => fs.promises.unlink(f.path).catch(() => {})));

const canModify = (accident, user) =>
  user.role === ROLES.ADMIN || String(accident.createdBy) === String(user._id);

// POST /api/accidents/:id/photos   (multipart field name: "photos")
export const addPhotos = asyncHandler(async (req, res) => {
  const files = req.files || [];

  const accident = await Accident.findOne({ _id: req.params.id, isDeleted: false });
  if (!accident) {
    await removeFiles(files);
    throw new ApiError(404, "Accident not found");
  }
  if (!canModify(accident, req.user)) {
    await removeFiles(files);
    throw new ApiError(403, "You can only add photos to accidents that you created");
  }
  if (files.length === 0) throw new ApiError(400, "No photos uploaded");
  if (accident.photos.length + files.length > MAX_PHOTOS_PER_ACCIDENT) {
    await removeFiles(files);
    throw new ApiError(400, `An accident can have at most ${MAX_PHOTOS_PER_ACCIDENT} photos`);
  }

  accident.photos.push(...files.map((f) => f.filename));
  accident.updatedBy = req.user._id;
  await accident.save();

  res.status(201).json({ photos: accident.photos });
});

// DELETE /api/accidents/:id/photos/:filename
export const deletePhoto = asyncHandler(async (req, res) => {
  const filename = safeFileName(req.params.filename);

  const accident = await Accident.findOne({ _id: req.params.id, isDeleted: false });
  if (!accident) throw new ApiError(404, "Accident not found");
  if (!canModify(accident, req.user)) {
    throw new ApiError(403, "You can only remove photos from accidents that you created");
  }
  if (!accident.photos.includes(filename)) throw new ApiError(404, "Photo not found");

  accident.photos = accident.photos.filter((p) => p !== filename);
  accident.updatedBy = req.user._id;
  await accident.save();
  await fs.promises.unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});

  res.json({ photos: accident.photos });
});

// GET /api/photos/:filename   (admin, officer) -> photos are private, never public static files
export const servePhoto = (req, res, next) => {
  const filename = safeFileName(req.params.filename); // blocks ../ path tricks
  res.sendFile(path.join(UPLOAD_DIR, filename), (err) => {
    if (err) next(new ApiError(404, "Photo not found"));
  });
};
