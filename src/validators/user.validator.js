import { z } from "zod";
import { ROLE_LIST, DISTRICTS } from "../utils/constants.js";
import { password, pagination } from "./common.js";

const name = z.string().trim().min(2).max(80);

export const createUserSchema = z.object({
  name,
  email: z.string().trim().toLowerCase().email(),
  password, // temporary password, user must change it on first login
  role: z.enum(ROLE_LIST),
  district: z.enum(DISTRICTS).optional(),
  badgeNumber: z.string().trim().max(30).optional(),
});

export const updateUserSchema = z
  .object({
    name,
    role: z.enum(ROLE_LIST),
    district: z.enum(DISTRICTS).nullable(),
    badgeNumber: z.string().trim().max(30).nullable(),
    isActive: z.boolean(),
  })
  .partial();

export const resetPasswordSchema = z.object({ newPassword: password });

export const listUsersQuerySchema = z.object({
  ...pagination,
  role: z.enum(ROLE_LIST).optional(),
  isActive: z.enum(["true", "false"]).optional(),
  search: z.string().trim().max(80).optional(),
});
