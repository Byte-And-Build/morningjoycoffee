"use client";
import { useEffect, useState } from "react";
import styles from "../../app/page.module.css";
import Link from "next/link";
import Image from "next/image";
import Placeholder from "../../app/assets/Logo.webp";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const UserOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const {token} = useAuth();

  useEffect(() => {
  if (!token) return;

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("🛑 Unauthorized:", errData.message);
        setOrders([]); // Set to empty to avoid map crash
        return;
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  fetchOrders();
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

  return (
    <div className={styles.page} style={{justifyContent: "flex-start"}}>
      <h2>Your Purchases</h2>
      {loading ? (
        <p>Loading orders...</p>
        ) : Array.isArray(orders) && orders.length > 0 ? (
        orders.map((order, index) => (
          <div key={index} className={styles.orderWrapper}>
            <div className={styles.vertContainer} style={{flex: .5, textAlign: "center"}}>
              <Image src={Placeholder} alt="Drink" width={60} height={60} />
              <span className={styles.ingrediants}> {order.customer}</span>
            </div>
            <div className={styles.vertContainer} style={{flex: 1, textAlign: "left", justifyContent: "flex-start"}}>
              <ul>
              <strong className={styles.strong}>Items:</strong>{" "}
                {Array.isArray(order.items)
                  ? order.items.map((item, index) => <li key={index} className={styles.itemDetails}>{item}</li>)
                  : <li className={styles.itemDetails} style={{textAlign: "left"}}>{order.items}</li>}
              </ul>
            </div>
            <div className={styles.vertContainer} style={{flex: 1, gap:'1rem', padding: "0 .25rem"}}>
              <Link href={`/order/${order._id}`} className={styles.btns} style={order?.status === "Complete!" ? {color:'var(--colorComplete)'} : {color:'var(--fontColor)'}}>{order.status}</Link>
              {order.status === "Complete!" ? (
                <button className={styles.btns} onClick={()=>deleteOrder(order._id)} style={{maxWidth:'fit-content', fontSize:'12px', color: 'red'}}>Delete Order?</button>
                ):null}
            </div>
          </div>
        ))
        ) : (
        <p>No purchases found.</p>
        )}
    </div>
  );
};

export default UserOrdersScreen;
