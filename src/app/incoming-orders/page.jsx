"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import Placeholder from "../../app/assets/Logo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5050",
  { transports: ["websocket"] }
);

const IncomingOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    // 🔄 Initial fetch
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders"); // This hits your GET route
        const data = await res.json();
        setOrders(data); // populate orders
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
      }
    };

    fetchOrders();

    // 🔔 Socket listener
    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    socket.on("new-order", (order) => {
      console.log("🆕 Incoming order:", order);
      const audio = new Audio("/new-order.mp3");
      audio.play();
      toast.success(`🎉 New Order from ${order.customer}`);
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    return () => {
      socket.off("new-order");
      socket.disconnect();
    };
  }, []);

  return (
    <div className={styles.vertContainer}>
      <ToastContainer />
      {orders.length === 0 ? (
        <p>No incoming orders yet.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className={styles.orderWrapper}>
            <Image src={Placeholder} alt="Drink" width={80} height={80} />
            <div className={styles.horizContainer}>
              <strong>Customer:</strong> {order.customer}
            </div>
            <div className={styles.horizContainer}>
              <strong>Items:</strong>{" "}
              {Array.isArray(order.items) ? order.items.join(", ") : order.items}
            </div>
            <div className={styles.horizContainer}>
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default IncomingOrders;