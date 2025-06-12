const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) res.status(401).json({ message: "Not authorized, no token" });
};

router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Failed to get orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.post("/new", async (req, res) => {
  console.log(req.body)
  try {
    const { customer, items, user } = req.body;

    const newOrder = new Order({
      customer,
      items,
      status: "Queued",
      createdAt: new Date(),
      user: user ? user : "Guest",
    });

    const savedOrder = await newOrder.save();

    // Emit to all connected clients
    const io = req.app.get("io");
    io.emit("new-order", savedOrder);

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create and emit order" });
  }
});

router.get("/user", protect, async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(userOrders);
  } catch (error) {
    console.error("Failed to get user orders:", error);
    res.status(500).json({ error: "Failed to fetch user orders" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (error) {
    console.error("Failed to fetch order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.patch("/:id/status", async (req, res) => {
  const { status, updatedBy } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy },
      { new: true }
    );
    res.json(order);
    const io = req.app.get("io");
      io.emit("order-status-updated", order);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;