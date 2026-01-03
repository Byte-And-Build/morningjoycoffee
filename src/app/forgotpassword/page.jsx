'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../utils/api";
import styles from "../../app/page.module.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const router = useRouter();
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
    <div className={styles.page} style={{display:'flex', alignItems:'center'}}>
      <h2 className={styles.heading}>Reset Your Password</h2>
      <div className={styles.vertContainer} style={{flexGrow:'0'}}>
      <input
        className={styles.userInput}
        id="email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className={styles.horizWrapper}>
      <button
        onClick={handleForgotPassword}
        className={styles.btns}
      >
        Send Reset Link
      </button>
      <button
        onClick={() => router.push("/login")}
        className={styles.btns}
      >
        Back
      </button>
      </div>
      </div>
    </div>
  );
}