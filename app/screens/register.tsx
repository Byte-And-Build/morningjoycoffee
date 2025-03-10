import { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { BlurView } from "expo-blur";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    await register(name, email, password);
    router.push("/");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <View style={{display: "flex", gap: 10}}>
      <TouchableOpacity style={styles.buttons} onPress={handleRegister}><Text style={{textAlign: "center", fontWeight: "300", fontFamily: "CreatoDisplayLt", fontSize: 24, color: "#A134CF" }}>Sign Up!</Text></TouchableOpacity>
      <TouchableOpacity style={styles.buttons} onPress={() => router.push("/screens/login")}><Text style={{textAlign: "center", fontWeight: "300", fontFamily: "CreatoDisplayLt", fontSize: 24, color: "#A134CF" }}>Back to Login</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgb(255, 181, 236)" },
    title: { fontSize: 24, textAlign: "center", marginBottom: 20, fontFamily: "CreatoDisplayLt" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginBottom: 10 },
    buttons: {backgroundColor: "rgb(255, 111, 219)", padding: 10, borderRadius: 5}
  });