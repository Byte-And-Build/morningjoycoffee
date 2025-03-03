import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function ProfileScreen() {
    const { user, token, logout } = useAuth(); 
    const router = useRouter();
    const [profile, setProfile] = useState(user || null);

    useEffect(() => {
        if (!token) {
            router.replace("/screens/login"); // Redirect to login if not logged in
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
    }, [token]);

    if (!profile) return null; // Prevents rendering before redirect

    return (
        <View style={styles.container}>
            <View style={styles.blurBox}>
                <Text style={styles.greeting}>
                    Hello, <Text>{profile?.name || "Guest"}!</Text>
                </Text>
                <View style={styles.infoMainWrapper}>
                    <BlurView intensity={10} tint="extraLight" style={styles.infoWrapper}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoText}>{profile?.email || "Not Available"}</Text>
                    </BlurView>
                    <BlurView intensity={10} tint="extraLight" style={styles.infoWrapper}>
                        <Text style={styles.infoLabel}>Rewards:</Text>
                        <Text style={styles.infoText}>{profile?.rewards || 0} Points</Text>
                    </BlurView>
                    <Image
                        source={{ uri: "https://png.pngtree.com/png-vector/20241030/ourlarge/pngtree-mock-up-coffee-paper-cup-on-isolate-png-image_14172288.png" }}
                        style={styles.profileImage}
                    />
                    <View style={{position: "absolute", width: "100%", bottom: 0, display: "flex", gap: 10}}>
                        <TouchableOpacity style={styles.button} onPress={() => { router.push("/screens/userSettings")}}>
                            <Text style={styles.buttonText}>Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => { logout(); router.replace("/")}}>
                            <Text style={styles.buttonText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
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
        backgroundColor: "rgb(255, 181, 236)",
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
    },
    infoMainWrapper: {
        display: "flex",
        gap: 10,
        alignItems: "center",
        minHeight: "90%",
        overflow: "hidden",
    },
    infoWrapper: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: 5,
        padding: 10,
        borderRadius: 10,
        overflow: "hidden",
    },
    infoLabel: {
        fontSize: 18,
        fontWeight: "bold",
    },
    infoText: {
        fontSize: 18,
    },
    profileImage: {
        height: "70%",
        width: "100%",
        resizeMode: "contain",
    },
    button: {
        width: "100%",
        paddingVertical: 10,
        backgroundColor: "rgb(225, 125, 255)",
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        fontSize: 20,
        fontWeight: "300",
        color: "rgb(255, 255, 255)",
        fontFamily: "CreatoDisplayLt"
    },
});