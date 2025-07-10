const mongoose = require("mongoose");

const drinkSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Array,
  ingredients: [
    {
      ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true,
},
      name: { type: String },
      unit: { type: String },
      quantity: { type: Number, default: 1, }
    }
  ],
  description: String,
  image: String,
  rating: Object,
});

module.exports = mongoose.model("Drinks", drinkSchema);
