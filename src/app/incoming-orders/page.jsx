"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import Placeholder from "../../app/assets/Logo.png";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";

const socket = io(
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_SOCKET_URL
    ? process.env.NEXT_PUBLIC_SOCKET_URL
    : "http://localhost:5050",
  {
    transports: ["websocket"],
    secure: process.env.NODE_ENV === "production",
  }
);

const IncomingOrders = () => {
  const [orders, setOrders] = useState([]);
  const { user } = useAuth();

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
      toast.success(`🎉 New Order from ${order.customer}`);
      setOrders((prevOrders) => [order, ...prevOrders]);
    });

    socket.on("order-status-updated", (updatedOrder) => {
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        )
      );
    });

    return () => {
      socket.off("new-order");
      socket.disconnect();
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
  try {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: newStatus, updatedBy: user?._id }),
    });

    const updatedOrder = await res.json();

    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      )
    );

    toast.info(`📦 Order status updated to ${newStatus}`);
    socket.emit("order-status-updated", updatedOrder); // broadcast to others
  } catch (err) {
    console.error("Failed to update status:", err);
    toast.error("❌ Failed to update order status");
  }
};

  return (
    <div className={styles.page}>
      <ToastContainer position="top-right" autoClose={2000}/>
      {orders.length === 0 ? (
        <p>No incoming orders yet.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className={styles.orderWrapper}>
            <div className={styles.vertContainer} style={{flex: .5, textAlign: "center"}}>
              <Image src={Placeholder} alt="Drink" width={60} height={60} />
              <span className={styles.ingrediants}> {order.customer}</span>
            </div>
            <div className={styles.vertContainer} style={{flex: 1, textAlign: "left", justifyContent: "flex-start"}}>
              <strong className={styles.strong}>Items:</strong>{" "}
              <ul>
                {Array.isArray(order.items)
                  ? order.items.map((item, index) => <li key={index} className={styles.itemDetails}>{item}</li>)
                  : <li className={styles.itemDetails} style={{textAlign: "left"}}>{order.items}</li>}
              </ul>
            </div>
            <div style={{flex: 1, padding: "0 .25rem"}}>
              <select className={styles.btnsSmall} value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                <option className={styles.itemDetails} style={{textAlign: "center"}}>Queued</option>
                <option className={styles.itemDetails} style={{textAlign: "center"}}>Making</option>
                <option className={styles.itemDetails} style={{textAlign: "center"}}>Complete!</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default IncomingOrders;