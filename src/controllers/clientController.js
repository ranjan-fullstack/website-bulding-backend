import { Client, clientStatuses } from "../models/Client.js";

const serializeClient = (client) => ({
  id: client._id.toString(),
  name: client.name,
  slug: client.slug,
  subdomain: client.subdomain,
  status: client.status,
  contactPhone: client.contactPhone,
  createdAt: client.createdAt,
  updatedAt: client.updatedAt,
});

export const getClientPublicStatus = async (req, res) => {
  const client = await Client.findOne({ slug: req.params.clientSlug });

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  return res.json({ status: client.status, name: client.name });
};

export const listClients = async (req, res) => {
  const clients = await Client.find().sort({ createdAt: -1 });

  return res.json({ clients: clients.map(serializeClient), statuses: clientStatuses });
};

export const createClient = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const slug = String(req.body.slug || "").trim().toLowerCase();
  const subdomain = String(req.body.subdomain || "").trim().toLowerCase();
  const contactPhone = String(req.body.contactPhone || "").trim();

  if (!name || !slug) {
    return res.status(400).json({ message: "Name and slug are required" });
  }

  const existingClient = await Client.findOne({ slug });

  if (existingClient) {
    return res.status(400).json({ message: "A client with this slug already exists" });
  }

  const client = await Client.create({ name, slug, subdomain, contactPhone });

  return res.status(201).json({ client: serializeClient(client) });
};

export const updateClientStatus = async (req, res) => {
  const { status } = req.body;

  if (!clientStatuses.includes(status)) {
    return res.status(400).json({ message: "Status must be active or paused" });
  }

  const client = await Client.findById(req.params.id);

  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  client.status = status;
  await client.save();

  return res.json({ client: serializeClient(client) });
};
