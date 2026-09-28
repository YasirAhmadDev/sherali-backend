import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Checks the JWT and loads the user from the database.
// Loading the user means a disabled account is blocked immediately.
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    throw new ApiError(401, "Not authenticated");
  }

  let payload;
  try {
    payload = jwt.verify(header.split(" ")[1], env.JWT_SECRET);
  } catch {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.id);
  if (!user || !user.isActive) {
    throw new ApiError(401, "Account not found or disabled");
  }

  // Force the password change before anything else (except /api/auth/*)
  if (user.mustChangePassword && !req.originalUrl.startsWith("/api/auth")) {
    throw new ApiError(403, "You must change your password before continuing", {
      errorCode: "PASSWORD_CHANGE_REQUIRED",
    });
  }

  req.user = user;
  next();
});
