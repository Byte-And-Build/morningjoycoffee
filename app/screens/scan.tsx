// screens/scan.tsx
import { View, Text, StyleSheet, Image } from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function ScanScreen() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/screens/login");
    }
  }, [token]);

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.blurBox}>
        <Text style={styles.title}>Scan Me For Rewards!</Text>
        <Image
          source={{ uri: "https://png.pngtree.com/pic_image.png" }}
          style={styles.image}
        />
        <View style={styles.infoWrapperBottom}>
          <View style={{padding: 10, width: "100%", flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgb(243, 147, 222)", borderRadius: 5}}>
            <Text style={styles.label}>Current Rewards:</Text>
            <Text style={styles.rewards}>{user.rewards} Points</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", backgroundColor: "rgb(255, 181, 236)" },
  blurBox: { height: "90%", width: "90%", borderRadius: 10, padding: 20, borderColor: "rgb(255, 75, 144)", borderWidth: 1 },
  title: { fontSize: 24, fontFamily: "KenyanCoffeeRg", textAlign: "center" },
  image: { height: "70%", width: "100%", resizeMode: "contain" },
  infoWrapperBottom: { flexDirection: "row", justifyContent: "space-between", width: "100%", padding: 10, borderRadius: 5, overflow: "hidden", position: "absolute", bottom: 0, left: 0 },
  label: { fontSize: 18, color: "rgb(247, 14, 255)" },
  rewards: { fontSize: 18, color: "rgb(255, 14, 183)", fontWeight: "bold" },
});
