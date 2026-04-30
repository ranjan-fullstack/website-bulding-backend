import express from "express";
import {
  convertLeadToOrder,
  createLead,
  createPayment,
  createWebsite,
  getBusinessStats,
  listLeads,
  listPayments,
  listWebsites,
  markPaymentPaid,
} from "../controllers/businessController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

export const businessRouter = express.Router();

businessRouter.use(requireAuth, requireAdmin);

businessRouter.get("/stats", getBusinessStats);
businessRouter.get("/leads", listLeads);
businessRouter.post("/leads", createLead);
businessRouter.put("/leads/:id/convert", convertLeadToOrder);
businessRouter.get("/payments", listPayments);
businessRouter.post("/payments", createPayment);
businessRouter.put("/payments/:id/paid", markPaymentPaid);
businessRouter.get("/websites", listWebsites);
businessRouter.post("/websites", createWebsite);
