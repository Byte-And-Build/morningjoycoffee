const express = require("express");
const Order = require("../models/Order");
const router = express.Router();

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
    const { customer, items } = req.body;

    const newOrder = new Order({
      customer,
      items,
      status: "Pending", // default status
      createdAt: new Date(),
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

router.patch("/:id/status", async (req, res) => {
  const { status, updatedBy } = req.body;

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedBy },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

module.exports = router;