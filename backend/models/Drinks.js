const mongoose = require("mongoose");

const SizeSubschema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  ingredients: [
    {
      ingredientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ingredient",
        required: true,
      },
      name: String,
      unit: String,
      quantity: { type: Number, default: 1 },
    }
  ]
}, { _id: false });

const drinkSchema = new mongoose.Schema({
  name: String,
  category: String,
  sizes: [ SizeSubschema ],
  extras: [
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
