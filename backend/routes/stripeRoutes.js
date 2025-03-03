const express = require("express");
const Stripe = require("stripe");
const User = require("../models/User");
const { protect } = require("./userRoutes");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// Create Payment Intent with Reward Logic
router.post("/create-payment-intent", protect, async (req, res) => {
  const { amount, connectedAccountId, redeemReward } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    let finalAmount = amount;
    if (redeemReward && user.rewards >= 10) {
      finalAmount = 0; // 🎉 Free drink applied
      user.rewards -= 10;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), 
      currency: "usd",
      application_fee_amount: Math.round(finalAmount * 0.02 * 100),
      transfer_data: { destination: connectedAccountId },
    });

    // 🎁 Award 1 point if they didn't redeem
    if (!redeemReward) {
      user.rewards += 1
    };
    await user.save();

    res.status(200).json({ clientSecret: paymentIntent.client_secret, rewards: user.rewards });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to create payment intent" });
  }
});

module.exports = router;