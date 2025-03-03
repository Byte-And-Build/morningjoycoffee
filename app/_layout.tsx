import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Slot } from "expo-router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import * as Font from "expo-font";
import NavBar from "./components/NavBar";

export default function RootLayoutWeb() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      await Font.loadAsync({
        "KenyanCoffeeRg": require("../assets/fonts/Kenyan-Coffee-Rg.otf"),
        "CreatoDisplayLt": require("../assets/fonts/CreatoDisplay-Light.otf"),
      });
      const stripe = await loadStripe("pk_test_51QuQJVKsD8c2Ud4tb2Px3I1faecKUlngul2OkNKpmcFXnNPcHRmUJTq70gmzVaJ02QAJRl7KX3mGgfeTD3fxTK5R00Oq8T7sat");
      setStripePromise(stripe);
      console.log("Stripe Promise Set")
      setFontsLoaded(true);
    };
    loadResources();
  }, []);

  if (!fontsLoaded || !stripePromise) return <Text>Loading...</Text>;

  return (
    <AuthProvider>
      <Elements stripe={stripePromise}>
        <CartProvider>
          <Slot />
          <NavBar />
        </CartProvider>
      </Elements>
    </AuthProvider>
  );
}