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
      extraPrice: { type: Number },
      quantity: { type: Number, default: 1, }
    }
  ],
  description: String,
  image: String,
  rating: Object,
});

const drinkRatingSchema = new mongoose.Schema(
  {
    drinkId: { type: mongoose.Schema.Types.ObjectId, ref: "Drink", required: true, index: true },
    userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type:    { type: String, enum: ["thumbsUp", "thumbsDown"], required: true },
  },
  { timestamps: true }
);

// ✅ one rating per user per drink
drinkRatingSchema.index({ drinkId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Drinks", drinkSchema), mongoose.model("DrinkRating", drinkRatingSchema);
