const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Drink = require("../models/Drinks");
const Ingredient = require("../models/Ingredient");
const Counter = require("../models/Counter");

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
  const session = await mongoose.startSession();

  try {
    const { customer, email, items, user, amount, paymentIntentId } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must include items[]" });
    }

    await session.withTransaction(async () => {
      // 1) Next order number (atomic)
      const counter = await Counter.findOneAndUpdate(
        { _id: "order" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session }
      );
      const orderNumber = counter.seq;

      // 2) Fetch drinks referenced in order
      const drinkIds = items.map(i => i.drinkId).filter(Boolean);
      const drinks = await Drink.find({ _id: { $in: drinkIds } }).session(session);

      // 3) Deduct inventory
      for (const item of items) {
        const drink = drinks.find(d => d._id.toString() === String(item.drinkId));
        if (!drink) continue;

        const qty = Number(item.quantity || 0);
        if (qty <= 0) continue;

        // base recipe ingredients for the chosen size
        const sizeData = drink.sizes?.find(s => s.size === item.size);
        if (sizeData?.ingredients?.length) {
          for (const ing of sizeData.ingredients) {
            const ingredientId = ing.ingredientId;
            const perDrinkQty = Number(ing.quantity || 0);
            const deductQty = perDrinkQty * qty;

            if (deductQty > 0) {
              await Ingredient.updateOne(
                { _id: ingredientId },
                { $inc: { inStock: -deductQty } },
                { session }
              );
            }
          }
        }

        // extras selected (ingredient ids)
        if (Array.isArray(item.extras) && item.extras.length) {
          for (const extraIngredientId of item.extras) {
            // If extras have per-extra quantity, you can multiply here.
            await Ingredient.updateOne(
              { _id: extraIngredientId },
              { $inc: { inStock: -qty } },
              { session }
            );
          }
        }
      }

      // 4) Save order
      const newOrder = await Order.create(
        [
          {
            orderNumber,
            customer: customer || "Guest",
            email: email || "",
            items,
            amount,
            status: "Queued",
            user: user || undefined,
            paymentIntentId: paymentIntentId || "",
          },
        ],
        { session }
      );

      // newOrder is array because create() with array
      const savedOrder = newOrder[0];

      // 5) Emit after save
      req.app.get("io").emit("new-order", savedOrder);

      res.status(201).json(savedOrder);
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    session.endSession();
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
    const order = await Order.findById(req.params.id)
      .populate("items.extras", "name")
      .lean();

    if (!order) return res.status(404).json({ error: "Order not found" });

    if (!Array.isArray(order.items)) order.items = [];

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