import { useState } from "react";
import { View, TouchableOpacity, StyleSheet, ScrollView, Text, TextInput, Image } from "react-native";
import AntDesign from '@expo/vector-icons/AntDesign';
import RNPickerSelect from 'react-native-picker-select';
import * as ImagePicker from 'expo-image-picker';
import { api } from "../utils/api";
import CurrencyInput from "./CurrencyInput";
import Toast from 'react-native-toast-message';

const EditItemPopUp = ({item, setEditPopUp, fetchDrinks}) => {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        _id: item._id,
        name: item.name,
        category: item.category,
        ingrediants: item.ingrediants,
        image: item.image,
        rating: item.rating || { thumbsUp: 0, thumbsDown: 0 }
      });      
      const availableSizes = ["Kids", "20oz", "24oz", "32oz"];

    const [sizes, setSizes] = useState(() => {
    const priceArray = item.price || [{}];
    const priceObj = priceArray[0]; // extract the first object

    return availableSizes.reduce((acc, size) => {
        const price = priceObj[size];
        acc[size] = {
        selected: price !== undefined,
        price: price !== undefined ? price : 0,
        };
        return acc;
    }, {});
    });

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

    const handleSave = async () => {
  const token = localStorage.getItem("token");

  const selectedPrices = Object.entries(sizes)
    .filter(([_, data]) => data.selected)
    .reduce((acc, [key, data]) => {
      acc[key] = data.price;
      return acc;
    }, {});

  const payload = {
    ...formData,
    price: [selectedPrices],
  };

  console.log(payload)

  try {
    const { data } = await api.post("/drinks/editInventory", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    Toast.show({
        type: 'success',
        text1: 'Drink updated!',
        position: 'bottom',
      });
    setEditPopUp(false);
    fetchDrinks();
  } catch (err) {
    console.error("Update error", err);
    alert("Failed to update drink.");
  }
};

    return ( 
        <View style={styles.overlay}>
            <ScrollView contentContainerStyle={styles.inventoryWrapper} style={{width: "90%"}}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setEditPopUp(false)}>
                <AntDesign name="close" size={24} color="black" style={{ textAlign: "right" }} />
                </TouchableOpacity>
            <View style={{display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 20}}>
                    <TextInput style={[styles.userInput, {flex: 1}]} placeholder="Name" value={formData.name} onChangeText={(val) => setFormData({ ...formData, name: val })} />
                    <View style={{flex: 1}}>
                        <RNPickerSelect
                            onValueChange={(val) => setFormData({ ...formData, category: val })}
                            value={formData.category}
                            placeholder={{ label: "Select a category", value: null }}
                            style={pickerSelectStyles}
                            items={[
                                { label: "Specialty Drink", value: "Specialty Drink" },
                                { label: "Coffee", value: "Coffee" },
                                { label: "Tea", value: "Tea" },
                                { label: "Smoothie", value: "Smoothie" },
                                { label: "Other", value: "Other" },
                            ]}
                            />
                        </View>
                </View>
            <View style={{display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 20}}>
                <Text style={{ fontWeight: "bold", fontSize: 14, marginBottom: 5 }}>Ingrediants</Text>
                <TextInput multiline style={[styles.userInput, {flex: .3}]} placeholder="Ingrediants" value={formData.ingrediants} onChangeText={(val) => setFormData({ ...formData, ingrediants: val })} />
                <View style={{display: "flex", flexDirection: "row", gap: 20}}>
                    <Text style={{ fontWeight: "bold", fontSize: 14, marginBottom: 5 }}>Sizes & Prices</Text>
                    {availableSizes.map((size) => (
                    <View key={size} style={{ flexDirection: "row", marginBottom: 8, flex: 1}}>
                        <View style={{flexDirection: "column", flex: 1, alignItems: "center"}}>
                            <View style={{flexDirection: "row", width: "100%", justifyContent: "start", paddingLeft: 10, paddingVertical: 10, gap: 5}}>
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
                    <Image source={{ uri: formData.image}} style={styles.imagePreview} />
                    <TouchableOpacity style={styles.buttons} onPress={handleSave}>
                    <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </ScrollView>
        </View>
     );
}
 
export default EditItemPopUp;

const styles = StyleSheet.create({
    overlay: {
      position: "absolute",
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
      flexDirection: "column"
    }
  });