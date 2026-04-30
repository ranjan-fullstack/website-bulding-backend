import express from "express";
import {
  getMe,
  googleLogin,
  selectWebsiteTemplate,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = express.Router();

authRouter.post("/google", googleLogin);
authRouter.get("/me", requireAuth, getMe);
authRouter.patch("/website-template", requireAuth, selectWebsiteTemplate);
