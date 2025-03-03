import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Switch } from "react-native";
import { PaymentElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";
import { useRouter } from "expo-router";

const stripePromise = loadStripe("pk_test_51QuQJVKsD8c2Ud4tb2Px3I1faecKUlngul2OkNKpmcFXnNPcHRmUJTq70gmzVaJ02QAJRl7KX3mGgfeTD3fxTK5R00Oq8T7sat");

function CheckoutForm({ clientSecret, userRewards, setUserRewards, redeemReward }: { clientSecret: string; userRewards: number; setUserRewards: (rewards: number) => void; redeemReward: boolean }) {
  const { clearCart } = useCart();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin },
    });

    if (error) {
      alert(`Payment failed: ${error.message}`);
    } else if (paymentIntent?.status === "succeeded") {
      alert("Payment Successful!");
      clearCart();
      setUserRewards(redeemReward ? userRewards - 10 : userRewards + 1); // 🎯 Update rewards
      router.push("/screens/profile");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <PaymentElement />
      <Button title={loading ? "Processing..." : "Pay Now"} disabled={loading} onPress={handlePayment} />
    </View>
  );
}

export default function CheckoutMobileScreen() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [userRewards, setUserRewards] = useState(0);
  const [redeemReward, setRedeemReward] = useState(false);

  const subtotal = cart.reduce((acc, item) => {
    const basePrice = item.price * item.quantity;
    const extrasPrice = item.customOptions
      ? item.customOptions.reduce((extraAcc, extra) => extraAcc + extra.price, 0) * item.quantity
      : 0;
    return acc + basePrice + extrasPrice;
  }, 0);

  const description = cart
    .map((item) => {
      const options = item.customOptions?.length
        ? ` (Options: ${item.customOptions.map((opt) => opt.name).join(", ")})`
        : "";
      return `${item.quantity}x ${item.name}${options}`;
    })
    .join(", ");

  useEffect(() => {
    const createPaymentIntent = async () => {
      const token = localStorage.getItem("token"); // ✅ Assuming you stored token after login
      const { data } = await api.post(
        "/stripe/create-payment-intent",
        {
          amount: subtotal,
          connectedAccountId: "acct_1QuR72JJQIShDhAu",
          description: description,
          redeemReward,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add JWT token here
          },
        }
      );
      setClientSecret(data.clientSecret);
      setUserRewards(data.rewards);
    };
    createPaymentIntent();
  }, [subtotal, description, redeemReward]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout - ${subtotal.toFixed(2)}</Text>
      <Text>Your Reward Points: {userRewards}</Text>
        <View>
          <Text>Redeem 10 points for a free drink?</Text>
          <Switch value={redeemReward} onValueChange={setRedeemReward} />
        </View>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} userRewards={userRewards} setUserRewards={setUserRewards} redeemReward={redeemReward} />
        </Elements>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
});
