import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { api } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await api.post("/users/forgot-password", { email });
      Alert.alert("Email Sent", "Check your inbox for a reset link.");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <View style={styles.container}>
      <Text>Enter your email to reset your password:</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" />
      <TouchableOpacity style={styles.buttons} onPress={handleForgotPassword}>
        <Text style={styles.btnText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "white" },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: "white" },
  buttons: {backgroundColor: "rgb(255, 111, 219)", padding: 10, borderRadius: 5},
  btnText: { color: "white", textAlign: "center" }
});
