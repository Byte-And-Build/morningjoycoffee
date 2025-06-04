const mongoose = require("mongoose");

const MenuImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MenuImage", MenuImageSchema);
