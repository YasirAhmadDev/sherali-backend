import { Router } from "express";
import {
  createAccident,
  listAccidents,
  getAccident,
  updateAccident,
  deleteAccident,
} from "../controllers/accident.controller.js";
import { addPhotos, deletePhoto } from "../controllers/photo.controller.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { uploadPhotos } from "../middleware/upload.js";
import {
  createAccidentSchema,
  updateAccidentSchema,
  listAccidentsQuerySchema,
} from "../validators/accident.validator.js";

const router = Router();

router.use(protect);

// All roles can read (viewers get a reduced version)
router.get("/", validate(listAccidentsQuerySchema, "query"), listAccidents);
router.get("/:id", getAccident);

// Only admin and officer can write
router.post("/", requireRole("admin", "officer"), validate(createAccidentSchema), createAccident);
router.put("/:id", requireRole("admin", "officer"), validate(updateAccidentSchema), updateAccident);
router.post("/:id/photos", requireRole("admin", "officer"), uploadPhotos, addPhotos);
router.delete("/:id/photos/:filename", requireRole("admin", "officer"), deletePhoto);

// Only admin can delete (soft delete)
router.delete("/:id", requireRole("admin"), deleteAccident);

export default router;
