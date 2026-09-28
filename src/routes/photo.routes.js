import { Router } from "express";
import { servePhoto } from "../controllers/photo.controller.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

// Photos are private: logged in admin/officer only, viewers get nothing
router.get("/:filename", protect, requireRole("admin", "officer"), servePhoto);

export default router;
