// screens/scan.tsx
import { View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import QRCode from 'react-native-qrcode-svg';

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
      <View style={styles.mainWrapper}>
        <View style={{flex: .2}}>
        <Text style={styles.title}>Scan Me For Rewards!</Text>
        <Text style={{fontSize: 12, textAlign: "center", fontStyle: "italic"}}>(10 points = 1 Free Drink!)</Text>
        </View>
        <View style={styles.qrWrapper}>
          <QRCode value={user._id} size={256}/>
        </View>
        <View style={{flex: .5}}>
          <Text style={{textAlign: "center", fontWeight: "bold", fontSize: 24}}>{user.name}</Text>
          <Text style={{textAlign: "center", fontSize: 10}}>{user._id}</Text>
        </View>
        <View style={styles.infoWrapperBottom}>
          <View style={{padding: 15, width: "100%", flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgb(243, 147, 222)", borderRadius: 5, alignContent: "center"}}>
            <Text style={styles.label}>Current Rewards:</Text>
            <Text style={styles.rewards}>{user.rewards} Points</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, alignItems: "center", backgroundColor: "rgb(255, 255, 255)" },
  mainWrapper: { height: "95%", width: "100%", borderRadius: 10, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-around", gap: 20 },
  qrWrapper: { flex: 1, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-around", gap: 20 },
  title: { fontSize: 30, fontFamily: "KenyanCoffeeRg", textAlign: "center" },
  infoWrapperBottom: { flexDirection: "row", justifyContent: "space-between", width: "100%", padding: 5, borderRadius: 5, overflow: "hidden", position: "absolute", bottom: 30, left: 0 },
  label: { fontSize: 20, color: "rgb(247, 14, 255)" },
  rewards: { fontSize: 24, color: "rgb(255, 14, 183)", fontWeight: "bold" },
});
