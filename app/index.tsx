import { View, Text, TouchableOpacity, Image, StyleSheet, Animated, ScrollView, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import * as Animatable from "react-native-animatable";
import { api } from "./utils/api";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

export default function Index() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [drinks, setDrinks] = useState([]); // Default empty array
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(""); // Initialize as empty

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await api.get("/drinks");
        console.log("API Response:", response.data);
  
        if (response.data && response.data.length > 0) {
          const drinkData = response?.data || []; 
  
          setDrinks(drinkData);
          console.log(drinkData)
  
          if (drinkData.length > 0) {
            setSelectedCategory(drinkData[0].category);
          }
        } else {
          setDrinks([]);
        }
      } catch (error) {
        console.error("Error fetching drinks:", error);
        setDrinks([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchDrinks();
  }, []);
  

  // ✅ Prevent running hooks conditionally by ensuring categories are derived from drinks
  const categories = drinks.length > 0 ? [...new Set(drinks.map((d) => d.category)), "All"] : [];
  const filteredDrinks = selectedCategory === "All" || selectedCategory === "" ? drinks : drinks.filter((name) => name.category === selectedCategory);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [selectedCategory]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {categories.length === 0 ? (
        <Text style={{ textAlign: "center", fontSize: 18 }}>No drinks available</Text>
      ) : (
  <>
  <ScrollView  horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryContainer} style={{flexGrow: 0, paddingBottom: 20}}>
    {categories.map((cat) => (
      <TouchableOpacity
        key={cat}
        style={[styles.categoryButton, selectedCategory === cat && styles.selectedCategory]}
        onPress={() => {
          fadeAnim.setValue(0);
          setSelectedCategory(cat);
        }}
      >
        <Text style={[styles.categoryText, selectedCategory === cat && styles.selectedCategoryText]}>{cat}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
  <Image style={styles.backgroundImg} source={{ uri: 'https://bytenbuild.s3.us-east-2.amazonaws.com/clients/morningjoycoffee/images/Logo.PNG' }} resizeMode="center" />
  <ScrollView contentContainerStyle={styles.gridContainer}>
  {filteredDrinks.map((item, index) => (
    <Animatable.View key={index} animation="fadeInUp" duration={500} style={styles.drinkWrapper}>
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{item.rating.thumbsUp}</Text>
        <FontAwesome5 name="thumbs-up" size={20} color="white" />
      </View>

      <TouchableOpacity
        onPress={() => router.push(`/drink/${item._id}`)}
        style={styles.drinkContent}
      >
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.drinkDetails}>
          <Text style={styles.drinkName}>{item.name}</Text>
          <Text style={styles.ingrediants}>{item.ingrediants}</Text>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  ))}
</ScrollView>
</>

      )}
    </View>
  );
}


const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    minWidth: "100%",
    maxHeight: "100%",
    paddingTop: 20,
    overflowY: "auto"
  },
  drinkWrapper: {
    backgroundColor: "rgb(105, 44, 100)",
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgb(236, 195, 11)",
    padding: 10,
    height: 300,
    width: 225,
    position: "relative",
  },
  image: {
    width: 125,
    height: 125,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: "center",
  },
  drinkContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  drinkDetails: {
    alignItems: "center",
    justifyContent: "center",
  },
  drinkName: {
    fontSize: 30,
    fontWeight: "bold",
    fontFamily: "KenyanCoffeeRg",
    color: "rgb(236, 195, 11)",
    textAlign: "center",
  },
  ingrediants: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    marginTop: 5,
  },
  ratingContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  ratingText: {
    color: "white",
    fontSize: 14,
  },
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    backgroundColor: "rgb(250, 191, 212)",
    marginBottom: 60,
  },
  backgroundImg: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
    padding: 60
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
    zIndex: 60,
    paddingBottom: 80,
  },
  categoryButton: {
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "rgb(245, 152, 189)",
    flexDirection: "row",
    alignItems: "center",
    height: 45,
    cursor: "pointer",
  },
  selectedCategory: {
    backgroundColor: "rgb(241, 97, 157)",
  },
  categoryText: {
    fontSize: 16,
    color: "rgb(255, 255, 255)",
    fontFamily: "CreatoDisplayLt",
    fontWeight: "100",
    textAlign: "center"
  },
  selectedCategoryText: {
    fontWeight: "400",
    color: "rgb(255, 255, 255)",
  },
  flatList:{
    display: "flex",
    width: "100%",
    gap: 20,
    justifyContent: "center",
  },
  price: {
    color: "rgb(172, 232, 240)",
    textAlign: "center"
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    alignItems: "center"
  }
});