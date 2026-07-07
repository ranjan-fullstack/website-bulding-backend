import express from "express";
import {
  getAdminDashboard,
  updateUserRole,
  updateUserTenant,
  updateUserWebsiteProject,
} from "../controllers/adminController.js";
import {
  createClient,
  listClients,
  updateClientStatus,
} from "../controllers/clientController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const adminRouter = express.Router();

adminRouter.get("/dashboard", requireAuth, requireAdmin, getAdminDashboard);
adminRouter.patch("/users/:userId/role", requireAuth, requireAdmin, updateUserRole);
adminRouter.patch("/users/:userId/tenant", requireAuth, requireAdmin, updateUserTenant);
adminRouter.patch(
  "/users/:userId/website-project",
  requireAuth,
  requireAdmin,
  updateUserWebsiteProject
);

adminRouter.get("/clients", requireAuth, requireAdmin, listClients);
adminRouter.post("/clients", requireAuth, requireAdmin, createClient);
adminRouter.patch("/clients/:id/status", requireAuth, requireAdmin, updateClientStatus);
