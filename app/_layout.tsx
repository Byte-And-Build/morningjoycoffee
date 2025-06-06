import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Slot } from "expo-router";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { MaterialIcons } from '@expo/vector-icons';
import { FontAwesome5 } from "@expo/vector-icons";
import * as Font from "expo-font";
import NavBar from "./components/NavBar";
import Toast from 'react-native-toast-message';

export default function RootLayoutWeb() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
  const loadResources = async () => {
    await Font.loadAsync({
      "KenyanCoffeeRg": require("../assets/fonts/Kenyan-Coffee-Rg.otf"),
      "CreatoDisplayLt": require("../assets/fonts/CreatoDisplay-Light.otf"),
    });
    const stripe = await loadStripe("pk_test_...");
    setStripePromise(stripe);
    console.log("Stripe Promise Set");
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
          <Toast />
        </CartProvider>
      </Elements>
    </AuthProvider>
  );
}