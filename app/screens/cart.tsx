import { View, Text, FlatList, Button, Image, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function CartScreen() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const [coupon, setCoupon] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <View style={styles.background}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Your Cart</Text>
      {cart.length === 0 ? (
        <View>
          <Text>Your cart is empty.</Text>
        </View>
      ) : (
        <>
          <View style={{ height: "auto" }}>
            <FlatList
              data={cart}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.cartItems}>
                  <Image source={{ uri: item.image }} style={styles.image} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>{item.name}</Text>
                    <Text style={{ fontSize: 16 }}>Size: {item.selectedSize}</Text>
                    {item.customOptions?.length > 0 && (
                      <View style={{ marginTop: 5 }}>
                        {item.customOptions.map((opt, index) => (
                          <Text key={index} style={{ color: "rgb(245, 104, 221)", fontSize: 12 }}>
                            - {opt.name} (+${opt.price?.toFixed(2) || "0.00"})
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      style={styles.qtyBtns}
                    >
                      <AntDesign name="plus" size={20} color="rgb(255, 111, 219)" />
                    </TouchableOpacity>
                    <TextInput style={styles.qtyInput} value={`${item.quantity}`} editable={false} />
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                      style={styles.qtyBtns}
                    >
                      <AntDesign name="minus" size={20} color="rgb(255, 111, 219)"  />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.remContainer}>
                    <View>
                      <Text>${item.totalPrice.toFixed(2)}</Text>
                    </View>
                    <View style={{flex: .75, alignItems: "center"}}>
                      <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.removeBtns} ><Text style={{color: "white"}}>Remove</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}
            />
          </View>

          {/* ✅ Subtotal Section */}
          <View style={{ marginVertical: 10 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Subtotal: ${subtotal.toFixed(2)}</Text>
          </View>

          {/* ✅ Coupon Input */}
          {/* <View style={{ width: "100%" }}>
            <Text style={{ fontSize: 16 }}>Have a coupon?</Text>
            <TextInput
              style={{
                textAlign: "center",
                fontWeight: "300",
                fontFamily: "CreatoDisplayLt",
                fontSize: 24,
                color: "#A134CF",
                backgroundColor: "rgb(255, 111, 219)",
                padding: 5,
                margin: 10,
                borderRadius: 5,
              }}
              placeholder="Enter coupon code"
              value={coupon}
              onChangeText={setCoupon}
            />
          </View> */}

          {/* ✅ Checkout and Clear Cart Buttons */}
          <View style={{flexDirection: "column", gap: 10, position: "relative"}}>
            <TouchableOpacity style={styles.checkoutBtns} onPress={() => router.push("/screens/checkout")}>
              <Text style={styles.btnText}>Checkout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.clearBtns} onPress={clearCart}>
              <Text style={{color: "white"}}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: "rgb(255, 255, 255)",
  },
  cartItems: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    height: "auto",
    borderBottomColor: "hotpink",
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  buttons: { backgroundColor: "rgb(245, 152, 189)", padding: 5, borderRadius: 5 },
  btnText: { fontFamily: "CreatoDisplayLt", color: "white", fontSize: 24 },
  removeBtns: { backgroundColor: "rgb(245, 152, 189)", padding: 10, borderRadius: 5},
  qtyContainer: { flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1 },
  remContainer: { flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, gap: 10 },
  qtyBtns: {
    height: 30,
    width: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRadius: 25,
  },
  qtyText: { color:"rgb(247, 88, 162)", fontSize: 35, fontWeight: "300" },
  qtyInput: { height: 30, width: 60, textAlign: "center", fontSize: 18 },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  checkoutBtns:{paddingVertical: 20, borderRadius: 5, flex: .1, backgroundColor: "rgb(241, 97, 157)", alignItems: "center", justifyContent: "center",},
  clearBtns:{paddingVertical: 20, borderRadius: 5, flex: .1, backgroundColor:"rgb(243, 43, 43)", alignItems: "center", justifyContent: "center"}
});
