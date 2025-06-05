const express = require("express");
const Stripe = require("stripe");
const User = require("../models/User");
const { protect } = require("./userRoutes");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", protect, async (req, res) => {
  const { amount, connectedAccountId, redeemReward, customerDetails, description } = req.body;
  console.log("Received Payment Request:", req.body);

  const userId = req.user._id;
  const user = await User.findById(userId);

  let finalAmountInCents = amount; // Amount should already be in cents from frontend

  if (redeemReward && user.rewards >= 10) {
    finalAmountInCents = 50; // 🎉 Set a minimum of $0.50
    user.rewards -= 10;
  }

  if (finalAmountInCents < 50) {
    return res.status(400).json({ error: "Total amount must be at least $0.50 USD." });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmountInCents, // ✅ Correct cents amount
      currency: "usd",
      // automatic_tax: { enabled: true },
      metadata: {
        customer_name: customerDetails?.name || "Guest",
        customer_email: customerDetails?.email || "No Email",
        order_description: description,
      },      
      transfer_data: { destination: connectedAccountId },
    });
    console.log("Created PaymentIntent Metadata:", paymentIntent.metadata);
    // 🎁 Award 1 point if they didn't redeem
    if (!redeemReward) {
      user.rewards += 1;
    }
    await user.save();

    console.log("⚡ Emitting new-order event");
    const io = req.app.get("io");
      io.emit("new-order", {
        description,
        customer: customerDetails.name || "Guest",
        items: description.split(", "),
      });

    res.status(200).json({ clientSecret: paymentIntent.client_secret, rewards: user.rewards });
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

module.exports = router;