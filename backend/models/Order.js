const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer: String,
    email: String,
    items: [String],
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);