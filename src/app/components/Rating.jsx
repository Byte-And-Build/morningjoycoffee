"use client";
import styles from "../../app/page.module.css"
import { useAuth } from "../context/AuthContext";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

export default function Rating({ item, thumbsUp, thumbsDown, handleRatingUpdate }) {
  const { user } = useAuth();

  return (
    <div className={styles.horizWrapper} style={{gap:'1rem'}}>
      <button
        disabled={!user}
        onClick={() => user && handleRatingUpdate("thumbsUp")}
        className={styles.btns}
        style={{display:'flex', justifyContent:'center', alignItems:'center', padding:'.5rem', gap:'.5rem'}}
      >
        <span className={styles.ratingText}>{thumbsUp}</span>
        <FaThumbsUp size={'1.5rem'} className={styles.ratingText} />
      </button>
      <button
        disabled={!user}
        onClick={() => user && handleRatingUpdate("thumbsDown")}
        className={styles.btns}
        style={{display:'flex', justifyContent:'center', alignItems:'center', padding:'.5rem', gap:'.5rem'}}
      >
        <span className={styles.ratingText}>{thumbsDown}</span>
        <FaThumbsDown size={'1.5rem'} className={styles.ratingText} />
      </button>
    </div>
  );
}
