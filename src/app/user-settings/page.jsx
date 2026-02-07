"use client";
import styles from "../../app/page.module.css"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function UserSettings() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [edit, setEdit] = useState(false);

  useEffect(() => {
    
  })

  const saveSettings = async () => {
    try {
      const updateData = { name, email };
      if (password) updateData.password = password;

      await api.put("/users/profile", updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Your settings have been updated!");
      setEdit(false);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Could not update settings. Please try again.");
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Settings</h1>
    <form className={styles.vertContainer} style={{maxWidth:'60vw'}}>
      <div className={styles.horizWrapper} style={{boxShadow:'none'}}>
        <label>Name:</label>
        <input className={`${styles.userInput} settings-input ${!edit ? "disabled" : ""}`} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} disabled={!edit} />
      </div>
      <div className={styles.horizWrapper} style={{boxShadow:'none'}}>
        <label>Email:</label>
        <input className={`${styles.userInput} settings-input ${!edit ? "disabled" : ""}`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!edit} />
      </div>
      <div className={styles.horizWrapper} style={{boxShadow:'none'}}>
        <label>New Password:</label>
        <input className={`${styles.userInput} settings-input ${!edit ? "disabled" : ""}`} placeholder="New Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" disabled={!edit} />
      </div>
      <div className={styles.horizWrapper} style={{paddingLeft: "1rem", paddingRight: "1rem", boxShadow:'none'}}>
        <button className={styles.btns} onSubmit={(e) => {e.preventDefault(); if (edit) saveSettings(); setEdit(!edit);}}>
          {edit ? "Save!" : "Edit"}
        </button>
        <button className={styles.btns} onClick={() => router.push("/profile")}>
          Back to Profile
        </button>
      </div>
    </form>
  </div>
  );
}