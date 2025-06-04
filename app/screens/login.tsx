import { useState, useEffect } from "react";
import { View, Text, Image, TextInput, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { user, login } = useAuth(); // Get user after login
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Navigate to profile when the user state updates
  useEffect(() => {
    if (user) {
      router.replace("/screens/profile");
    }
  }, [user]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error("Login failed:", error);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <>
        <Image source={"https://bytenbuild.s3.us-east-2.amazonaws.com/clients/morningjoycoffee/images/Logo.png"} />
        <View style={{display: "flex", gap: 10}}>
            <TouchableOpacity style={styles.buttons} onPress={handleLogin}><Text style={{textAlign: "center", fontWeight: "300", fontFamily: "CreatoDisplayLt", fontSize: 24, color: "#A134CF"}}>LOGIN</Text></TouchableOpacity>
            <TouchableOpacity style={styles.buttons} onPress={() => router.push("/screens/register")}><Text style={{textAlign: "center", fontWeight: "300", fontFamily: "CreatoDisplayLt", fontSize: 24, color: "#A134CF"}}>REGISTER</Text></TouchableOpacity>
            <TouchableOpacity style={styles.forgot} onPress={() => router.push("/screens/forgotpassword")}><Text style={{textAlign: "center", fontWeight: "100", fontStyle: "italic", fontFamily: "CreatoDisplayLt", fontSize: 12, color: "white"}}>Forgot Password?</Text>            </TouchableOpacity>
        </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgb(250, 191, 212)", },
    title: { fontSize: 24, textAlign: "center", marginBottom: 20, fontFamily: "CreatoDisplayLt" },
    input: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 5, marginBottom: 10, backgroundColor: "white" },
    buttons: {backgroundColor: "rgb(255, 111, 219)", padding: 5, borderRadius: 5},
    forgot: { padding: 5, borderRadius: 5},
    logo: {position: "relative", width: "100%"}
  });