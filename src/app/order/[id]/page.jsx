"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "../../page.module.css";

export default function OrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fact, setFact ] = useState('')
  const [source, setSource ] = useState('')

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
      const res = await fetch(`https://uselessfacts.jsph.pl/api/v2/facts/random`);
      const ranFact = await res.json();
      setFact(ranFact.text)
      setSource(ranFact.source_url)
      console.log(ranFact)
    };
    fetchOrder();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!order) return <p>Order not found.</p>;

  console.log(order)

  return (
    <div className={styles.page} style={{display:'flex', justifyContent:'flex-start', gap:'1rem'}}>
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
              <div className={` ${styles.userInput} ${order.status === "Complete!" ? styles.statusComplete : ""} ${order.status === "Making" ? styles.statusMaking : ""} `} style={{textAlign: "center", minWidth:'30%'}}>{order.status}</div>
              <div className={styles.itemDetails} style={{textAlign: "center"}}>Updated At: {new Date(order.updatedAt).toLocaleString()}</div>
          </div>
          
      </div>
      <div className={styles.vertContainerInset} style={{flex:'1'}}>
        <span className={styles.ingredients}>Did you Know?</span>
        <p style={{fontSize:'1.5rem', fontFamily:'var(--font-sourGummy)', textAlign:'center'}}>{fact}</p>
        <span className={styles.ingredients} style={{fontStyle:'italic', fontSize:'.75rem'}}>Source: {source}</span>
      </div>
    </div>
  );
}
