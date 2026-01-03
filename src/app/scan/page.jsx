"use client";
import styles from "../../app/page.module.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { QRCodeCanvas } from "qrcode.react";

export default function ScanScreen() {
  const { user, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token]);

  if (!user) return null;

  return (
    <div className={styles.page} style={{display:'flex', alignContent:'center', flexDirection:'column', justifyContent:'center', paddingTop:'1rem', gap:'1rem'}}>
        <div className={styles.horizContainer} style={{padding: "15px", flexGrow:'0', width:'100%'}}>
          <div className={styles.vertContainer} style={{alignItems: "center"}}>
              <h1 className={styles.heading}>Scan Me For Rewards!</h1>
              <p className={styles.itemDetails}>(10 points = 1 Free Drink!)</p>
          </div>
          <div className={styles.vertContainer}>
            <h3>{user.name}</h3>
              <span className="label">Current Rewards:</span>
            <div className={styles.vertWrapperInset}>
              <span className="rewards">{user.rewards} Points</span>
            </div>
          </div>
        </div>
        <div className={styles.vertContainer} style={{boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusLarge)', justifyContent:'center'}}>
          <QRCodeCanvas value={user._id} size={256} />
          <p>{user._id}</p>
        </div>
    </div>
  );
}