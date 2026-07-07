import mongoose from "mongoose";

export const clientStatuses = ["active", "paused"];

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    subdomain: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: clientStatuses,
      default: "active",
      index: true,
    },
    contactPhone: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const Client = mongoose.model("Client", clientSchema);
