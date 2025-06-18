"use client";
import { useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import styles from "../../app/page.module.css";

export default function ScannerPage() {
  const { token } = useAuth();
  const qrRegionId = "reader";
  const html5QrCodeRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const startScanner = async () => {
    if (!token) return;
    setIsScanning(true);

    html5QrCodeRef.current = new Html5Qrcode(qrRegionId);

    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        async (decodedText) => {
          // ✅ Stop scanner after successful scan
          await html5QrCodeRef.current.stop();
          await html5QrCodeRef.current.clear();
          setIsScanning(false);

          try {
            const res = await fetch(`/api/users/scan/${decodedText}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message || "Error");

            toast.success(`✅ Point added! Total: ${result.rewards}`);
          } catch (err) {
            toast.error("❌ Scan failed: " + err.message);
          }
        },
        (errorMessage) => {
          // 👇 Comment this out if you don't want constant warnings
          // console.warn("QR scan error:", errorMessage);
        }
      );
    } catch (err) {
      toast.error("Camera access failed or scanner error");
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      await html5QrCodeRef.current.stop();
      await html5QrCodeRef.current.clear();
      setIsScanning(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Scan Customer QR</h1>
<div className={styles.vertContainer}>
      <div id={qrRegionId} style={{width: "512px"}}/>

      {!isScanning ? (
        <div className={styles.vertContainer} style={{width: "80%"}}>
        <button className={styles.btns} onClick={startScanner}>
          Start Scan
        </button>
        </div>
      ) : (
        <div className={styles.vertContainer} style={{width: "80%"}}>
        <button className={styles.btns} onClick={stopScanner}>
          Cancel Scan
        </button>
        </div>
      )}
      </div>
    </div>
  );
}
