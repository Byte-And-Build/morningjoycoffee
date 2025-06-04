import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import React, { useState, useEffect, useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCart } from "../context/CartContext";
import { api } from "../utils/api";
import AntDesign from '@expo/vector-icons/AntDesign';

// Components
import Rating from "../components/Rating";

export default function DrinkDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // ✅ Initialize states properly to prevent rendering issues
  const [drink, setDrink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [thumbsDown, setThumbsDown] = useState(0);

  // ✅ Fetch drink data from API safely
  useEffect(() => {
    const fetchDrink = async () => {
      try {
        const response = await api.get(`/drinks/${id}`);
        const drinkData = response.data;
        console.log(drinkData);

        setDrink(drinkData);

        // ✅ Ensure `selectedSize` and `selectedPrice` are set correctly
        if (drinkData?.price?.length > 0) {
          setSelectedSize(Object.keys(drinkData.price[0])[0] || "");
          setSelectedPrice(parseFloat(Object.values(drinkData.price[0])[0]) || 0);
        }

        setThumbsUp(drinkData?.rating?.thumbsUp || 0);
        setThumbsDown(drinkData?.rating?.thumbsDown || 0);
      } catch (error) {
        console.error("Error fetching drink:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDrink();
  }, []);

  const totalPrice = useMemo(() => {
    const basePrice = selectedPrice || 0;
    const optionsTotal = selectedOptions.reduce((sum, o) => sum + (o.price || 0), 0);
    return (basePrice + optionsTotal) * count;
  }, [selectedPrice, selectedOptions, count]);   

  if (!drink) {
    return <Text style={{ textAlign: "center", marginTop: 50 }}>Drink not found</Text>;
  }

  const customOptions = [
    { name: "Extra Shot", price: 1.0 },
    { name: "Extra Flavor", price: 0.7 },
    { name: "Almond Milk", price: 1.0 },
    { name: "Oat Milk", price: 1.0 },
    { name: "Whole Milk/Cream", price: 1.0 },
    { name: "Glitter", price: 0.25 },
  ];

  const toggleOption = (option) => {
    setSelectedOptions((prev = []) => {
      const exists = prev.find((o) => o.name === option.name);
      return exists ? prev.filter((o) => o.name !== option.name) : [...prev, { ...option, price: Number(option.price) || 0 }];
    });
  };  

  const handleRatingUpdate = async (type) => {
    try {
      const response = await api.post(`/drinks/${String(id)}/rate`, { type });
      console.log(response.data)
      if (response.status === 200) {
        const updatedDrink = response.data;
        setThumbsUp(updatedDrink.rating.thumbsUp);
        setThumbsDown(updatedDrink.rating.thumbsDown);
      } else {
        console.error("Failed to update rating");
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  }; 

  return (
    <View style={styles.background}>
      <TouchableOpacity onPress={() => router.push("/")} style={styles.backBtn}>
        <AntDesign name="back" size={18} color="white" />
      </TouchableOpacity>

      <Image source={{ uri: drink.image }} style={styles.image} />

      <Text style={styles.drinkName}>{drink.name}</Text>
      <Rating item={drink} thumbsUp={thumbsUp} thumbsDown={thumbsDown} handleRatingUpdate={handleRatingUpdate} />
      <Text style={styles.priceText}>Total: ${totalPrice.toFixed(2)}</Text>
      <Text style={styles.ingredients}>{drink.ingrediants}</Text>

      {/* ✅ Ensure drink.price exists before using it */}
      {drink.price?.length > 0 && (
        <FlatList
          horizontal
          data={Object.keys(drink.price[0])}
          style={{width: "100%", height: "auto", flex: .5}}
          contentContainerStyle={styles.sizeWrapper}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedSize(item);
                setSelectedPrice(parseFloat(drink.price[0][item]));
              }}
              style={[styles.sizeOption, selectedSize === item && styles.optionSelected]}
            >
              <Text style={styles.optionText}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

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
      <View style={styles.cartQtyWrapper}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity onPress={() => setCount((prev) => Math.max(prev - 1, 1))} style={styles.qtyBtns}>
            <AntDesign name="minus" size={20} color="white" />
          </TouchableOpacity>
          <TextInput style={styles.qtyInput} value={`${count}`} editable={false} />
          <TouchableOpacity onPress={() => setCount((prev) => prev + 1)} style={styles.qtyBtns}>
            <AntDesign name="plus" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => addToCart({ ...drink, quantity: count, selectedSize, selectedPrice, customOptions: selectedOptions, totalPrice: parseFloat(totalPrice.toFixed(2)) })}
          style={styles.cartBtn}
        >
          <Text style={styles.cartText}>ADD TO CART</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  background: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "white" },
  image: { width: 250, height: 250, borderRadius: 10 },
  drinkName: { color: "rgb(245, 104, 221)", fontSize: 22, fontWeight: "bold", marginVertical: 10 },
  priceText: { fontSize: 18, color: "#888" },
  ingredients: { color: "rgb(245, 104, 221)", textAlign: "center", marginVertical: 10 },
  qtyContainer: { flexDirection: "row", justifyContent: "center" },
  qtyBtns: { height:25, width: 25, backgroundColor: "rgb(245, 152, 189)", alignItems: "center", justifyContent: "center", paddingVertical: 5, borderRadius: 25 },
  qtyText: { color: "white", fontSize: 20, fontWeight: "500" },
  qtyInput: { height: 25, width: 40, textAlign: "center", fontSize: 18 },
  sizeWrapper: { width: "100%", justifyContent: "space-evenly", height: 50 },
  sizeOption: { width: 50, height: 50, padding: 8, backgroundColor: "rgb(245, 152, 189)", borderRadius: 25, alignItems: "center", justifyContent: "center" },
  customOptions: { width: "100%", height: "auto", maxHeight: 165, },
  optionButton: { flex: 1, padding: 8, backgroundColor: "rgb(245, 173, 201)", borderRadius: 5, marginVertical: 5, marginHorizontal: 5, alignItems: "center"},
  optionSelected: { backgroundColor: "rgb(241, 97, 157)", },
  optionText: { fontSize: 12, color: "white" },
  backBtn: { backgroundColor: "rgb(245, 152, 189)", padding: 10, position: "absolute", top: 25, left: 25, borderRadius: 25, zIndex: 20 },
  cartBtn: { height:40, backgroundColor: "rgb(245, 152, 189)", padding: 10, borderRadius: 5, justifyContent: "center" },
  cartText: { color: "white", fontSize: 18 },
  cartQtyWrapper: { flex: 1, width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "baseline"}
});
