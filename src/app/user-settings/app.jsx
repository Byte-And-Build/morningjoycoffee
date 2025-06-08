"use client";
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
    <div className="settings-container">
      <h1 className="settings-title">Settings</h1>

      <input
        className={`settings-input ${!edit ? "disabled" : ""}`}
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={!edit}
      />
      <input
        className={`settings-input ${!edit ? "disabled" : ""}`}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={!edit}
      />
      <input
        className={`settings-input ${!edit ? "disabled" : ""}`}
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        disabled={!edit}
      />

      <div className="button-group">
        <button
          className="settings-button"
          onClick={() => {
            if (edit) saveSettings();
            setEdit(!edit);
          }}
        >
          {edit ? "Save!" : "Edit"}
        </button>

        <button
          className="settings-button"
          onClick={() => router.push("/profile")}
        >
          Back to Profile
        </button>
      </div>
    </div>
  );
}