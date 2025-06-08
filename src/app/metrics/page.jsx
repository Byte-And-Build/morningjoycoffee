"use client";
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
    <div className="metrics-container">
      <h1 className="metrics-header">Incoming Orders</h1>
      {incomingOrders.map((item, index) => (
        <div key={index} className="order-card">
          <h2 className="order-customer">{item.customer}</h2>
          <p>{item.description}</p>
          <p>Status: <strong>{item.status}</strong></p>
          <div className="button-row">
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