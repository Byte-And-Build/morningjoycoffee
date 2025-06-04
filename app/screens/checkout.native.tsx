import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert, StyleSheet } from "react-native";
// import { useStripe, initPaymentSheet, presentPaymentSheet } from "@stripe/stripe-react-native";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";
import { useRouter } from "expo-router";

export default function CheckoutMobileScreen() {
  const { cart, clearCart } = useCart();
  const router = useRouter();
  const stripe = useStripe();

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

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
    const fetchPaymentSheet = async () => {
      const { data } = await api.post("/stripe/create-payment-intent", {
        amount: subtotal,
        connectedAccountId: "acct_1QuR72JJQIShDhAu",
        description: description,
      });

      setClientSecret(data.clientSecret);

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "Morning Joy Coffee",
      });

      if (error) {
        Alert.alert("Error initializing payment", error.message);
      }
    };

    fetchPaymentSheet();
  }, [subtotal, description]);

  const openPaymentSheet = async () => {
    setLoading(true);
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert("Payment failed", error.message);
    } else {
      Alert.alert("Success", "Your payment is confirmed!");
      clearCart();
      router.push("/screens/profile");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout - ${subtotal.toFixed(2)}</Text>
      <Button title="Pay Now" disabled={!clientSecret || loading} onPress={openPaymentSheet} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, textAlign: "center", marginBottom: 20 },
});