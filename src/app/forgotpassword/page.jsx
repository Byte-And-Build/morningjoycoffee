'use client';
import { useState } from "react";
import { api } from "../utils/api";
import styles from "../../app/page.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleForgotPassword = async () => {
    try {
      await api.post("/users/forgot-password", { email });
      toast.success("Check your inbox for a reset link.");
    } catch (err) {
      console.error(err);
      toast.err("Something went wrong.");
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>Reset Your Password</h2>
      <div className={styles.vertConatiner}>
      <label htmlFor="email">Email:</label>
      <input
        className={styles.userInput}
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
      <div className={styles.horizWrapper}>
      <button
        onClick={handleForgotPassword}
        className={styles.btns}
      >
        Send Reset Link
      </button>
      </div>
      </div>
    </div>
  );
}