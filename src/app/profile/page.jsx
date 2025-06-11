"use client";
import styles from "../../app/page.module.css"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(user || null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!token) {
      router.replace("/login");
    } else if (!user) {
      const fetchProfile = async () => {
        try {
          const response = await api.get("/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setProfile(response.data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
        }
      };
      fetchProfile();
    }
  }, [token, user, isMounted]);

  if (!isMounted || (!profile && token)) return null;

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer}>
        <h2 className={styles.heading}>
          Hello, <span>{profile?.name || "Guest"}!</span>
        </h2>
        <div className={styles.vertContainer}>
          <div className={styles.userContainer}>
            <span className="info-label">Email:</span>
            <span className="info-value">{profile?.email || "Not Available"}</span>
          </div>
          <div className={styles.userContainer}>
            <span className="info-label">Rewards:</span>
            <span className="info-value">{profile?.rewards || 0} Points</span>
          </div>
        </div>
        <img
          src="https://png.pngtree.com/png-vector/20241030/ourlarge/pngtree-mock-up-coffee-paper-cup-on-isolate-png-image_14172288.png"
          alt="coffee"
          className={styles.profileImage}
        />

        <div className={styles.vertContainer}>
          <button onClick={() => router.push("/user-orders")} className={styles.btns}>Orders</button>
          <button onClick={() => router.push("/user-settings")} className={styles.btns}>Settings</button>
          <button onClick={() => { logout(); router.replace("/") }} className={styles.btns}>Logout</button>

          {(profile?.role === "Admin" || profile?.role === "Employee") && (
            <button onClick={() => router.push("/inventory")} className={styles.btns}>Inventory</button>
          )}
          {profile?.role === "Admin" && (
            <button onClick={() => router.push("/metrics")} className={styles.btns}>View Metrics</button>
          )}
        </div>
      </div>
    </div>
  );
}