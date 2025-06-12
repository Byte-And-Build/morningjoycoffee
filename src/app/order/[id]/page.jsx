"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../page.module.css";

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = await res.json();
        setOrder(data);
        setLoading(false);
      } catch (err) {
        console.error("❌ Failed to fetch order:", err);
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Order Status</h2>
      <div className={styles.horizWrapper}>
        <div className={styles.horizWrapper} style={{flex: 1}}>
            <ul className={styles.ingrediants}>
              {order.items.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles.vertContainer} style={{gap: ".5rem", alignItems: "center", flex: .5}}>
              <div className={styles.itemDetails} style={{textAlign: "center"}}>Created At: {new Date(order.createdAt).toLocaleString()}</div>
              <div className={styles.userInput} style={{textAlign: "center"}}>{order.status}</div>
              <div className={styles.itemDetails} style={{textAlign: "center"}}>Updated At: {new Date(order.updatedAt).toLocaleString()}</div>
          </div>
        
      </div>
    </div>
  );
}
