import { useState } from "react";
import { View, Text, FlatList, Button, Image, TextInput, StyleSheet, TouchableOpacity  } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "../context/CartContext";


export default function CartScreen() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();
  const [coupon, setCoupon] = useState(""); // Store coupon input

  // Calculate subtotal
  const subtotal = cart.reduce((acc, item) => {
    const basePrice = item.price * item.quantity;
    const extrasPrice = item.customOptions
      ? item.customOptions.reduce((extraAcc, extra) => extraAcc + extra.price, 0) * item.quantity
      : 0;
    return acc + basePrice + extrasPrice;
  }, 0);  

  return (
    <View style={styles.background}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Your Cart</Text>
      {cart.length === 0 ? (
        <View>
          <Text>Your cart is empty.</Text>
        </View>
      ) : (
        <>
        <View style={{height: "auto"}}>
        <FlatList data={cart} keyExtractor={(item) => item.id} renderItem={({ item }) => (
          <View style={styles.cartItems}>
            <Image source={{ uri: item.image }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 18 }}>{item.name}</Text>
              <Text>${item.price.toFixed(2)} x {item.quantity}</Text>
                {item.customOptions?.length > 0 && (
                <View style={{ marginTop: 5 }}>
                {item.customOptions.map((opt, index) => (
                  <Text key={index} style={{ color: "rgb(255, 225, 91)", fontSize: 12 }}>
                    - {opt.name} (+${opt.price.toFixed(2)}) {item.quantity > 1 ? `x${item.quantity}` : ''}
                  </Text>
                ))}
              </View>
            )}
          </View>
              <Button title="Remove" onPress={() => removeFromCart(item.id)} />
            </View>
          )}/>
          </View>
          {/* Subtotal Section */}
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Subtotal: ${subtotal.toFixed(2)}</Text>
          </View>

          {/* Coupon Input */}
          <View style={{width: "100%"}}>
          <Text style={{ fontSize: 16 }}>Have a coupon?</Text>
            <TextInput style={{textAlign: "center", fontWeight: "300", fontFamily: "CreatoDisplayLt", fontSize: 24, color: "#A134CF", 
              backgroundColor: "rgb(255, 111, 219)", padding: 5, margin: 10, borderRadius: 5}} placeholder="Enter coupon code" value={coupon} 
              onChangeText={setCoupon}>
            </TextInput>
          </View>

          {/* Checkout and Clear Cart Buttons */}
          <Button title="Checkout" onPress={() => router.push("/screens/checkout")} />
          <Button title="Clear Cart" onPress={clearCart} color="red" />
        </>
      )}
      </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
    backgroundColor: "rgb(255, 181, 236)"
  },
  cartItems: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    borderBottomColor: "hotpink",
    borderBottomWidth: 1,
    paddingBottom: 10
  },
  buttons: {backgroundColor: "rgb(255, 111, 219)", padding: 5, borderRadius: 5}
});