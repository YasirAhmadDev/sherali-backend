import { Router } from "express";
import { getDashboardStats, getMapPoints } from "../controllers/stats.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { dashboardQuerySchema, accidentFilterSchema } from "../validators/accident.validator.js";

const router = Router();

router.use(protect);

router.get("/dashboard", validate(dashboardQuerySchema, "query"), getDashboardStats);
router.get("/map", validate(accidentFilterSchema, "query"), getMapPoints);

export default router;
