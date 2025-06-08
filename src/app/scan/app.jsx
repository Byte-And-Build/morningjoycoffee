"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import QRCode from "qrcode.react";

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
    <div className="scan-container">
      <div className="main-wrapper">
        <div className="header">
          <h1 className="title">Scan Me For Rewards!</h1>
          <p className="subtitle">(10 points = 1 Free Drink!)</p>
        </div>

        <div className="qr-wrapper">
          <QRCode value={user._id} size={256} />
        </div>

        <div className="user-info">
          <p className="user-name">{user.name}</p>
          <p className="user-id">{user._id}</p>
        </div>

        <div className="info-wrapper-bottom">
          <div className="rewards-box">
            <span className="label">Current Rewards:</span>
            <span className="rewards">{user.rewards} Points</span>
          </div>
        </div>
      </div>
    </div>
  );
}