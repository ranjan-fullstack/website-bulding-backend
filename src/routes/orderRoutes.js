import express from "express";
import {
  addOrderTimelineUpdate,
  createOrder,
  decideLead,
  getMyActiveOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const orderRouter = express.Router();

orderRouter.post("/", requireAuth, createOrder);
orderRouter.get("/", requireAuth, requireAdmin, listOrders);
orderRouter.get("/my/active", requireAuth, getMyActiveOrder);
orderRouter.get("/:id", getOrder);
orderRouter.put("/:id/decision", requireAuth, requireAdmin, decideLead);
orderRouter.put("/:id/status", requireAuth, requireAdmin, updateOrderStatus);
orderRouter.post(
  "/:id/timeline",
  requireAuth,
  requireAdmin,
  addOrderTimelineUpdate
);
