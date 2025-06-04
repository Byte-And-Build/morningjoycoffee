const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Array,
  ingrediants: String,
  image: String,
  rating: Object,
});

// const drinkSchema = new mongoose.Schema({
//   name: String,
//   category: String,
//   price: [{ type: Object }],
//   ingrediants: String,
//   image: String,
//   rating: {
//     thumbsUp: { type: Number, },
//     thumbsDown: { type: Number, }
//   }
// });


module.exports = mongoose.model("Drinks", drinkSchema);
