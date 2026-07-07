import express from "express";
import rateLimit from "express-rate-limit";
import { getClientPublicStatus } from "../controllers/clientController.js";
import { createSubmission } from "../controllers/submissionController.js";

export const publicRouter = express.Router();

const submissionRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many submissions, please try again in a minute" },
});

publicRouter.get("/:clientSlug", getClientPublicStatus);
publicRouter.post("/:clientSlug/submissions", submissionRateLimiter, createSubmission);
