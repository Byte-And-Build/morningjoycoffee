const express = require("express");
const Stripe = require("stripe");
const User = require("../models/User");
const Order = require("../models/Order");
const { protect } = require("./userRoutes");
const { PaymentElement } = require("@stripe/react-stripe-js");
require("dotenv").config();

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/create-payment-intent", async (req, res) => {
  const { amount, connectedAccountId, redeemReward, customerDetails, description } = req.body;
  console.log("Received Payment Request:", req.body);

  let user;
  let finalAmountInCents = amount;

  if (req.user) {
    user = await User.findById(req.user._id);

    if (redeemReward && user.rewards >= 10) {
      finalAmountInCents = 50;
      user.rewards -= 10;
    }
  }

  if (finalAmountInCents < 50) {
    return res.status(400).json({ error: "Total amount must be at least $0.50 USD." });
  }

  try {
  const feePercent = 0.03;
  const applicationFee = Math.floor(finalAmountInCents * feePercent);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmountInCents,
      currency: "usd",
      payment_method_types: ["card"],
      metadata: {
        customer_name: customerDetails?.name || "Guest",
        customer_email: customerDetails?.email || "No Email",
        order_description: description,
      },
      transfer_data: {
        destination: connectedAccountId,
      },
      application_fee_amount: applicationFee, // 💸 Platform fee
      statement_descriptor_suffix: "MorningJoy Coffee", // 22 char max
    });

    if (user && !redeemReward) {
      user.rewards += 1;
      await user.save();
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      rewards: user?.rewards || 0,
    });
  } catch (error) {
    console.error("Stripe Payment Intent Error:", error);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

module.exports = router;