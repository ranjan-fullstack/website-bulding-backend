import { Lead, leadStatuses } from "../models/Lead.js";
import { Order } from "../models/Order.js";
import { Payment, paymentMethods, paymentStatuses } from "../models/Payment.js";
import { Website, websiteStatuses } from "../models/Website.js";

const generateOrderId = () =>
  `WM-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;

const normalizeWebsiteUrl = (url) => {
  const trimmedUrl = String(url || "").trim();

  if (!trimmedUrl) {
    return "";
  }

  return /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
};

const serializeLead = (lead) => ({
  id: lead._id.toString(),
  name: lead.name,
  phone: lead.phone,
  template: lead.template,
  status: lead.status,
  convertedOrder: lead.convertedOrder?.toString?.() || null,
  createdAt: lead.createdAt,
  updatedAt: lead.updatedAt,
});

const serializePayment = (payment) => ({
  id: payment._id.toString(),
  orderId: payment.orderId,
  amount: payment.amount,
  status: payment.status,
  method: payment.method,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

const serializeWebsite = (website) => ({
  id: website._id.toString(),
  orderId: website.orderId,
  clientName: website.clientName,
  websiteUrl: website.websiteUrl,
  status: website.status,
  createdAt: website.createdAt,
  updatedAt: website.updatedAt,
});

export const getBusinessStats = async (req, res) => {
  const [totalOrders, inProgress, completed, pendingPayments] = await Promise.all([
    Order.countDocuments({ orderState: "order" }),
    Order.countDocuments({
      orderState: "order",
      status: { $nin: ["Delivered", "Website Live"] },
    }),
    Order.countDocuments({
      orderState: "order",
      status: { $in: ["Delivered", "Website Live"] },
    }),
    Payment.countDocuments({ status: "Pending" }),
  ]);

  return res.json({
    stats: {
      totalOrders,
      inProgress,
      completed,
      pendingPayments,
    },
  });
};

export const listLeads = async (req, res) => {
  const leads = await Lead.find().sort({ updatedAt: -1 }).limit(100);

  return res.json({ leads: leads.map(serializeLead), statuses: leadStatuses });
};

export const createLead = async (req, res) => {
  const name = String(req.body.name || "").trim();
  const phone = String(req.body.phone || "").trim();
  const template = String(req.body.template || "").trim();
  const status = leadStatuses.includes(req.body.status) ? req.body.status : "New";

  if (!name || !phone || !template) {
    return res.status(400).json({ message: "Name, phone, and template are required" });
  }

  const lead = await Lead.create({ name, phone, template, status });

  return res.status(201).json({ lead: serializeLead(lead), statuses: leadStatuses });
};

export const convertLeadToOrder = async (req, res) => {
  const lead = await Lead.findById(req.params.id);

  if (!lead) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (lead.status === "Converted" && lead.convertedOrder) {
    return res.status(400).json({ message: "Lead is already converted" });
  }

  const order = await Order.create({
    orderId: generateOrderId(),
    name: lead.name,
    phone: lead.phone,
    template: lead.template,
    orderState: "order",
    timeline: [
      {
        status: "New Lead",
        title: "Lead converted to order",
        note: `${lead.name} was converted from the leads module.`,
      },
    ],
  });

  lead.status = "Converted";
  lead.convertedOrder = order._id;
  await lead.save();

  return res.json({
    lead: serializeLead(lead),
    order: {
      id: order.orderId,
      _id: order._id.toString(),
      name: order.name,
      phone: order.phone,
      template: order.template,
      status: order.status,
      orderState: order.orderState,
      websiteUrl: order.websiteUrl,
      timeline: order.timeline,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    },
  });
};

export const listPayments = async (req, res) => {
  const payments = await Payment.find().sort({ updatedAt: -1 }).limit(100);
  const pendingPayments = payments.filter((payment) => payment.status === "Pending");

  return res.json({
    payments: payments.map(serializePayment),
    pendingPayments: pendingPayments.map(serializePayment),
    statuses: paymentStatuses,
    methods: paymentMethods,
  });
};

export const createPayment = async (req, res) => {
  const orderId = String(req.body.orderId || "").trim();
  const amount = Number(req.body.amount || 0);
  const status = paymentStatuses.includes(req.body.status) ? req.body.status : "Pending";
  const method = paymentMethods.includes(req.body.method) ? req.body.method : "UPI";

  if (!orderId || amount <= 0) {
    return res.status(400).json({ message: "Order ID and amount are required" });
  }

  const payment = await Payment.create({ orderId, amount, status, method });

  return res.status(201).json({ payment: serializePayment(payment) });
};

export const markPaymentPaid = async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return res.status(404).json({ message: "Payment not found" });
  }

  payment.status = "Paid";
  await payment.save();

  return res.json({ payment: serializePayment(payment) });
};

export const listWebsites = async (req, res) => {
  const [websites, deliveredOrders] = await Promise.all([
    Website.find().sort({ updatedAt: -1 }).limit(100),
    Order.find({
      orderState: "order",
      websiteUrl: { $ne: "" },
      status: { $in: ["Website Live", "Delivered"] },
    })
      .sort({ updatedAt: -1 })
      .limit(100),
  ]);

  const savedWebsites = websites.map(serializeWebsite);
  const savedOrderIds = new Set(savedWebsites.map((website) => website.orderId));
  const deliveredWebsites = deliveredOrders
    .filter((order) => !savedOrderIds.has(order.orderId))
    .map((order) => ({
      id: order._id.toString(),
      orderId: order.orderId,
      clientName: order.name,
      websiteUrl: order.websiteUrl,
      status: order.status === "Website Live" ? "Live" : "Delivered",
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

  return res.json({
    websites: [...savedWebsites, ...deliveredWebsites],
    statuses: websiteStatuses,
  });
};

export const createWebsite = async (req, res) => {
  const orderId = String(req.body.orderId || "").trim();
  const clientName = String(req.body.clientName || "").trim();
  const websiteUrl = normalizeWebsiteUrl(req.body.websiteUrl);
  const status = websiteStatuses.includes(req.body.status) ? req.body.status : "Delivered";

  if (!orderId || !clientName || !websiteUrl) {
    return res.status(400).json({
      message: "Order ID, client name, and website URL are required",
    });
  }

  const website = await Website.create({ orderId, clientName, websiteUrl, status });

  return res.status(201).json({ website: serializeWebsite(website) });
};
