import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    websiteProject: {
      status: {
        type: String,
        enum: ["not-started", "in-progress", "done"],
        default: "not-started",
      },
      selectedTemplate: {
        type: String,
        default: "",
        trim: true,
      },
      adminNote: {
        type: String,
        default: "",
        trim: true,
      },
      websiteUrl: {
        type: String,
        default: "",
        trim: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      updatedAt: {
        type: Date,
        default: null,
      },
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
