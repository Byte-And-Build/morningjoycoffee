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

  console.log(order)

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Order Status</h2>
      <div className={styles.vertContainerInset}>
        <div className={styles.vertContainer} style={{flex: 1, paddingBottom: "1rem"}}>
          <span>For: {order?.customer}</span>
            <span className={styles.ingrediants}>
              {order.items.map((item, idx) => (
                <p key={idx}>{item}</p>
              ))}
            </span>
          <span>${(Number(order?.amount || 0) / 100).toFixed(2)}</span>
          </div>
          <div className={styles.vertContainer} style={{gap: ".5rem", alignItems: "center", flex: .75}}>
              <div className={styles.itemDetails} style={{textAlign: "center"}}>Created At: {new Date(order.createdAt).toLocaleString()}</div>
              <div className={` ${styles.userInput} ${order.status === "Complete!" ? styles.statusComplete : ""} ${order.status === "Making" ? styles.statusMaking : ""} `} style={{textAlign: "center"}}>{order.status}</div>
              <div className={styles.itemDetails} style={{textAlign: "center"}}>Updated At: {new Date(order.updatedAt).toLocaleString()}</div>
          </div>
        
      </div>
    </div>
  );
}
