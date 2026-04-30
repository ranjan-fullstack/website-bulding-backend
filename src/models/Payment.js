import mongoose from "mongoose";

export const paymentStatuses = ["Pending", "Paid", "Failed", "Refunded"];
export const paymentMethods = ["Cash", "UPI", "Card", "Bank Transfer", "Other"];

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: paymentStatuses,
      default: "Pending",
      index: true,
    },
    method: {
      type: String,
      enum: paymentMethods,
      default: "UPI",
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
