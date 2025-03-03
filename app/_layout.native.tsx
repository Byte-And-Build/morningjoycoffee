import { useEffect, useState } from "react";
import { Text } from "react-native";
import { Slot } from "expo-router";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import * as Font from "expo-font";
import NavBar from "./components/NavBar";

// Stripe Imports
import { StripeProvider } from '@stripe/stripe-react-native';

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadAsync({
        "KenyanCoffeeRg": require("../assets/fonts/Kenyan-Coffee-Rg.otf"),
        "CreatoDisplayLt": require("../assets/fonts/CreatoDisplay-Light.otf"),
      });
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) return <Text>Loading...</Text>;

  return (
    <AuthProvider>
        {/* <StripeProvider publishableKey="pk_test_51QuQJVKsD8c2Ud4tb2Px3I1faecKUlngul2OkNKpmcFXnNPcHRmUJTq70gmzVaJ02QAJRl7KX3mGgfeTD3fxTK5R00Oq8T7sat"> */}
          <CartProvider>
            <Slot />
            <NavBar />
          </CartProvider>
        {/* </StripeProvider> */}
    </AuthProvider>
  );
}
