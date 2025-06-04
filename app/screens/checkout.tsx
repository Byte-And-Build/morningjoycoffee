import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Switch } from "react-native";
import { PaymentElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";

const stripePromise = loadStripe("pk_test_51QuQJVKsD8c2Ud4tb2Px3I1faecKUlngul2OkNKpmcFXnNPcHRmUJTq70gmzVaJ02QAJRl7KX3mGgfeTD3fxTK5R00Oq8T7sat");

function CheckoutForm({ clientSecret, userRewards, setUserRewards, redeemReward }: { clientSecret: string; userRewards: number; setUserRewards: (rewards: number) => void; redeemReward: boolean }) {
  const { clearCart, cart } = useCart();
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
  const { user } = useAuth();
  const [clientSecret, setClientSecret] = useState("");
  const [userRewards, setUserRewards] = useState(0);
  const [redeemReward, setRedeemReward] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const amountInCents = Math.round(subtotal * 100); // Convert to cents


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
      const token = localStorage.getItem("token"); 
      const amountInCents = Math.round(subtotal * 100); // Convert to cents
    
      if (amountInCents < 50) {
        alert("Total amount must be at least $0.50 USD.");
        return;
      }
    
      try {
        const { data } = await api.post(
          "/stripe/create-payment-intent",
          {
            amount: amountInCents,  // Send in cents
            connectedAccountId: "acct_1QuR72JJQIShDhAu",
            description: description,
            redeemReward,
            customerDetails: {
              name: `${user?.name}` || "Guest", // Replace with actual user data
              email: `${user?.email}` || "guest@email.com",
            },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClientSecret(data.clientSecret);
        setUserRewards(data.rewards);
      } catch (error) {
        console.error("Error creating payment intent:", error);
        alert("Failed to process payment. Please try again.");
      }
    };      
    createPaymentIntent();
  }, [subtotal, description, redeemReward]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout - ${subtotal.toFixed(2)}</Text>
      <Text>Your Reward Points: {userRewards}</Text>
      { userRewards && userRewards >= 10 && (
        <View>
            <Text>Redeem 10 points for a free drink?</Text>
          <Switch value={redeemReward} onValueChange={setRedeemReward} />
        </View>
      )}
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} userRewards={userRewards} setUserRewards={setUserRewards} redeemReward={redeemReward} />
        </Elements>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: .9, justifyContent: "center", padding: 20, paddingBottom: 20, overflowY: "auto" },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
});
