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
    <div className={styles.page}>
      <div className={styles.vertContainer}>
        <div className={styles.vertContainer}>
          <h1 className={styles.heading}>Scan Me For Rewards!</h1>
          <p className={styles.itemDetails}>(10 points = 1 Free Drink!)</p>
        </div>
        <div className={styles.vertContainer}>
          <QRCodeCanvas value={user._id} size={256} />
        </div>
        <div className={styles.userContainer} style={{justifyContent: "center"}}>
          <div className={styles.vertContainer}>
            <p>{user.name}</p>
            <p>{user._id}</p>
          </div>
        </div>
      <div className={styles.userContainer} style={{justifyContent: "center"}}>
        <div className={styles.horizContainer}>
            <span className="label">Current Rewards:</span>
            <span className="rewards">{user.rewards} Points</span>
        </div>
        </div>
      </div>
    </div>
  );
}