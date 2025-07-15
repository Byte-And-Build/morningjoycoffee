"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./page.module.css";
import { FaThumbsUp } from "react-icons/fa";
import Image from "next/image";
import Logo from '../app/assets/Logo.png';
import Ingredient from "../../backend/models/Ingredient";

export default function HomePage({ setLaoding }) {
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

  if (loading) return (
  <div className={styles.page}>
    <Image src={Logo} width={256} height={256} alt="Logo" />
    <span>Loading...</span>
  </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer}>
        <div className={styles.horizWrapper}>
          <Image src={Logo} width={75} height={75} alt="Logo" content="contain" />
            <div className={styles.categoryContainer}>
            {categories.map(cat => (
              <button
                style={{flex: 1}}
                key={cat}
                className={`${styles.categoryButton} ${selectedCategory === cat ? `${styles.categoryButtonSelected}` : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
            </div>
      </div>
      <div className={styles.gridContainer}>
        {filteredDrinks.map((item, index) => (
          <div
            key={index}
            className={styles.drinkWrapper}
            onClick={() => router.push(`/drink/${item._id}`)}
          >
            <div className={styles.ratingContainerHome}>
              <span className={styles.ratingText}>{item.rating?.thumbsUp || 0}</span>
              <FaThumbsUp size={16} className={styles.ratingText} />
            </div>
            <img src={item.image} alt={item.name} className="drink-image" loading="lazy" />
            <div className={styles.drinkDetails}>
              <h3 className={styles.drinkName}>{item.name}</h3>
              {item.extras?.map((extra, i) => (
                <p key={i} className={styles.ingredients}>{extra.name}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
      
    </div>
  );
}