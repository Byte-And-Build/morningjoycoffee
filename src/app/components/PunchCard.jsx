"use client";
import React from "react";
import styles from "../page.module.css";

const MAX_PUNCHES = 10;

export default function PunchCard({ rewards = 0 }) {
  return (
    <div className={styles.vertContainer}>
        <h2 className={styles.description}>Your Rewards</h2>
        <div className={styles.punchCard}>
        {Array.from({ length: MAX_PUNCHES }).map((_, i) => {
            const isPunched = i < rewards;
            return (
            <div
                key={i}
                className={`${styles.punchSlot} ${isPunched ? styles.punched : ""}`}
            >{i}</div>
            );
        })}
        </div>
        <strong className={styles.itemDetails}>Your 10th drink is on us!</strong>
    </div>
  );
}
