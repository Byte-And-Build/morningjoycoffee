const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    drinkId: { type: mongoose.Schema.Types.ObjectId, ref: "Drinks", required: true },
    name: { type: String, required: true },

    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },

    // extras selected by customer (store Ingredient IDs, not names)
    extras: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" }],

    unitPrice: { type: Number, default: 0 },
    lineTotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true, index: true },
    customer: String,
    email: String,
    items: { type: [OrderItemSchema], default: [] },
    amount: Number,
    status: {
      type: String,
      enum: ["Queued", "Making", "Complete"],
      default: "Queued",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentIntentId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
