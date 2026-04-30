import { Order, orderStatuses } from "../models/Order.js";

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

  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }

  return `https://${trimmedUrl}`;
};

const serializeOrder = (order) => ({
  id: order.orderId,
  _id: order._id.toString(),
  name: order.name,
  phone: order.phone,
  template: order.template,
  status: order.status,
  orderState: order.orderState || "order",
  timeline: order.timeline,
  websiteUrl: order.websiteUrl,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

export const createOrder = async (req, res) => {
  const { name, phone, template } = req.body;
  const orderName = String(name || req.user?.name || "").trim();
  const orderPhone = String(phone || "Not provided").trim();
  const orderTemplate = String(template || "").trim();

  if (!orderName || !orderTemplate) {
    return res.status(400).json({ message: "Name and template are required" });
  }

  const order = await Order.create({
    orderId: generateOrderId(),
    user: req.user?._id || null,
    name: orderName,
    phone: orderPhone,
    template: orderTemplate,
    timeline: [
      {
        status: "New Lead",
        title: "WhatsApp lead received",
        note: `${orderName} selected the ${orderTemplate} template.`,
      },
    ],
  });

  return res.status(201).json({ order: serializeOrder(order) });
};

export const getMyActiveOrder = async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    $or: [{ orderState: "order" }, { orderState: { $exists: false } }],
  }).sort({ updatedAt: -1 });

  return res.json({
    order: orders[0] ? serializeOrder(orders[0]) : null,
    orders: orders.map(serializeOrder),
    statuses: orderStatuses,
  });
};

export const getOrder = async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({ order: serializeOrder(order), statuses: orderStatuses });
};

export const listOrders = async (req, res) => {
  const orders = await Order.find().sort({ updatedAt: -1 }).limit(100);

  return res.json({
    orders: orders.map(serializeOrder),
    statuses: orderStatuses,
  });
};

export const updateOrderStatus = async (req, res) => {
  const { note, status, websiteUrl } = req.body;

  if (!orderStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid order status" });
  }

  const order = await Order.findOne({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.orderState && order.orderState !== "order") {
    return res.status(400).json({
      message: "Create the order before updating its project status",
    });
  }

  order.status = status;
  order.websiteUrl = normalizeWebsiteUrl(websiteUrl ?? order.websiteUrl);
  order.timeline.push({
    status,
    title: status === "Delivered" ? "Website delivered" : `Status changed to ${status}`,
    note: String(note || "").trim(),
  });

  await order.save();

  return res.json({ order: serializeOrder(order), statuses: orderStatuses });
};

export const decideLead = async (req, res) => {
  const { decision, note } = req.body;
  const order = await Order.findOne({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Lead not found" });
  }

  if (!["create", "reject"].includes(decision)) {
    return res.status(400).json({ message: "Decision must be create or reject" });
  }

  if (order.orderState !== "lead") {
    return res.status(400).json({ message: "This lead has already been decided" });
  }

  if (decision === "reject") {
    order.orderState = "rejected";
    order.timeline.push({
      status: order.status,
      title: "Lead rejected",
      note: String(note || "Rejected by admin").trim(),
    });
  } else {
    order.orderState = "order";
    order.timeline.push({
      status: order.status,
      title: "Order created",
      note: String(note || "Admin confirmed this lead as an order.").trim(),
    });
  }

  await order.save();

  return res.json({ order: serializeOrder(order), statuses: orderStatuses });
};

export const addOrderTimelineUpdate = async (req, res) => {
  const { note, status, title } = req.body;
  const timelineStatus = orderStatuses.includes(status) ? status : undefined;
  const order = await Order.findOne({ orderId: req.params.id });

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.orderState && order.orderState !== "order") {
    return res.status(400).json({
      message: "Create the order before adding project timeline updates",
    });
  }

  order.timeline.push({
    status: timelineStatus || order.status,
    title: String(title || "Project update").trim(),
    note: String(note || "").trim(),
  });

  await order.save();

  return res.json({ order: serializeOrder(order), statuses: orderStatuses });
};
