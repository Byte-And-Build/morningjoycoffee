import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../utils/api"

export default function ProfileScreen() {
    const { user, token, logout } = useAuth(); 
    const router = useRouter();
    const [profile, setProfile] = useState(user || null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // ✅ Prevent navigation before app layout is fully mounted
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        if (!token) {
            router.replace("/screens/login");
        } else if (!user) {
            const fetchProfile = async () => {
                try {
                    const response = await api.get("/users/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setProfile(response.data);
                } catch (error) {
                    console.error("Failed to fetch profile", error);
                }
            };
            fetchProfile();
        }
    }, [token, user, isMounted]);

    if (!isMounted || (!profile && token)) return null;

    return (
        <View style={styles.container}>
            <Text style={styles.greeting}>
                Hello, <Text>{profile?.name || "Guest"}!</Text>
            </Text>
            <View style={styles.infoMainWrapper}>
                <View  style={styles.infoWrapper}>
                    <Text style={styles.infoLabel}>Email:</Text>
                    <Text style={styles.infoText}>{profile?.email || "Not Available"}</Text>
                </View>
                <View style={styles.infoWrapper}>
                    <Text style={styles.infoLabel}>Rewards:</Text>
                    <Text style={styles.infoText}>{profile?.rewards || 0} Points</Text>
                </View>
                <Image
                    source={{ uri: "https://png.pngtree.com/png-vector/20241030/ourlarge/pngtree-mock-up-coffee-paper-cup-on-isolate-png-image_14172288.png" }}
                    style={styles.profileImage}
                />
                <View style={{ width: "100%", flex: 1, flexDirection: "column", gap: 10, paddingTop: 10 }}>
                    <TouchableOpacity style={styles.button} onPress={() => router.push("/screens/userSettings")}>
                        <Text style={styles.buttonText}>Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={() => { logout(); router.replace("/") }}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                    {(profile?.role === "Admin" || profile?.role === "Employee") && (
                        <TouchableOpacity style={styles.button} onPress={() => router.push("/screens/inventory")}>
                            <Text style={styles.buttonText}>Inventory</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
        backgroundColor: "rgb(250, 191, 212)",
        justifyContent: "center"
    },
    blurBox: {
        height: "80%",
        width: "90%",
        position: "absolute",
        top: 70,
        borderRadius: 10,
        borderColor: "white",
        borderWidth: 1,
        overflow: "hidden",
        padding: 20,
    },
    greeting: {
        fontSize: 24,
        fontWeight: "300",
        fontFamily: "KenyanCoffeeRg",
        textAlign: "center",
        paddingBottom: 10
    },
    infoMainWrapper: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        height: "90%",
    },
    infoWrapper: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: 5,
        padding: 10,
        borderRadius: 10,
        overflow: "hidden",
        backgroundColor: "rgb(245, 152, 189)",

    },
    infoLabel: {
        color: "rgb(255, 255, 255)",
        fontSize: 18,
        fontWeight: "bold",
    },
    infoText: {
        fontSize: 18,
        color: "rgb(191, 48, 226)",
    },
    profileImage: {
        height: 300,
        width: "100%",
        resizeMode: "contain",
    },
    button: {
        width: "100%",
        paddingVertical: 10,
        backgroundColor: "rgb(245, 152, 189)",
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 20,
        fontWeight: "200",
        color: "rgb(255, 255, 255)",
        fontFamily: "CreatoDisplayLt"
    },
});