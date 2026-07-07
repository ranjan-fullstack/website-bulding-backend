import { Client } from "../models/Client.js";
import { User } from "../models/User.js";

const projectStatuses = ["not-started", "in-progress", "done"];

const getDashboardData = async (currentUserId) => {
  const [totalUsers, admins, latestUsers] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: "admin" }),
    User.find(currentUserId ? { _id: { $ne: currentUserId } } : {})
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name email avatar role tenantId websiteProject createdAt lastLoginAt"),
  ]);

  return {
    stats: {
      totalUsers,
      admins,
      normalUsers: totalUsers - admins,
    },
    latestUsers,
  };
};

const normalizeWebsiteUrl = (url) => {
  const trimmedUrl = String(url || "").trim();

  if (!trimmedUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

export const getAdminDashboard = async (req, res) => {
  return res.json(await getDashboardData(req.user._id));
};

export const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({ message: "Role must be user or admin" });
  }

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  targetUser.role = role;
  await targetUser.save();

  return res.json(await getDashboardData(req.user._id));
};

export const updateUserWebsiteProject = async (req, res) => {
  const { userId } = req.params;
  const { adminNote, selectedTemplate, status, websiteUrl } = req.body;

  if (!projectStatuses.includes(status)) {
    return res.status(400).json({
      message: "Project status must be not-started, in-progress, or done",
    });
  }

  const normalizedUrl = normalizeWebsiteUrl(websiteUrl);

  if (status === "done" && !normalizedUrl) {
    return res.status(400).json({
      message: "Website URL is required when marking the project done",
    });
  }

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  targetUser.websiteProject = {
    ...targetUser.websiteProject?.toObject?.(),
    status,
    selectedTemplate: String(selectedTemplate || "").trim(),
    adminNote: String(adminNote || "").trim(),
    websiteUrl: normalizedUrl,
    updatedBy: req.user._id,
    updatedAt: new Date(),
  };

  await targetUser.save();

  return res.json(await getDashboardData(req.user._id));
};

export const updateUserTenant = async (req, res) => {
  const { userId } = req.params;
  const { tenantId } = req.body;

  const targetUser = await User.findById(userId);

  if (!targetUser) {
    return res.status(404).json({ message: "User not found" });
  }

  if (tenantId) {
    const client = await Client.findById(tenantId);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
  }

  targetUser.tenantId = tenantId || null;
  await targetUser.save();

  return res.json(await getDashboardData(req.user._id));
};
