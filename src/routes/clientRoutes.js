import express from "express";
import { listMySubmissions } from "../controllers/submissionController.js";
import { requireAuth } from "../middleware/auth.js";

export const clientRouter = express.Router();

clientRouter.use(requireAuth);

clientRouter.get("/submissions", listMySubmissions);
