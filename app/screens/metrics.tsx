import { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { io } from "socket.io-client";

const socket = io(
  process.env.NODE_ENV === "development"
    ? "http://localhost:5050"
    : "https://morningjoycoffee-8807d101e92a.herokuapp.com",
  {
    transports: ["websocket"],
  }
);


const MetricsScreen = () => {
  const [incomingOrders, setIncomingOrders] = useState([]);

  useEffect(() => {
    socket.on("new-order", (order) => {
      setIncomingOrders((prev) => [...prev, { ...order, status: "Pending" }]);
    });

    return () => {
      socket.off("new-order");
    };
  }, []);

  const updateStatus = (index, newStatus) => {
    setIncomingOrders((prev) => {
      const updated = [...prev];
      updated[index].status = newStatus;
      return updated;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Incoming Orders</Text>
      <FlatList
        data={incomingOrders}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.orderCard}>
            <Text style={styles.customer}>{item.customer}</Text>
            <Text>{item.description}</Text>
            <Text>Status: {item.status}</Text>
            <View style={styles.buttonRow}>
              {["Pending", "In Progress", "Ready", "Completed"].map((status) => (
                <TouchableOpacity key={status} onPress={() => updateStatus(index, status)} style={styles.button}>
                  <Text>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  orderCard: { padding: 15, backgroundColor: "#f9c2ff", marginBottom: 10, borderRadius: 10 },
  customer: { fontWeight: "bold" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  button: { backgroundColor: "#fff", padding: 8, borderRadius: 5 },
});

export default MetricsScreen;
