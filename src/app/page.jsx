"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./page.module.css";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import heroImage from '../app/assets/heroImage.jpg';
import Logo from '../app/assets/Logo.webp';
import Placeholder from '../app/assets/drinkExample.png';
import ProductCard from "./components/ProductCard";

export default function HomePage( ) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchItem, setSearchItem] = useState("")

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("/api/items");
        const data = response.data || [];
        setItems(data);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const categories = items.length > 0 ? ["All", ...new Set(items.map(d => d.category))] : [];
  const normalizedSearch = searchItem.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
  // Category filter
  const matchesCategory =
    selectedCategory === "All" || item.category === selectedCategory;

  // Search filter (name + category + optional ingredient match)
  if (!normalizedSearch) return matchesCategory;

  const nameMatch = (item.name || "").toLowerCase().includes(normalizedSearch);
  const categoryMatch = (item.category || "")
    .toLowerCase()
    .includes(normalizedSearch);

  // Optional: search across ingredients (across all sizes)
  const ingredientMatch =
    item.sizes?.some((size) =>
      size.ingredients?.some((ing) =>
        (ing?.name || "").toLowerCase().includes(normalizedSearch)
      )
    ) ?? false;

  const matchesSearch = nameMatch || categoryMatch || ingredientMatch;

  return matchesCategory && matchesSearch;
});

  if (loading) return (
  <div className={styles.page} style={{alignContent:'center', display:'flex', justifyContent:'center'}}>
    <Image src={Logo} width={256} height={256} alt="Logo" />
    <span>Loading...</span>
  </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.heroContainer}>
        <Image src={Logo} alt="Logo" style={{position:'absolute', objectFit: "contain", height:'auto', filter:'invert(100)', zIndex:'2'}}/>
        <Image src={heroImage} alt="Hero Image" style={{backgroundColor:'transparent', width: '100vw', objectFit: "cover"}}/>
      </div>
      <div className={styles.vertContainer}>
        <div className={styles.vertContainer} style={{width:'calc(100%-40px)', alignItems:'flex-start'}}>
          <div className={styles.searchWrapper}>
              <FaSearch />
            <input type="text" id='searchInput' htmlFor="searchInput" placeholder={searchItem ? searchItem : 'Search...'} onChange={(e) => setSearchItem(e.target.value)} className={styles.input} style={{boxShadow:'none', padding:'0px', marginBottom:'0px', maxWidth:'unset', backgroundColor:'transparent', fontSize:'1.2rem'}} />
          </div>
          <div className={styles.horizWrapperInset} style={{width:'100%', justifyContent:'flex-start', overflowX:'auto', overflowY:'hidden', borderRadius:'var(--borderRadiusSmall)'}}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.ingredientItem} ${styles.btns} ${selectedCategory === cat ? `${styles.btnsSelected}` : `${styles.ingredientItem}`}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
              ))}
            </div>
        </div>
        <div className={styles.gridContainer}>
          <ProductCard filteredItems={filteredItems} />
        </div>
      </div>
    </div>
  );
}