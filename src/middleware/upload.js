import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { UPLOAD_DIR } from "../config/paths.js";
import { ApiError } from "../utils/ApiError.js";
import { MAX_PHOTOS_PER_ACCIDENT } from "../utils/constants.js";

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Random name, the original file name is never used
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${EXTENSIONS[file.mimetype]}`),
});

export const uploadPhotos = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) return cb(null, true);
    cb(new ApiError(400, "Only JPG, PNG or WEBP images are allowed"));
  },
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_PHOTOS_PER_ACCIDENT },
}).array("photos", MAX_PHOTOS_PER_ACCIDENT);

export const safeFileName = (name) => path.basename(String(name));
