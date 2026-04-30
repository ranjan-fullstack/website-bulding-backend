import mongoose from "mongoose";

export const orderStatuses = [
  "New Lead",
  "Contacted",
  "Requirements Collected",
  "Design Started",
  "Design Ready",
  "Client Review",
  "Changes Requested",
  "Finalizing",
  "Website Live",
  "Delivered",
];

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: orderStatuses,
      default: "New Lead",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    template: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: orderStatuses,
      default: "New Lead",
      index: true,
    },
    orderState: {
      type: String,
      enum: ["lead", "order", "rejected"],
      default: "lead",
      index: true,
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
    websiteUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);
