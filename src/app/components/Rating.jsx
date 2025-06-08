"use client";
import styles from "../../app/page.module.css"
import { useAuth } from "../context/AuthContext";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

export default function Rating({ item, thumbsUp, thumbsDown, handleRatingUpdate }) {
  const { user } = useAuth();

  return (
    <div className={styles.ratingWrapper}>
      <button
        disabled={!user}
        onClick={() => user && handleRatingUpdate("thumbsUp")}
        className={styles.ratingContainer}
      >
        <span className={styles.ratingText}>{thumbsUp}</span>
        <FaThumbsUp size={20} className="text-teal-600" />
      </button>
      <button
        disabled={!user}
        onClick={() => user && handleRatingUpdate("thumbsDown")}
        className={styles.ratingContainer}
      >
        <span className={styles.ratingText}>{thumbsDown}</span>
        <FaThumbsDown size={20} className="text-teal-600" />
      </button>
    </div>
  );
}
