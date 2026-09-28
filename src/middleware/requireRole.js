import { ApiError } from "../utils/ApiError.js";

// Usage: router.post("/", protect, requireRole("admin", "officer"), handler)
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "You do not have permission to do this"));
    }
    next();
  };
