import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import locationRoutes from "./location.routes.js";
import accidentRoutes from "./accident.routes.js";
import photoRoutes from "./photo.routes.js";
import statsRoutes from "./stats.routes.js";
import reportRoutes from "./report.routes.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/locations", locationRoutes);
router.use("/accidents", accidentRoutes);
router.use("/photos", photoRoutes);
router.use("/stats", statsRoutes);
router.use("/reports", reportRoutes);

export default router;
