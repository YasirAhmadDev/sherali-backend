import { Router } from "express";
import { exportAccidentsCsv, getSummary } from "../controllers/report.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { accidentFilterSchema } from "../validators/accident.validator.js";

const router = Router();

router.use(protect);

router.get("/summary", validate(accidentFilterSchema, "query"), getSummary);
router.get("/accidents.csv", validate(accidentFilterSchema, "query"), exportAccidentsCsv);

export default router;
