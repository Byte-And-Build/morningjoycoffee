import { StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { View, Text } from "react-native-animatable";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api"; // Ensure you have an API instance set up

export default function UserSettingsScreen() {
    const { user, token } = useAuth(); 
    const router = useRouter();

    // State for user input
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState(""); // Keep empty unless changed
    const [edit, setEdit] = useState(false);

    // Function to save updated settings
    const saveSettings = async () => {
        try {
            const updateData = { name, email };
            if (password) updateData.password = password; // Only send password if changed

            const response = await api.put(
                "/users/profile",
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Alert.alert("Success", "Your settings have been updated!");
            setEdit(false); // Lock fields after saving

        } catch (error) {
            console.error("Update failed:", error);
            Alert.alert("Error", "Could not update settings. Please try again.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Settings</Text>

            <TextInput
                style={[styles.input, !edit && styles.disabledInput]}
                placeholder="Name"
                value={name}
                onChangeText={setName}
                editable={edit}
            />
            <TextInput
                style={[styles.input, !edit && styles.disabledInput]}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                editable={edit}
            />
            <TextInput
                style={[styles.input, !edit && styles.disabledInput]}
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={edit}
            />

            <View style={{ display: "flex", gap: 10 }}>
                <TouchableOpacity
                    style={styles.buttons}
                    onPress={() => {
                        if (edit) saveSettings(); 
                        setEdit(!edit);
                    }}
                >
                    <Text style={styles.buttonText}>{edit ? "Save!" : "Edit"}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.buttons}
                    onPress={() => router.push("/screens/profile")}
                >
                    <Text style={styles.buttonText}>Back to Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ✅ Added styles for disabled inputs
const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgb(250, 191, 212)", },
    title: { fontSize: 48, textAlign: "center", marginBottom: 20, fontFamily: "CreatoDisplayLt", color: "white" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginBottom: 10 },
    disabledInput: { backgroundColor: "#e0e0e0", color: "#a0a0a0" },
    buttons: { backgroundColor: "rgb(245, 152, 189)", padding: 10, borderRadius: 5 },
    buttonText: { textAlign: "center", fontWeight: "300", fontFamily: "CreatoDisplayLt", fontSize: 24, color: "rgb(255, 255, 255)" }
});

