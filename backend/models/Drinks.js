const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Array,
  ingrediants: String,
  image: String,
  rating: Object,
});

module.exports = mongoose.model("Drinks", drinkSchema);
