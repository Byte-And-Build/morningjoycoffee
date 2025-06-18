const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Drink = require("../models/Drinks");

// Utility: get date N days ago
const daysAgo = (n) => {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
};

router.get("/today-summary", async (req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  try {
    const todayOrders = await Order.find({ createdAt: { $gte: startOfToday } });

    const totalOrders = todayOrders.length;

    // Sum order amounts (in cents if stored like Stripe, else adjust)
    const totalRevenue = todayOrders.reduce((sum, order) => sum + (order.amount || 0), 0);

    res.json({
      totalOrders,
      totalRevenue, // in cents
    });
  } catch (err) {
    console.error("Error in today summary:", err);
    res.status(500).json({ error: "Failed to fetch today's metrics" });
  }
});

router.get("/top-selling", async (req, res) => {
  const ranges = {
    day: daysAgo(1),
    week: daysAgo(7),
    month: daysAgo(30),
  };

  try {
    const results = {};

    for (const [key, startDate] of Object.entries(ranges)) {
      const top = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: "$items" },
        { $group: { _id: "$items", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]);

      if (top.length) {
        const drink = await Drink.findOne({ name: top[0]._id }); // ✅ use `name` instead of `_id`
        results[key] = {
            name: drink?.name || top[0]._id || "Unknown",
            img: drink?.image || "",
            count: top[0].count,
        };
        } else {
        results[key] = { name: "None", img: "", count: 0 };
      }
    }

    res.json(results);
  } catch (err) {
    console.error("Top selling error:", err);
    res.status(500).json({ error: "Failed to fetch top-selling items" });
  }
});

module.exports = router;