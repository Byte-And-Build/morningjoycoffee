import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 5;
const INDICATOR_SIZE = 60;

const tabs = [
  { name: "Profile", icon: "person", route: "/screens/profile" },
  { name: "Deals", icon: "local-offer", route: "/screens/deals" },
  { name: "Drinks", icon: "local-cafe", route: "/" },
  { name: "Scan", icon: "qr-code-scanner", route: "/screens/scan" },
  { name: "Cart", icon: "shopping-cart", route: "/screens/cart" },
];

export default function NavBar() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(2);
  const indicatorPosition = useSharedValue(2 * TAB_WIDTH);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    left: indicatorPosition.value + TAB_WIDTH / 2 - INDICATOR_SIZE / 2,
  }));

  const handlePress = (index: number, route: string) => {
    setActiveIndex(index);
    indicatorPosition.value = withSpring(index * TAB_WIDTH, {
      damping: 12,
      stiffness: 90,
    });
    router.push(route);
  };

  return (
    <View style={styles.navWrapper}>
      {/* Floating Indicator (Placed Above Navbar) */}
      <View style={styles.indicatorWrapper}>
        <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      </View>

      {/* Navigation Bar */}
      <View style={styles.navContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          return (
            <TouchableOpacity key={tab.name} onPress={() => handlePress(index, tab.route)} style={styles.navButton}>
              <MaterialIcons name={tab.icon} style={styles.navIcon} size={isActive ? 36 : 30} color={isActive ? "#FFF" : "#bfe3fc"} />
              {isActive && <Text style={styles.navText}>{tab.name}</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrapper: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: "100%",
    alignItems: "center"
  },
  indicatorWrapper: {
    position: "absolute",
    top: -15, // ✅ Adjust to position the bubble above the icons
    width: "100%",
    height: INDICATOR_SIZE,
    zIndex: -1,
  },
  
  indicator: {
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: "rgb(255, 86, 151)",
    position: "absolute",
  },
  navContainer: {
    width: "100%",
    height: 70,
    flexDirection: "row",
    backgroundColor: "rgb(255, 86, 151)",
    justifyContent: "space-around",
    alignItems: "center",
    overflow: "visible",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10
  },
  navButton: {
    width: TAB_WIDTH,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 5,
  },
  navIcon: {
    color: "pink"
  }
});
