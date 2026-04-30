import express from "express";
import {
  getAdminDashboard,
  updateUserRole,
  updateUserWebsiteProject,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = express.Router();

adminRouter.get("/dashboard", requireAuth, requireAdmin, getAdminDashboard);
adminRouter.patch("/users/:userId/role", requireAuth, requireAdmin, updateUserRole);
adminRouter.patch(
  "/users/:userId/website-project",
  requireAuth,
  requireAdmin,
  updateUserWebsiteProject
);
