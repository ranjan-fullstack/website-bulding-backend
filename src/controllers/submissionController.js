import { Client } from "../models/Client.js";
import { Submission, submissionTypes } from "../models/Submission.js";

const serializeSubmission = (submission) => ({
  id: submission._id.toString(),
  clientId: submission.clientId.toString(),
  type: submission.type,
  data: submission.data,
  status: submission.status,
  createdAt: submission.createdAt,
  updatedAt: submission.updatedAt,
});

export const createSubmission = async (req, res) => {
  const { type, ...data } = req.body;

  if (!submissionTypes.includes(type)) {
    return res.status(400).json({ message: "Type must be inquiry or admission" });
  }

  const client = await Client.findOne({ slug: req.params.clientSlug });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  if (client.status !== "active") {
    return res.status(403).json({ message: "This client is not currently accepting submissions" });
  }

  const submission = await Submission.create({
    clientId: client._id,
    type,
    data,
  });

  return res.status(201).json({ submission: serializeSubmission(submission) });
};

export const listMySubmissions = async (req, res) => {
  if (!req.user.tenantId) {
    return res.status(400).json({ message: "Your account is not linked to a client" });
  }

  const submissions = await Submission.find({ clientId: req.user.tenantId })
    .sort({ createdAt: -1 })
    .limit(200);

  return res.json({ submissions: submissions.map(serializeSubmission) });
};
