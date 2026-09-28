import { Router } from "express";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
} from "../controllers/user.controller.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import {
  createUserSchema,
  updateUserSchema,
  resetPasswordSchema,
  listUsersQuerySchema,
} from "../validators/user.validator.js";

const router = Router();

// Everything here is admin only
router.use(protect, requireRole("admin"));

router.get("/", validate(listUsersQuerySchema, "query"), listUsers);
router.post("/", validate(createUserSchema), createUser);
router.get("/:id", getUser);
router.put("/:id", validate(updateUserSchema), updateUser);
router.post("/:id/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
