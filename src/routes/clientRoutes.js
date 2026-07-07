import express from "express";
import {
  listMySubmissions,
  updateMySubmissionStatus,
} from "../controllers/submissionController.js";
import { requireAuth } from "../middleware/auth.js";

export const clientRouter = express.Router();

clientRouter.use(requireAuth);

clientRouter.get("/submissions", listMySubmissions);
clientRouter.patch("/submissions/:id/status", updateMySubmissionStatus);
