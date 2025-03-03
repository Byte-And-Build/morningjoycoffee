import { View, Text, TextInput, Image, Button, StyleSheet, TouchableOpacity, FlatList } from "react-native";
import React, { useState, useMemo } from 'react';
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCart } from "../context/CartContext";

const customOptions = [
  { name: "Extra Shot", price: 1.0 },
  { name: "Extra Flavor", price: 0.7 },
  { name: "Almond Milk", price: 1.0 },
  { name: "Oat Milk", price: 1.0 },
  { name: "Whole Milk/Cream", price: 1.0 },
  { name: "Glitter", price: 0.25 },
];

const drinks = {
  "0": { name: "Buckin' Berry", category: "Lotus Energy", price: 6.0, ingrediants: "Blackberry, Blue Raspberry, Blue Lotus", image: "https://bytenbuild.s3.us-east-2.amazonaws.com/clients/morningjoycoffee/images/DrinkExample2.png" },
  "1": { name: "Indian Paintbrush", category: "Lotus Energy", price: 6.0, ingrediants: "Lime, Coconut, and Blue Lotus", image: "https://bytenbuild.s3.us-east-2.amazonaws.com/clients/morningjoycoffee/images/DrinkExample.png" },
  "2": { name: "Yellowstone Tourist", category: "Lotus Energy", price: 6.0, ingrediants: "Peach, Mango, White Lotus", image: "https://tinyurl.com/mvamxrxs" },
  "3": { name: "Jackalope", category: "Lotus Energy", price: 6.0, ingrediants: "Green Apple, Blue Raspberry, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  "4": { name: "Smiley Mylee Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "White Chocolate, Salted Caramel, Caramel Drizzle", image: "https://tinyurl.com/mvamxrxs" },
  "5": { name: "Crazy Woman Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "Sugar Free Vanilla, NonFat Milk", image: "https://tinyurl.com/mvamxrxs" },
  "6": { name: "Mooster Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "English Toffee, Mocha, Chocolate Drizzle", image: "https://tinyurl.com/mvamxrxs" },
  "7": { name: "Old Faithful Macchiato", category: "Specialty Drinks", price: 6.0, ingrediants: "White Chocolate, Raspberry, Whipped Cream", image: "https://tinyurl.com/mvamxrxs" },
  "8": { name: "Pistachio Cold Brew Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "Pistachio, Shortbread Cold Foam", image: "https://tinyurl.com/mvamxrxs" },
  "9": { name: "Caramel Macchiato", category: "Specialty Drinks", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "10": { name: "Backslide", category: "Red Bull Infusions", price: 6.0, ingrediants: "Green Apple, Blue Raspberry, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  "11": { name: "Huckleberry Cheesecake", category: "Red Bull Infusions", price: 6.0, ingrediants: "Huckleberry, Cheesecake, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  "12": { name: "Hunting Widow", category: "Red Bull Infusions", price: 6.0, ingrediants: "Blue Rasp., Coconut, Vanilla, H&H, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  "13": { name: "Harley Hills", category: "Red Bull Infusions", price: 6.0, ingrediants: "Caramel Apple, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  "14": { name: "Drip Coffee", category: "Coffee", price: 3.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "15": { name: "Cold Brew", category: "Coffee", price: 4.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "16": { name: "Americano", category: "Coffee", price: 4.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "17": { name: "Latte", category: "Coffee", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "18": { name: "Mocha", category: "Coffee", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "19": { name: "Breve", category: "Coffee", price: 7.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "20": { name: "Lavender London Fog", category: "Tea", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "21": { name: "Chai Latte", category: "Tea", price: 6.0, ingrediants: "Spiced or Vanilla", image: "https://tinyurl.com/mvamxrxs" },
  "22": { name: "Black Tea", category: "Tea", price: 3.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "23": { name: "Italian Soda", category: "Tea", price: 5.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "24": { name: "Jake's Carnival Italian Soda", category: "Tea", price: 5.0, ingrediants: "Blue Cotton Candy, Whipped Cream, Glitter, and Surprise", image: "https://tinyurl.com/mvamxrxs" },
  "25": { name: "Keyhole Strawberry Lemonade", category: "Tea", price: 5.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  "26": { name: "Specialty Hot Chocolate", category: "Tea", price: 5.0, ingrediants: "Choose another flavor for .70: pepermint, vanilla, salted caramel", image: "https://tinyurl.com/mvamxrxs" },
};

export default function DrinkDetails() {
  const { id } = useLocalSearchParams();
  const drink = drinks[id as keyof typeof drinks];
  const { addToCart } = useCart();
  const router = useRouter();

  const [count, setCount] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState([]);

  if (!drink) return <Text>Drink not found</Text>;

  const toggleOption = (option) => {
    setSelectedOptions((prev) => {
      const exists = prev.find((o) => o.name === option.name);
      return exists ? prev.filter((o) => o.name !== option.name) : [...prev, option];
    });
  };

  const totalPrice = useMemo(() => {
    const optionsTotal = selectedOptions.reduce((sum, o) => sum + o.price, 0);
    return ((drink.price + optionsTotal) * count).toFixed(2);
  }, [drink.price, selectedOptions, count]);

  return (
    <View style={styles.background}>
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backBtn}><Text>Back</Text></TouchableOpacity>
      <Image source={{ uri: drink.image }} style={{ width: 300, height: 350, borderRadius: 10, backgroundColor: "rgb(255, 255, 255)" }} />
      <Text style={{ color:"rgb(245, 104, 221)", fontSize: 24, fontWeight: "bold", marginVertical: 10 }}>{drink.name}</Text>
      <Text style={{ fontSize: 18, color: "#888" }}>Total: ${totalPrice}</Text>
      <Text style={{ color:"rgb(245, 104, 221)", textAlign: "center", marginVertical: 10 }}>{drink.ingrediants}</Text>

      {/* Quantity Controls */}
      <View style={styles.qtyContainer}>
        <TouchableOpacity onPress={() => setCount((prev) => Math.max(prev - 1, 1))} style={styles.qtyBtns}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: "500" }}>-</Text>
        </TouchableOpacity>
        <TextInput style={styles.qtyInput} value={`${count}`} editable={false} />
        <TouchableOpacity onPress={() => setCount((prev) => prev + 1)} style={styles.qtyBtns}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: "500" }}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Options */}
      <FlatList
        numColumns={2}
        data={customOptions}
        style={styles.customOptions}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => toggleOption(item)}
            style={[styles.optionButton, selectedOptions.some((o) => o.name === item.name) && styles.optionSelected]}>
            <Text style={{ fontSize: 12, color: "white" }}>{item.name} (+${item.price.toFixed(2)})</Text>
          </TouchableOpacity>
        )}
      />

      {/* Cart & Navigation Buttons */}
      <View style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={() => addToCart({ id, ...drink, quantity: count, customOptions: selectedOptions, totalPrice })} style={styles.cartBtn}><Text style={styles.cartText}>ADD TO CART</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1, 
    padding: 20, 
    alignItems: "center", 
    backgroundColor: "rgb(255, 255, 255)",
  },
  qtyContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    paddingBottom: 20,
  },
  qtyBtns: {
    width: 40,
    backgroundColor: "rgb(247, 88, 162)",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
    borderRadius: 25,
  },
  qtyInput: {
    height: 40,
    width: 60,
    textAlign: "center",
    fontSize: 18
  },
  customOptions: {
    width: "100%",
    height: "auto",
    maxHeight: 165,
  },
  optionButton: {
    flex: 1,
    padding: 8,
    backgroundColor: "rgb(255, 195, 243)",
    borderRadius: 5,
    marginVertical: 5,
    marginHorizontal: 5,
    alignItems: "center",
  },
  optionSelected: {
    backgroundColor: "rgb(247, 88, 162)",
  },
  backBtn: {
    backgroundColor: "rgb(247, 88, 162)",
    padding: 10,
    position: "absolute",
    top: 25,
    left: 25,
    color: "black",
    zIndex: 50,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25
  },
  cartBtn: {
    backgroundColor: "rgb(247, 88, 162)",
    zIndex: 50,
    padding: 10,
    borderRadius: 25
  },
  cartText:{
    color: "white",
    fontFamily: "CreatoDisplayLt",
    fontSize: 18
  }
});
