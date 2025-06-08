'use client';
import { useState } from "react";
import { api } from "../utils/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await api.post("/users/forgot-password", { email });
      window.alert("Check your inbox for a reset link.");
    } catch (err) {
      console.error(err);
      window.alert("Something went wrong.");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Reset Your Password</h2>
      <label htmlFor="email">Email:</label>
      <input
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginTop: 10,
          marginBottom: 20,
          borderRadius: 6,
          border: "1px solid #ccc"
        }}
      />
      <button
        onClick={handleForgotPassword}
        style={{
          backgroundColor: "rgb(255, 111, 219)",
          color: "white",
          padding: 10,
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          width: "100%",
        }}
      >
        Send Reset Link
      </button>
    </div>
  );
}