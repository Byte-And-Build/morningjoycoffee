import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet, Animated, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import * as Animatable from "react-native-animatable";
import { api } from "./utils/api";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const { width } = Dimensions.get("window");
const itemWidth = (width - 75) / 2; // Adjust based on padding/margin

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
  const categories = drinks.length > 0 ? [...new Set(drinks.map((d) => d.category))] : [];
  const filteredDrinks = drinks && drinks.filter((name) => name.category === selectedCategory);
  console.log(filteredDrinks)

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
  <FlatList
    style={{overflow: "visible"}}
    data={filteredDrinks}
    numColumns={2}
    columnWrapperStyle={styles.flatList}
    keyExtractor={(item, index) => index.toString()}
    contentContainerStyle={{ paddingBottom: 20 }}
    renderItem={({ item }) => (
      <Animatable.View animation="fadeInUp" duration={500} style={styles.drinkWrapper}>
        <View style={{position: "absolute", display: "flex", flexDirection: "column", width: "100%", height: "100%", right: 5, top: 5, justifyContent: "flex-start", gap: 5 }}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>{item.rating.thumbsUp}</Text>
                <FontAwesome5 name="thumbs-up" size={20} color="white" />
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push(`/drink/${item._id}`)} style={styles.drinkContent} key={item._id}>
              <Image source={{ uri: item.image }} style={styles.image} contentFit="cover"/>
              <View style={styles.drinkDetails}>
                <Text style={styles.drinkName}>{item.name}</Text>
                <Text style={styles.ingrediants}>{item.ingrediants}</Text>
              </View>
            </TouchableOpacity>
      </Animatable.View>
    )}
  />
</>

      )}
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    width: "100%",
    backgroundColor: "rgb(250, 191, 212)",
  },
  backgroundImg: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 15,
    zIndex: 60,
  },
  categoryButton: {
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: "rgb(245, 152, 189)",
    flexDirection: "row",
    alignItems: "center",
    height: 50,
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
    flex: 1,
  },
  drinkWrapper: {
    borderRadius: 10,
    backgroundColor: "rgb(116, 52, 102)",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgb(253, 203, 94)",
    width: itemWidth,
    marginBottom: 20,
    height: 210, // Ensures enough space for content
    position: "relative",
    overflow: "visible", // Allows image to overflow
  },
  drinkContent: {
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    justifyContent: "center",
    width: "100%",
    position: "absolute",
    bottom: 0,
  },
  image: {
    width: 125, // Adjusted size for floating effect
    height: 125, // Ensure proportionate size
    borderRadius: 10,
    position: "absolute",
    bottom: 70, // Move image upwards
    // right: -10,
    // zIndex: 1, // Keeps image on top of the wrapper
  },
  drinkName: {
    fontSize: screenWidth * 0.055,
    fontWeight: "100",
    fontFamily: "KenyanCoffeeRg",
    textAlign: "center",
    color: "rgb(230, 159, 68)",
    zIndex: 10,
    borderRadius: 15,
    padding: 4
  },
  price: {
    color: "rgb(172, 232, 240)",
    textAlign: "center"
  },
  ingrediants: {
    flex: 1,
    // fontFamily: "CreatoDisplayLt",
    textAlign: "center",
    color:"rgb(255, 255, 255)",
    fontSize: screenWidth * 0.03,
  },
  ratingContainer: {
    alignItems: "center",
    // backgroundColor: "rgb(255, 219, 246)",
    // borderRadius: 10,
    flexDirection: "row-reverse",
    gap: 5
  },
  ratingText: {
    color: "rgb(255, 255, 255)",
    fontSize: 18,
    fontWeight: "400",
  }
});