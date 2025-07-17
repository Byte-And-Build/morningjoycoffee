const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: String,
    email: String,
    items: [String],
    amount: Number,
    status: {
      type: String,
      enum: ["Queued", "Making", "Complete!"],
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
