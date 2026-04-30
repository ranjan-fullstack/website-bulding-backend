import mongoose from "mongoose";

export const websiteStatuses = ["Draft", "Live", "Delivered", "Maintenance"];

const websiteSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    websiteUrl: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: websiteStatuses,
      default: "Delivered",
      index: true,
    },
  },
  { timestamps: true }
);

export const Website = mongoose.model("Website", websiteSchema);
