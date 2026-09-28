import { Router } from "express";
import {
  listLocations,
  getLocation,
  createLocation,
  updateLocation,
  deactivateLocation,
} from "../controllers/location.controller.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import {
  createLocationSchema,
  updateLocationSchema,
  listLocationsQuerySchema,
} from "../validators/location.validator.js";

const router = Router();

router.use(protect);

router.get("/", validate(listLocationsQuerySchema, "query"), listLocations);
router.get("/:id", getLocation);

router.post("/", requireRole("admin"), validate(createLocationSchema), createLocation);
router.put("/:id", requireRole("admin"), validate(updateLocationSchema), updateLocation);
router.delete("/:id", requireRole("admin"), deactivateLocation);

export default router;
