"use client";
import styles from "../../app/page.module.css";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(true);

  const PunchCard = dynamic(() => import("../components/PunchCard"), { ssr: false });

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (error) {
        console.error("❌ Failed to fetch profile", error);

        // Handle 401s cleanly
        if (error?.response?.status === 401) {
          logout();
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (!user) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token, user]);

  if (loading || !profile) return null;

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer} style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
        <h2 className={styles.heading}>
          Hello, <span>{profile?.name || "Guest"}!</span>
        </h2>
        <div className={styles.vertContainer} style={{paddingTop: ".5rem", paddingBottom: ".5rem"}}>
          <PunchCard rewards={profile?.rewards || 0} />
        </div>

        <div className={styles.vertContainer} style={{ paddingLeft: "1rem", paddingRight: "1rem" }}>
          {(profile?.role === "Admin" || profile?.role === "Employee") && (
            <>
              <button onClick={() => router.push("/scanner")} className={styles.btnsSmall}>Scan QR</button>
              <div className={styles.horizWrapper}>
                <button onClick={() => router.push("/inventory")} className={styles.btnsSmall}>Inventory</button>
                <button onClick={() => router.push("/incoming-orders")} className={styles.btnsSmall}>View Orders</button>
              </div>
            </>
          )}
          {profile?.role === "Admin" && (
            <button onClick={() => router.push("/metrics")} className={styles.btnsSmall}>Metrics</button>
          )}
          <button onClick={() => router.push("/user-orders")} className={styles.btns}>Your Orders</button>
          <button onClick={() => router.push("/user-settings")} className={styles.btns}>Settings</button>
          <button onClick={() => { logout(); router.replace("/") }} className={styles.btns}>Logout</button>
        </div>
      </div>
    </div>
  );
}