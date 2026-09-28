import User from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const escapeRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/users   (admin)
export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, isActive, search } = req.query;

  const filter = {};
  if (role) filter.role = role;
  if (isActive) filter.isActive = isActive === "true";
  if (search) {
    const rx = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ name: rx }, { email: rx }, { badgeNumber: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    data: users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// GET /api/users/:id   (admin)
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  res.json({ user });
});

// POST /api/users   (admin)  -> the admin picks the role, users never do
export const createUser = asyncHandler(async (req, res) => {
  const user = await User.create({ ...req.body, mustChangePassword: true });
  res.status(201).json({ user });
});

// PUT /api/users/:id   (admin)
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const updates = req.body;
  const isSelf = String(user._id) === String(req.user._id);
  if (isSelf && (updates.isActive === false || (updates.role && updates.role !== "admin"))) {
    throw new ApiError(400, "You cannot deactivate or demote your own account");
  }

  user.set(updates);
  await user.save();
  res.json({ user });
});

// POST /api/users/:id/reset-password   (admin)
export const resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  user.password = req.body.newPassword;
  user.mustChangePassword = true;
  await user.save();

  res.json({ message: "Temporary password set. The user must change it on next login." });
});
