import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { PaymentElement, Elements, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";
import { useRouter } from "expo-router";

// Load the Stripe instance outside the component for performance reasons
const stripePromise = loadStripe("pk_test_51QuQJVKsD8c2Ud4tb2Px3I1faecKUlngul2OkNKpmcFXnNPcHRmUJTq70gmzVaJ02QAJRl7KX3mGgfeTD3fxTK5R00Oq8T7sat");

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
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

  const subtotal = cart.reduce((acc, item) => {
    const basePrice = item.price * item.quantity;
    const extrasPrice = item.customOptions
      ? item.customOptions.reduce((extraAcc, extra) => extraAcc + extra.price, 0) * item.quantity
      : 0;
    return acc + basePrice + extrasPrice;
  }, 0);

  // ✅ Generate a description string based on the cart items
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
      const { data } = await api.post("/stripe/create-payment-intent", {
        amount: subtotal,
        connectedAccountId: "acct_1QuR72JJQIShDhAu",
        description: description, // ✅ Added description field
      });
      setClientSecret(data.clientSecret);
    };
    createPaymentIntent();
  }, [subtotal, description]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout - ${subtotal.toFixed(2)}</Text>
      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm clientSecret={clientSecret} />
        </Elements>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
});