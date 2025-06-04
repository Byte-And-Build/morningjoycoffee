import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext"; // if you have roles
import * as ImagePicker from "expo-image-picker";
import { api } from "../utils/api";

export default function DealsScreen() {
  const [menuImageUrl, setMenuImageUrl] = useState(null);
  const { user } = useAuth(); // for role checking

  useEffect(() => {
    const fetchMenuImage = async () => {
      try {
        const { data } = await api.get("/menu/image");
        setMenuImageUrl(data.url);
      } catch (err) {
        console.error("Failed to fetch menu image", err);
      }
    };
    fetchMenuImage();
  }, []);

  const pickNewImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission is required to access media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        await api.post("/menu/image", {
          base64: `data:image/jpeg;base64,${result.assets[0].base64}`,
        });
        alert("Menu image updated!");
        setMenuImageUrl(`data:image/jpeg;base64,${result.assets[0].base64}`);
      } catch (err) {
        console.error("Failed to upload image", err);
        alert("Upload failed");
      }
    }
  };

  return (
    <View style={styles.background}>
      <View style={styles.container2}>
        <Text style={styles.header}>Seasonal Menu</Text>
        {menuImageUrl ? (
          <Image source={{ uri: menuImageUrl }} style={styles.image} resizeMode="contain" alt="Seasonal Menu"/>
        ) : (
          <Text>Loading menu...</Text>
        )}
        {user?.role === "Admin" && (
          <TouchableOpacity onPress={pickNewImage} style={styles.uploadBtn}>
            <Text style={{ color: "white", fontSize: 20 }}>Upload New Menu</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    width: "100%",
    backgroundColor: "rgb(250, 191, 212)",
    flex: 1
  },
  header: {
    fontSize: 34,
    flex: .03,
    fontFamily: "KenyanCoffeeRg",
  },
  container2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: 1,
    padding: 20,
    width: "100%",
    paddingBottom: 100,
  },
  image: {
    flex: 1,
    width: "100%",
  },
  uploadBtn: {
    padding: 12,
    backgroundColor: "teal",
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: .05
  },
});