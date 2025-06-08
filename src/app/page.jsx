"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./page.module.css";

export default function HomePage() {
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchDrinks = async () => {
      try {
        const response = await axios.get("/api/drinks");
        const data = response.data || [];
        setDrinks(data);
      } catch (err) {
        console.error("Error fetching drinks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrinks();
  }, []);

  const categories = drinks.length > 0 ? ["All", ...new Set(drinks.map(d => d.category))] : [];
  const filteredDrinks = selectedCategory === "All"
    ? drinks
    : drinks.filter(drink => drink.category === selectedCategory);

  if (loading) return <div className="loader">Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer}>
      <div className={styles.horizContainer}>
        <div className={styles.categoryContainer}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryButton} ${selectedCategory === cat ? `${styles.categoryButtonSelected}` : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {/* <img
        className={styles.backgroundImg}
        src="https://bytenbuild.s3.us-east-2.amazonaws.com/clients/morningjoycoffee/images/Logo.PNG"
        alt="Background"
      /> */}
      <div className={styles.gridContainer}>
        {filteredDrinks.map((item, index) => (
          <div
            key={index}
            className={styles.drinkWrapper}
            onClick={() => router.push(`/drink/${item._id}`)}
          >
            <div className={styles.ratingContainerHome}>
              <span className={styles.ratingText}>{item.rating?.thumbsUp || 0}</span>
              <span role="img" aria-label="thumbs-up">👍</span>
            </div>
            <img src={item.image} alt={item.name} className="drink-image" loading="lazy" />
            <div className={styles.drinkDetails}>
              <h3 className={styles.drinkName}>{item.name}</h3>
              <p className={styles.ingrediants}>{item.ingrediants}</p>
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}