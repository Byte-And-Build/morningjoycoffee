import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function DealsScreen() {
  return (
    <View style={styles.background}>
        <View style={styles.container2}>
            <Text style={styles.title}>SPECIALS, DEALS, AND MORE!</Text>
            <Image source={require("../../assets/images/Menu_2-1-2025.jpg")} style={styles.image} resizeMode="contain"/>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    width: "100%",
    backgroundColor: "rgb(255, 181, 236)"
  },
  container2: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: 20,
    flex: 1
  },
  title: {
    fontSize: 24,
    fontWeight: "300",
    textAlign: "center",
    color: "yellow",
    fontFamily: "CreatoDisplayLt",
    position: "absolute",
    top: 75
  },
  image: {
    height: "100%",
    width: "100%",
    flex: 1,
  }
});

