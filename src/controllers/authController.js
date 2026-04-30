import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { createAuthToken } from "../utils/tokens.js";

const googleClient = new OAuth2Client(env.googleClientId);

const serializeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  websiteProject: user.websiteProject,
});

export const googleLogin = async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ message: "Google credential is required" });
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email_verified) {
    return res.status(401).json({ message: "Google email is not verified" });
  }

  const email = payload.email.toLowerCase();
  const existingUser = await User.findOne({ googleId: payload.sub });
  const role = env.adminEmails.includes(email)
    ? "admin"
    : existingUser?.role || "user";

  const user = await User.findOneAndUpdate(
    { googleId: payload.sub },
    {
      $set: {
        name: payload.name,
        email,
        avatar: payload.picture || "",
        role,
        lastLoginAt: new Date(),
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return res.json({
    token: createAuthToken(user),
    user: serializeUser(user),
  });
};

export const getMe = async (req, res) => {
  return res.json({ user: serializeUser(req.user) });
};

export const selectWebsiteTemplate = async (req, res) => {
  const { templateSlug, templateTitle } = req.body;
  const selectedTemplate = String(templateTitle || templateSlug || "").trim();

  if (!selectedTemplate) {
    return res.status(400).json({ message: "Please choose a template first" });
  }

  req.user.websiteProject = {
    ...req.user.websiteProject?.toObject?.(),
    status: req.user.websiteProject?.status || "not-started",
    selectedTemplate,
    adminNote: req.user.websiteProject?.adminNote || "",
    websiteUrl: req.user.websiteProject?.websiteUrl || "",
    updatedAt: new Date(),
  };

  await req.user.save();

  return res.json({ user: serializeUser(req.user) });
};
