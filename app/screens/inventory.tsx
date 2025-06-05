import { View, FlatList, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import React, { useState, useEffect } from "react";
import * as Animatable from "react-native-animatable";
import { api } from "../utils/api";
import InventoryItem from "../components/InventoryItem";
import EditItemPopUp from "../components/EditItemPopUp";
import Toast from 'react-native-toast-message';
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { Dimensions } from "react-native";

export default function InventoryScreen() {
  const { user, token, isAuthLoading } = useAuth();
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editPopUp, setEditPopUp] = useState(false);
  const [deletePopUp, setDeletePopUp] = useState(false);

  const [authChecked, setAuthChecked] = useState(false); // ✅ Used to delay rendering

  useEffect(() => {
    if (!isAuthLoading) {
      if (!token || !user || (user.role !== "Admin" && user.role !== "Employee")) {
        router.replace("/screens/login");
      } else {
        setAuthChecked(true);
      }
    }
  }, [token, user, isAuthLoading]);

  useEffect(() => {
    if (authChecked) {
      fetchDrinks();
    }
  }, [authChecked]);

  const fetchDrinks = async () => {
    try {
      const response = await api.get("/drinks");
      setDrinks(response.data || []);
    } catch (error) {
      console.error("Error fetching drinks:", error);
    }
  };

  const startEdit = (item) => {
    setSelectedItem(item);
    setEditPopUp(true);
  };

  const handleDelete = async (_id) => {
    setSelectedItem(_id);
    setDeletePopUp(true);
    try {
      const token = localStorage.getItem("token");
      await api.post("/drinks/deleteInventory", { _id }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrinks((prev) => prev.filter((d) => d._id !== _id));
      Toast.show({ type: 'success', text1: 'Drink deleted!', position: 'bottom' });
      setDeletePopUp(false);
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete drink.");
    }
  };

  if (!authChecked || isAuthLoading) return null;

  const formatPriceBySize = (priceArray) => {
    const sizes = ["Kids", "20oz", "24oz", "32oz"];
    const priceObj = Array.isArray(priceArray) ? priceArray[0] : {};
  
    return sizes.map((size) => {
      const price = priceObj?.[size];
      return `${size}: ${price ? `$${Number(price).toFixed(2)}` : "n/a"}`;
    }).join("\n");
  };  
  
  

  return (
    <View style={{ flex: 1, padding: 10 }}>
      <View style={{ display: "flex", flexDirection: "row", zIndex: 50 }}>
        <Image source={require('../../assets/images/Logo.png')} style={styles.inventoryLogo} resizeMode="contain" />
        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 24 }}>Inventory</Text>
          <InventoryItem refreshDrinks={fetchDrinks}/>
        </View>
      </View>

      <FlatList
        style={{ paddingBottom: 80 }}
        data={drinks}
        numColumns={1}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Animatable.View animation="fadeInUp" duration={500} style={styles.itemWrapper}>
            <View style={styles.itemContainer}>
              <TouchableOpacity onPress={() => router.push(`/drink/${item._id}`)} style={{flex: .3}}>
                <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain"/>
              </TouchableOpacity>
              <View style={styles.detailsWrapper}>
                <Text style={[styles.itemName, { fontWeight: "700" }]}>{item.name}</Text>
                <Text style={styles.ingrediants}>{item.ingrediants}</Text>
              </View>
              <View style={styles.categoryWrapper}>
                <Text style={{ textAlign: "left", whiteSpace: "pre-line", paddingLeft: 10 }}>
                  {formatPriceBySize(item.price)}
                </Text>
              </View>
              <View style={styles.categoryWrapper}>
                <Text style={{textAlign: "center"}}>{item.category}</Text>
              </View>
              <View style={styles.ratingsWrapper}>
                <View style={styles.ratingsContainer}>
                  <FontAwesome5 name="thumbs-up" size={20} color="teal" />
                  <Text style={styles.itemName}>{item.rating.thumbsUp}</Text>
                </View>
                <View style={styles.ratingsContainer}>
                  <FontAwesome5 name="thumbs-down" size={20} color="teal" />
                  <Text style={styles.itemName}>{item.rating.thumbsDown}</Text>
                </View>
              </View>
              <View style={styles.editWrapper}>
                <TouchableOpacity style={styles.editContainer} onPress={() => startEdit(item)}>
                  <FontAwesome5 name="edit" size={24} color="black" />
                  <Text style={{ fontSize: 12 }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.editContainer} onPress={() => {setSelectedItem(item); setDeletePopUp(true) }}>
                  <FontAwesome5 name="trash-alt" size={24} color="red" />
                  <Text style={{ fontSize: 12, color: "red" }}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animatable.View>
        )}
      />

      {editPopUp && (
        <EditItemPopUp
          setEditPopUp={setEditPopUp}
          item={selectedItem}
          fetchDrinks={fetchDrinks}
        />
      )}

      {deletePopUp && (
        <View style={styles.popUp}>
          <View style={styles.editWrapper}>
            <Text style={{fontSize: 32, textAlign: "center", paddingBottom: 20}}>Are you sure you want to delete {selectedItem?.name}?</Text>
            <View style={{ flexDirection: "column", gap: 20, marginTop: 10, justifyContent: "center", alignItems: "center" }}>
              <TouchableOpacity style={styles.btnStandard} onPress={() => handleDelete(selectedItem?._id)}>
                <Text style={{ color: "red", fontWeight: "700", fontSize: 20, textAlign: "center" }}>Yes, Delete: {selectedItem?.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnStandard} onPress={() => setDeletePopUp(false)}>
                <Text style={{ color: "green", fontSize: 18 }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  itemWrapper: {
    flex: 1,
    padding: 5,
    width: "100%",
  },
  itemContainer: {
      display: "flex",
      flexDirection: "row",
      flex: 1,
      padding: 10,
      width: "100%",
      backgroundColor: "rgb(250, 191, 212)",
      borderRadius: 10
  },
  image: {
      height: "100%",
      borderRightWidth: 1,
      marginRight: 10
  },
  inventoryLogo: {
      height: 65,
      width: 65,
      borderRightWidth: 1,
      marginRight: 10
  },
  itemName: {
    fontSize: screenWidth * 0.04, // 4.5% of screen width
    fontFamily: "CreatoDisplayLt",
    textAlign: "left"
  },
  ingrediants: {
    fontSize: screenWidth * 0.03, // 4.5% of screen width
    fontFamily: "CreatoDisplayLt",
    textAlign: "left"
  },
  itemDetail: {
      fontSize: 18,
      fontFamily: "CreatoDisplayLt",
      textAlign: "center",
      justifyContent: "center",
  },
  detailsWrapper: {
      flex: .5,
      display: "flex",
      justifyContent: "center",
      borderRightWidth: 1,
      height: "100%",
      alignContent: "center"
  },
  categoryWrapper: {
    flex: .3,
      display: "flex",
      justifyContent: "center",
      borderRightWidth: 1,
      height: "100%",
      alignContent: "center"
  },
  ratingsWrapper: {
      flex: .2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-evenly",
      alignItems: "center",
      borderRightWidth: 1,
  },
  editWrapper: {
      flex: .2,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-around",
  },
  editContainer: {
      textAlign: "center",
      alignItems: "center",
      width: "100%",
  },
  inventoryWrapper: {
      display: "flex",
      flexDirection: "row",
      textAlign: "center",
  },
  inventoryName: {
      flex: 1,
  },
  inventoryRating: {
      flex: 1,
      justifyContent: "center",
      height: "100%"
  },
  inventorySettings: { 
      flex: 1,
      justifyContent: "center",
      height: "100%"
  },
  categoryContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      gap: 10,
      zIndex: 20,
    },
  ratingsContainer: {
      width: "100%",
      alignItems: "center"
  },
  popUp: {
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundColor: "rgb(255, 219, 246)",
      alignItems: "center",
      justifyContent: "center",

  },
  btnStandard: {
    borderRadius: 10,
    backgroundColor: "rgb(116, 52, 102)",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgb(253, 203, 94)",
    padding: 15
  }
});