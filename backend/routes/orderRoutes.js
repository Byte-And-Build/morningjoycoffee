const express = require("express");
const Order = require("../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Drink = require("../models/Drinks");
const Ingredient = require("../models/Ingredient");

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
  try {
    const { customer, items, user, amount } = req.body;

    // Fetch all involved drinks
    const drinkIds = items.map(item => item._id);
    const drinks = await Drink.find({ _id: { $in: drinkIds } }).populate("sizes.ingredients.ingredientId");

    // Deduct ingredients
    for (let item of items) {
      const drink = drinks.find(d => d._id.toString() === item._id);
      if (!drink) continue;

      // 1) Deduct the base recipe:
      const sizeData = drink.sizes.find(s => s.size === item.size);
      if (sizeData) {
        for (let ing of sizeData.ingredients) {
          const ingredient = await Ingredient.findById(ing.ingredientId);
          if (!ingredient) continue;
          ingredient.inStock = Math.max(0, ingredient.inStock - ing.quantity * item.quantity);
          await ingredient.save();
        }
      }

      // 2) Deduct any extras the customer chose:
      if (Array.isArray(item.extras)) {
        for (let extraName of item.extras) {
          const ingredient = await Ingredient.findOne({ name: extraName });
          if (!ingredient) continue;
          // assume extras always 1 unit per drink:
          ingredient.inStock = Math.max(0, ingredient.inStock - item.quantity);
          await ingredient.save();
          conosle.log("sizeData", ingredient)
        }
      }
    }


    const newOrder = new Order({
      customer,
      items,
      amount,
      status: "Queued",
      createdAt: new Date(),
      user: user || undefined,
    });

    const savedOrder = await newOrder.save();

    req.app.get("io").emit("new-order", savedOrder);
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

    if (!order) return res.status(404).json({ error: "Order not found" });

    const io = req.app.get("io");

    // ✅ send to that specific customer if order.user exists
    if (order.user) {
      io.to(`user:${order.user.toString()}`).emit("order-status-updated", order);
    }

    // ✅ optional: still broadcast to staff dashboards
    io.emit("order-status-updated-admin", order);

    res.json(order);
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ error: "Failed to update order" });
  }
});

router.delete("/deleteOrder", protect, async (req, res) => {
  try {
    const { _id } = req.body;
    const deleted = await Order.findByIdAndDelete(_id);
    if (!deleted) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted", _id });
  } catch (error) {
    console.error("Delete error", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

module.exports = router;