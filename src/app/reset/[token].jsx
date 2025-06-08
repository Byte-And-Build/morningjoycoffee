"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../utils/api";

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/reset-password", { token, password });
      alert("Your password has been reset.");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Reset link expired or invalid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <h2 className="title">Reset Your Password</h2>

      <input
        type="password"
        placeholder="New Password"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        className="input"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button className="reset-button" onClick={handleReset} disabled={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </div>
  );
}