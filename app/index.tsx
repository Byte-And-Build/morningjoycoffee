import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet, Animated, ScrollView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import * as Animatable from "react-native-animatable";

import { SvgUri } from "react-native-svg";

// Import SVGs
// import LotusIcon from "../assets/icons/lotus.svg";
// import RedBullIcon from "../assets/icons/redbull.svg";

const categoryIcons = {
  "Lotus Energy": <SvgUri width="30" height="30" uri={require("../assets/icons/lotus.svg")} />,
  "Red Bull Infusions": <SvgUri width="30" height="30" uri={require("../assets/icons/redbull.svg")} />,
};

const { width } = Dimensions.get("window"); // Get device width
const itemWidth = (width - 60) / 2; // Adjust 60 based on padding/margin

const drinks = [
  { id: 0, name: "Buckin' Berry", category: "Lotus Energy", price: 6.0, ingrediants: "Blackberry, Blue Raspberry, Blue Lotus", image: "https://tinyurl.com/mvamxrxs" },
  { id: 1, name: "Indian Paintbrush", category: "Lotus Energy", price: 6.0, ingrediants: "Lime, Coconut, and Blue Lotus", image: "https://tinyurl.com/mvamxrxs" },
  { id: 2, name: "Yellowstone Tourist", category: "Lotus Energy", price: 6.0, ingrediants: "Peach, Mango, White Lotus", image: "https://tinyurl.com/mvamxrxs" },
  { id: 3, name: "Jackalope", category: "Lotus Energy", price: 6.0, ingrediants: "Green Apple, Blue Raspberry, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  { id: 4, name: "Smiley Mylee Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "White Chocolate, Salted Caramel, Caramel Drizzle", image: "https://tinyurl.com/mvamxrxs" },
  { id: 5, name: "Crazy Woman Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "Sugar Free Vanilla, NonFat Milk", image: "https://tinyurl.com/mvamxrxs" },
  { id: 6, name: "Mooster Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "English Toffee, Mocha, Chocolate Drizzle", image: "https://tinyurl.com/mvamxrxs" },
  { id: 7, name: "Old Faithful Macchiato", category: "Specialty Drinks", price: 6.0, ingrediants: "White Chocolate, Raspberry, Whipped Cream", image: "https://tinyurl.com/mvamxrxs" },
  { id: 8, name: "Pistachio Cold Brew Latte", category: "Specialty Drinks", price: 6.0, ingrediants: "Pistachio, Shortbread Cold Foam", image: "https://tinyurl.com/mvamxrxs" },
  { id: 9, name: "Caramel Macchiato", category: "Specialty Drinks", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 10, name: "Backslide", category: "Red Bull Infusions", price: 6.0, ingrediants: "Green Apple, Blue Raspberry, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  { id: 11, name: "Huckleberry Cheesecake", category: "Red Bull Infusions", price: 6.0, ingrediants: "Huckleberry, Cheesecake, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  { id: 12, name: "Hunting Widow", category: "Red Bull Infusions", price: 6.0, ingrediants: "Blue Rasp., Coconut, Vanilla, H&H, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  { id: 13, name: "Harley Hills", category: "Red Bull Infusions", price: 6.0, ingrediants: "Caramel Apple, Redbull", image: "https://tinyurl.com/mvamxrxs" },
  { id: 14, name: "Drip Coffee", category: "Coffee", price: 3.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 15, name: "Cold Brew", category: "Coffee", price: 4.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 16, name: "Americano", category: "Coffee", price: 4.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 17, name: "Latte", category: "Coffee", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 18, name: "Mocha", category: "Coffee", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 19, name: "Breve", category: "Coffee", price: 7.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 20, name: "Lavender London Fog", category: "Tea", price: 6.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 21, name: "Chai Latte", category: "Tea", price: 6.0, ingrediants: "Spiced or Vanilla", image: "https://tinyurl.com/mvamxrxs" },
  { id: 22, name: "Black Tea", category: "Tea", price: 3.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 23, name: "Italian Soda", category: "Tea", price: 5.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 24, name: "Jake's Carnival Italian Soda", category: "Tea", price: 5.0, ingrediants: "Blue Cotton Candy, Whipped Cream, Glitter, and Surprise", image: "https://tinyurl.com/mvamxrxs" },
  { id: 25, name: "Keyhole Strawberry Lemonade", category: "Tea", price: 5.0, ingrediants: "", image: "https://tinyurl.com/mvamxrxs" },
  { id: 26, name: "Specialty Hot Chocolate", category: "Tea", price: 5.0, ingrediants: "Choose another flavor for .70: pepermint, vanilla, salted caramel", image: "https://tinyurl.com/mvamxrxs" },
];

// const categoryIcons = {
//   "Lotus Energy": <LotusIcon width={30} height={30} />,
//   "Red Bull Infusions": <RedBullIcon width={30} height={30} />,
// };

export default function Index() {
  const router = useRouter();
  const categories = [...new Set(drinks.map((d) => d.category))];
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const filteredDrinks = drinks.filter((drink) => drink.category === selectedCategory);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={{height: "auto"}}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryButton, selectedCategory === cat && styles.selectedCategory]}
              onPress={() => {
                fadeAnim.setValue(0);
                setSelectedCategory(cat);
              }}
            >
              {categoryIcons[cat]}
              <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Drinks List */}
      <Animated.View style={{ opacity: fadeAnim, flex: 1, }}>
        <FlatList
          data={filteredDrinks}
          numColumns={2}
          columnWrapperStyle={styles.flatList}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Animatable.View animation="fadeInUp" duration={500} style={styles.drinkWrapper}>
              <TouchableOpacity onPress={() => router.push(`drink/${item.id}`)} style={styles.drinkContent}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={{ display: "flex", flex: 0.75, flexDirection: "column", gap: 10, justifyContent: "center", alignItems: "center" }}>
                  <Text style={styles.drinkName}>{item.name}</Text>
                  <Text style={styles.ingrediants}>{item.ingrediants}</Text>
                  <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                </View>
              </TouchableOpacity>
            </Animatable.View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    backgroundColor: "rgb(255, 181, 236)",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    marginTop: 30,
    height: 50,
    gap: 10,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "rgb(255, 219, 246)",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectedCategory: {
    backgroundColor: "rgb(252, 138, 181)",
  },
  categoryText: {
    fontSize: 16,
    color: "rgb(204, 2, 160)",
    fontFamily: "CreatoDisplayLt",
    fontWeight: "200",
  },
  selectedCategoryText: {
    color: "white",
    fontWeight: "700",
  },
  flatList:{
    display: "flex",
    width: "100%",
    gap: 10,
    justifyContent: "center"
  },
  drinkWrapper: {
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: "rgb(255, 219, 246)",
    borderWidth: 1,
    borderColor: "rgb(252, 138, 180)",
    width: itemWidth,
  },  
  drinkContent: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    justifyContent: "center",
    width: "100%",
    gap: 10,
  },
  image: {
    width: 40,
    height: 70,
    borderRadius: 5,
    marginRight: 20,
  },
  drinkName: {
    fontSize: 18,
    fontWeight: "200",
    fontFamily: "KenyanCoffeeRg",
    textAlign: "center"
  },
  price: {
    color: "rgb(204, 2, 160)",
  },
  ingrediants: {
    flex: 1,
    fontFamily: "CreatoDisplayLt",
    textAlign: "center"
  },
});