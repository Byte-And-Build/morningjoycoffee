import { View, TextInput, TouchableOpacity, Text, StyleSheet, Image, ScrollView } from "react-native";
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from "react";
import { api } from "../utils/api";

import CurrencyInput from "./CurrencyInput";

const InventoryItem = ({ refreshDrinks }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    category: "",
    ingrediants: "",
    image: "", // Will be a URI
    price: [{ "Kids": 0, "20oz": 0, "24oz": 0, "32oz": 0 }],
    rating: { thumbsUp: 0, thumbsDown: 0}
  });
  const availableSizes = ["Kids", "16oz", "20oz", "24oz", "32oz"];
  const [sizes, setSizes] = useState({
    "Kids": { selected: false, price: 0 },
    "16oz": { selected: false, price: 0 },
    "20oz": { selected: false, price: 0 },
    "24oz": { selected: false, price: 0 },
    "32oz": { selected: false, price: 0 },
    });

const availableExtras = [
    { name: "Extra Shot", price: 1.0 },
    { name: "Extra Flavor", price: 0.7 },
    { name: "Almond Milk", price: 1.0 },
    { name: "Oat Milk", price: 1.0 },
    { name: "Whole Milk/Cream", price: 1.0 },
    { name: "Glitter", price: 0.25 },
  ];
  const [extras, setExtras] = useState(() =>
    availableExtras.reduce((acc, extra) => {
      acc[extra.name] = { selected: false, price: extra.price };
      return acc;
    }, {})
  );


  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setFormData({ ...formData, image: base64Image });
      }
  };

  const handleAddOrEdit = async () => {
  const selectedPrices = Object.entries(sizes)
    .filter(([_, data]) => data.selected)
    .reduce((acc, [key, data]) => {
      acc[key] = data.price;
      return acc;
    }, {});

  const payload = {
    ...formData,
    price: selectedPrices,
  };

  try {
    const token = localStorage.getItem("token");
    const { data } = await api.post("/drinks/addInventory", payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Drink added:", data);
    alert("Drink added successfully!");

    resetForm();             // ✅ Clear the form
    setShowForm(false);      // ✅ Close the modal
    refreshDrinks();         // ✅ Refresh the inventory list

  } catch (err) {
    console.error("Error saving drink", err);
    alert("Failed to save drink");
  }
};

  const resetForm = () => {
  setFormData({
    _id: null,
    name: "",
    category: "",
    ingrediants: "",
    image: "",
    price: [{ "Kids": 0, "20oz": 0, "24oz": 0, "32oz": 0 }],
    rating: { thumbsUp: 0, thumbsDown: 0 }
  });

  setSizes({
    "Kids": { selected: false, price: 0 },
    "16oz": { selected: false, price: 0 },
    "20oz": { selected: false, price: 0 },
    "24oz": { selected: false, price: 0 },
    "32oz": { selected: false, price: 0 }
  });

  setExtras(() =>
    availableExtras.reduce((acc, extra) => {
      acc[extra.name] = { selected: false, price: extra.price };
      return acc;
    }, {})
  );
};


  return (
    <View>
      <TouchableOpacity onPress={() => setShowForm(true)} style={{alignContent: "center"}}>
        <Entypo name="add-to-list" size={24} color="black" />
        <Text>Add Item</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.inventoryWrapper} style={{width: "90%", paddingBottom: 120}}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowForm(false)}>
              <AntDesign name="close" size={24} color="black" style={{ textAlign: "right" }} />
            </TouchableOpacity>
                <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 20}}>
                    <TextInput style={[styles.userInput, {flex: 1}]} placeholder="Name" value={formData.name} onChangeText={(val) => setFormData({ ...formData, name: val })} />
                    <View style={{flex: 1}}>
                        <RNPickerSelect
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                            value={formData.category}
                            placeholder={{ label: "Category", value: null }}
                            style={pickerSelectStyles}
                            items={[
                                { label: "Specialty Drink", value: "Specialty Drink" },
                                { label: "Morning Joy Faves", value: "Morning Joy Faves" },
                                { label: "Coffee", value: "Coffee" },
                                { label: "Tea", value: "Tea" },
                                { label: "Lotus Energy", value: "Lotus Energy" },
                                { label: "Smoothie", value: "Smoothie" },
                                { label: "Red Bull Infusions", value: "Red Bull Infusions" },
                                { label: "Family Flaves", value: "Family Flaves" },
                                { label: "Other", value: "Other" },
                            ]}
                            />
                        </View>
                </View>
            <View style={{display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20}}>
                <Text style={{ fontWeight: "bold", fontSize: 14, marginBottom: 5 }}>Ingrediants</Text>
                <TextInput multiline style={[styles.userInput, {flex: .3}]} placeholder="Ingrediants" value={formData.ingrediants} onChangeText={(val) => setFormData({ ...formData, ingrediants: val })} />
                <View style={{display: "flex",}}>
                    <Text style={{ fontWeight: "bold", fontSize: 14, marginBottom: 5 }}>Sizes & Prices</Text>
                    {availableSizes.map((size) => (
                    <View key={size} style={{ flexDirection: "row", marginBottom: 8, flex: 1}}>
                        <View style={{flexDirection: "row", justifyContent: "flex-start", flex: 1, gap: 20}}>
                            <View style={{flexDirection: "row", paddingLeft: 10, gap: 5, justifyContent: "center", alignItems: "center"}}>
                                <TouchableOpacity onPress={() => setSizes((prev) => ({ ...prev, [size]: { ...prev[size], selected: !prev[size].selected }, }))} style={{ height: 20, width: 20, borderRadius: 4, borderWidth: 1, borderColor: "#999", backgroundColor: sizes[size].selected ? "#A134CF" : "#fff" }} />
                                <Text>{size}</Text>
                            </View>
                            <View style={{flex: 1}}>
                                <CurrencyInput value={sizes[size].price} onChange={(val) => setSizes((prev) => ({ ...prev, [size]: { ...prev[size], price: val }, })) } placeholder={`$ Price for ${size}`} />
                            </View>
                        </View>
                    </View>
                    ))}
                </View>
                <View style={{display: "flex", flexDirection: "column", justifyContent: "space-around", flex: 1, gap: 20}}>
                    <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                    <Text style={{ textAlign: "center", color: "white" }}>Pick an Image</Text>
                    </TouchableOpacity>
                    {formData.image !== "" && (
                    <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                    )}
                    <TouchableOpacity style={styles.buttons} onPress={handleAddOrEdit}>
                    <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgb(255, 166, 181)",
    zIndex: 999,
    alignItems: "center",
    flex: 1,
  },
  inventoryWrapper: {
    paddingVertical: 20,
    justifyContent: "center",
  },
  userInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: "white",
  },
  buttons: {
    backgroundColor: "rgb(255, 111, 219)",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  saveText: {
    textAlign: "center",
    fontWeight: "300",
    fontSize: 24,
    color: "#A134CF",
  },
  closeButton: {
    width: "100%",
    paddingBottom: 20,
  },
  imagePickerButton: {
    backgroundColor: "rgb(255, 111, 219)",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: "center"
  },
  imagePreview: {
    width: "100%",
    height: 150,
    resizeMode: "contain",
    borderRadius: 10,
    marginBottom: 10,
  },
});

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
      fontSize: 16,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      color: 'black',
      paddingRight: 30,
      backgroundColor: "white",
      marginBottom: 10,
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      color: 'black',
      paddingRight: 30,
      backgroundColor: "white",
      marginBottom: 10,
    },
    inputWeb: {
      fontSize: 16,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      color: 'black',
      paddingRight: 30,
      backgroundColor: "white",
      marginBottom: 10,
      flexDirection: "column",
    }
  });
  

export default InventoryItem;