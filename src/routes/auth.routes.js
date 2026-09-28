import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, me, changePassword } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, changePasswordSchema } from "../validators/auth.validator.js";

const router = Router();

// Blocks password guessing: 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/login", loginLimiter, validate(loginSchema), login);
router.get("/me", protect, me);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
