import mongoose from "mongoose";

export const submissionTypes = ["inquiry", "admission"];
export const submissionStatusesByType = {
  inquiry: ["new", "contacted", "closed"],
  admission: ["new", "confirmed", "joined"],
};
export const submissionStatuses = [
  ...new Set(Object.values(submissionStatusesByType).flat()),
];

const submissionSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: submissionTypes,
      required: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: submissionStatuses,
      default: "new",
      index: true,
    },
  },
  { timestamps: true }
);

export const Submission = mongoose.model("Submission", submissionSchema);
