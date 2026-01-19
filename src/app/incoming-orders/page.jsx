"use client";
import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import Placeholder from "../../app/assets/Logo.webp";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const SOCKET_URL =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_SOCKET_URL
    ? process.env.NEXT_PUBLIC_SOCKET_URL
    : "http://localhost:5050";

const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  secure: process.env.NODE_ENV === "production",
  autoConnect: false, // ✅ we’ll connect only when token exists
});

function formatExtras(extras) {
  if (!Array.isArray(extras) || extras.length === 0) return "";
  return extras
    .map((x) => (typeof x === "string" ? x : x?.name))
    .filter(Boolean)
    .join(", ");
}

function formatItemLine(item) {
  if (!item || typeof item !== "object") return String(item ?? "");

  const qty = item.quantity ?? 0;
  const name = item.name ?? "Item";
  const size = item.size ? ` (${item.size})` : "";
  return `${qty}x ${name}${size}`;
}

const IncomingOrders = () => {
  const [orders, setOrders] = useState([]);
  const { user, token } = useAuth(); // ✅ grab both in one call

  useEffect(() => {
    if (!token) return;

    // 🔄 Initial fetch
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Failed to fetch orders:", err);
      }
    };

    fetchOrders();

    // 🔔 Socket connect + listeners
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("✅ Connected to socket server");
    });

    socket.on("new-order", (order) => {
      console.log("🆕 Incoming order:", order);
      toast.success(`🎉 New Order from ${order.customer}`);
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("order-status-updated-admin", (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    });

    return () => {
      socket.off("connect");
      socket.off("new-order");
      socket.off("order-status-updated-admin");
      // ✅ don’t disconnect the global socket here; other pages may use it
    };
  }, [token]);

  async function deleteOrder(id) {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      const res = await axios.delete("/api/orders/deleteOrder", {
        data: { _id: id },
        headers: { Authorization: `Bearer ${token}` },
      });

      const deletedId = res.data._id;

      setOrders((prev) => prev.filter((o) => o._id !== deletedId));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, updatedBy: user?._id }),
      });

      const updatedOrder = await res.json();

      // prefer server truth
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updatedOrder : o))
      );

      toast.info(`📦 Order status updated to ${newStatus}`);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("❌ Failed to update order status");
    }
  };

  return (
    <div
      className={styles.page}
      style={{ display: "flex", justifyContent: "flex-start", gap: "1rem" }}
    >
      <ToastContainer position="top-right" autoClose={2000} />

      {orders.length === 0 ? (
        <p>No incoming orders yet.</p>
      ) : (
        orders.map((order) => (
          <div key={order._id} className={styles.orderWrapper}>
            <p style={{ maxWidth: "15%", padding: "10px" }}>
              Order# {order.orderNumber ?? "—"}
            </p>

            <div className={styles.vertContainer} style={{ flex: 0.5, textAlign: "center" }}>
              <Image src={Placeholder} alt="Drink" width={60} height={60} />
              <span className={styles.ingredients}>{order.customer}</span>
            </div>

            <div
              className={styles.vertContainer}
              style={{ flex: 1, textAlign: "left", justifyContent: "flex-start" }}
            >
              <strong className={styles.strong}>Items:</strong>

              <ul
                className={styles.vertContainer}
                style={{ justifyContent: "flex-start", alignItems: "flex-start" }}
              >
                {Array.isArray(order.items) && order.items.length ? (
                  order.items.map((item, idx) => {
                    const extrasText = formatExtras(item.extras);
                    return (
                      <li key={`${String(item?.drinkId ?? "item")}-${idx}`} className={styles.itemDetails}>
                        {formatItemLine(item)}
                        {!!extrasText && (
                          <div style={{ fontSize: ".85rem", opacity: 0.8 }}>
                            Extras: {extrasText}
                          </div>
                        )}
                      </li>
                    );
                  })
                ) : (
                  <li className={styles.itemDetails} style={{ textAlign: "left" }}>
                    No items
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.vertContainer} style={{ maxHeight: "fit-content" }}>
              <select
                className={styles.btns}
                style={{ flex: "1", minWidth: "100%" }}
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                <option value="Queued">Queued</option>
                <option value="Making">Making</option>
                <option value="Complete">Complete</option>
              </select>

              {order.status === "Complete" ? (
                <button
                  className={styles.btns}
                  onClick={() => deleteOrder(order._id)}
                  style={{ color: "red", display: "flex", justifyContent: "center", fontSize: ".75rem" }}
                >
                  Delete Order?
                </button>
              ) : null}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default IncomingOrders;