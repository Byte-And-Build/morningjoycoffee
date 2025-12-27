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
        style={{padding:'.5rem', alignItems:'center', display:'flex', justifyContent:'center'}}
      >
        <span className={styles.ratingText}>{thumbsUp}</span>
        <FaThumbsUp size={15} className="text-teal-600" />
      </button>
      <button
        disabled={!user}
        onClick={() => user && handleRatingUpdate("thumbsDown")}
        className={styles.btns}
         style={{ padding:'.5rem', alignItems:'center', display:'flex', justifyContent:'center'}}
      >
        <span className={styles.ratingText}>{thumbsDown}</span>
        <FaThumbsDown size={15} className="text-teal-600" />
      </button>
    </div>
  );
}
