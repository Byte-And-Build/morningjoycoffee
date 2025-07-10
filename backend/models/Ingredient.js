const mongoose = require("mongoose");

const IngredientSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  unit:        { type: String, enum: ["g","ml","oz","piece"], default: "oz" },
  inStock:     { type: Number, default: 0 },      // current quantity on-hand
  reorderAt:   { type: Number, default: 0 },      // threshold for “low” alerts
  costPerUnit: { type: Number, default: 0.0 },    // optional: COGS tracking
  isExtra:     { type: Boolean, default: false }, // e.g. “Glitter”, “Cold Foam”
  extraPrice:  { type: Number, default: 0.0 },
});
module.exports = mongoose.model("Ingredient", IngredientSchema);
