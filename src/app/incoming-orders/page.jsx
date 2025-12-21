"use client";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import Placeholder from "../../app/assets/Logo.webp";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

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
  const {token} = useAuth();

  console.log(orders)
    
  useEffect(() => {
    if (!token) return;
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
  }, [token]);

  async function deleteOrder(id) {
  if (!window.confirm("Are you sure you want to delete this order?")) return;

  try {
    const res = await axios.delete("/api/orders/deleteOrder", {
      data: { _id: id },          // 👈 body goes under `data`
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const deletedId = res.data._id;

    // Remove it from local state
    setOrders((prevOrders) =>
      prevOrders.filter((order) => order._id !== deletedId)
    );

    toast.success("Order Deleted!");
  } catch (err) {
    console.error("❌ Failed to delete order:", err);
    toast.error("Failed to delete order");
  }
}

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
    <div className={styles.page} style={{padding:'40px 40px 80px 40px', display:'flex', justifyContent:'flex-start', gap:'1rem'}}>
      <ToastContainer position="top-right" autoClose={2000}/>
      {orders.length === 0 ? (
        <p>No incoming orders yet.</p>
      ) : (
        orders.map((order, index) => (
          <div key={index} className={styles.orderWrapper}>
            <p style={{maxWidth:'15%', padding:'10px'}}>Order# {index}</p>
            <div className={styles.vertContainer} style={{flex: .5, textAlign: "center"}}>
              <Image src={Placeholder} alt="Drink" width={60} height={60} />
              <span className={styles.ingredients}> {order.customer}</span>
            </div>
            <div className={styles.vertContainer} style={{flex: 1, textAlign: "left", justifyContent: "flex-start"}}>
              <strong className={styles.strong}>Items:</strong>{" "}
              <ul className={styles.vertContainer} style={{justifyContent:'flex-start', alignItems: 'flex-start'}}>
                {Array.isArray(order.items)
                  ? order.items.map((item, index) => <li key={index} className={styles.itemDetails}>{item}</li>)
                  : <li className={styles.itemDetails} style={{textAlign: "left"}}>{order.items}</li>}
              </ul>
            </div>
            <div className={styles.vertContainer} style={{maxHeight:'fit-content', padding:'1rem'}}>
              <select className={styles.btns} style={{minWidth:'100%'}} value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                <option className={styles.itemDetails} style={{textAlign: "center", fontSize:'1rem', backgroundColor:'rgba(109, 109, 109, 1)'}}>Queued</option>
                <option className={styles.itemDetails} style={{textAlign: "center", fontSize:'1rem', backgroundColor:'rgba(235, 177, 18, 1)'}}>Making</option>
                <option className={styles.itemDetails} style={{textAlign: "center", fontSize:'1rem', backgroundColor:'rgba(41, 126, 34, 1)'}}>Complete!</option>
              </select>
            {order.status === "Complete!" ? (
                <button className={styles.btns} onClick={()=>deleteOrder(order._id)} style={{color: 'red', display:'flex'}}>Delete Order?</button>
                ):null}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default IncomingOrders;