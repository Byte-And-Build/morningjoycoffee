const express = require("express");
const MenuImage = require("../models/MenuImage");
const { protect } = require("./userRoutes");
const requireRole = require("../middleware/requireRole");

const router = express.Router();

// GET current image
router.get("/image", async (req, res) => {
  try {
    const image = await MenuImage.findOne({});
    res.json({ url: image?.url || null });
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ message: "Failed to fetch image" });
  }
});

// POST new image (replace or insert)
router.post("/image", async (req, res) => {
  const { base64 } = req.body;
  if (!base64) return res.status(400).json({ message: "Missing image" });

  try {
    await MenuImage.findOneAndUpdate({}, { url: base64, lastUpdated: new Date() }, { upsert: true });
    res.json({ message: "Image updated" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to save image" });
  }
});

module.exports = router;
