import mongoose from "mongoose";

export const leadStatuses = ["New", "Contacted", "Qualified", "Converted", "Rejected"];

const leadSchema = new mongoose.Schema(
  {
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
      enum: leadStatuses,
      default: "New",
      index: true,
    },
    convertedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", leadSchema);
