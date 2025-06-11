"use client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import Logo from '../../app/assets/Logo.png';
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io(
  process.env.NODE_ENV === "development"
    ? "http://localhost:5050"
    : "https://morningjoycoffee-8807d101e92a.herokuapp.com",
  { transports: ["websocket"] }
);

export default function MetricsPage() {
  const [incomingOrders, setIncomingOrders] = useState([]);

  useEffect(() => {
  socket.on("connect", () => {
    console.log("✅ Connected to Socket.IO:", socket.id);
  });

  socket.on("disconnect", () => {
    console.warn("🔌 Disconnected from Socket.IO");
  });

  socket.on("new-order", (order) => {
    console.log("📦 New Order Received:", order);
    setIncomingOrders((prev) => [...prev, { ...order, status: "Pending" }]);
  });

  return () => {
    socket.off("new-order");
    socket.off("connect");
    socket.off("disconnect");
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
    <div className={styles.page}>
      <div className={styles.horizContainer}>
        <Image src={Logo} alt="Logo" width={80} height={80} content="contain"/>
        <h1 className={styles.heading}>Incoming Orders</h1>
      </div>
      {incomingOrders.map((item, index) => (
        <div key={index} className={styles.vertContainer}>
          <h2 className={styles.heading}>{item.customer}</h2>
          <p>{item.description}</p>
          <p>Status: <strong>{item.status}</strong></p>
          <div className={styles.itemWrapper}>
            {["Pending", "In Progress", "Ready", "Completed"].map((status) => (
              <button
                key={status}
                className="status-button"
                onClick={() => updateStatus(index, status)}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}