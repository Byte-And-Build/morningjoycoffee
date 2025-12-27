"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import styles from "./page.module.css";
import { FaThumbsUp, FaSearch } from "react-icons/fa";
import Image from "next/image";
import mainImage from '../app/assets/mainImage.jpg';
import Logo from '../app/assets/Logo.webp';
import Placeholder from '../app/assets/drinkExample.png';
import SearchSymbol from '../app/assets/searchSymbol.svg';

export default function HomePage( ) {
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchItem, setSearchItem] = useState("")

  const BASE_INGREDIENTS = [
    "16oz Disposable Coffee Cup With Lid and Sleeves", 
    "20oz Disposable Coffee Cup With Lid and Sleeves",
    "32oz Clear Plastic Cup With Lid and Straw"];

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
  const normalizedSearch = searchItem.trim().toLowerCase();
  const filteredDrinks = drinks.filter((drink) => {
  // Category filter
  const matchesCategory =
    selectedCategory === "All" || drink.category === selectedCategory;

  // Search filter (name + category + optional ingredient match)
  if (!normalizedSearch) return matchesCategory;

  const nameMatch = (drink.name || "").toLowerCase().includes(normalizedSearch);
  const categoryMatch = (drink.category || "")
    .toLowerCase()
    .includes(normalizedSearch);

  // Optional: search across ingredients (across all sizes)
  const ingredientMatch =
    drink.sizes?.some((size) =>
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
        <Image src={mainImage} alt="Logo" style={{backgroundColor:'transparent'}}/>
      </div>
      <div className={styles.vertContainer}>
        <div className={styles.vertContainer} style={{width:'calc(100%-40px)', alignItems:'flex-start'}}>
          <div className={styles.searchWrapper}>
            <FaSearch style={{ width:'20px', height:'20px', fill:'var(--fontColor)'}}/>
            <input type="text" id='searchInput' htmlFor="searchInput" placeholder={searchItem ? searchItem : 'Search...'} onChange={(e) => setSearchItem(e.target.value)} style={{boxShadow:'none', padding:'0px', marginBottom:'0px', maxWidth:'unset', backgroundColor:'transparent', fontSize:'1.2rem'}} className={styles.ratingText}/>
          </div>
          <div className={styles.horizWrapperInset} style={{width:'100%', justifyContent:'flex-start', overflowX:'auto', overflowY:'hidden', borderRadius:'var(--borderRadiusSmall)'}}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.btns} ${selectedCategory === cat ? `${styles.btnsSelected}` : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
              ))}
            </div>
        </div>
        <div className={styles.gridContainer}>
          {filteredDrinks.map((item, index) => (
            <div key={index} className={styles.drinkWrapper} onClick={() => router.push(`/drink/${item._id}`)}>
              <div className={styles.ratingContainerHome}>
                <span className={styles.ratingText}>{item.rating?.thumbsUp || 0}</span>
                <FaThumbsUp size={'1.5rem'} className={styles.ratingText} />
              </div>
              {item && (
              <Image src={item.image ? item.image : Placeholder} alt={item.name} width={150} height={150}  className="drink-image" loading="lazy" />
              )}
              <h3 className={styles.drinkName}>{item.name}</h3>
              <ul style={{display:'flex', flexWrap:'wrap', flexDirection: 'row', width:'100%', height:'33%', overflowY:'auto', overflowX:'hidden', padding:'.5rem', gap:'.5rem', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusSmall)', alignContent:'flex-start'}}>
                {item.sizes?.[0]?.ingredients
                  ?.filter((ing) => 
                    ing && 
                    !BASE_INGREDIENTS.includes(ing.name) &&
                    ing.quantity > 0
                  )
                  .map((ing, i) => (
                    <span key={i} style={{color:'white', flex: "1", minWidth: "100%", fontSize: ".8rem", borderBottom: "1px dashed var(--fontColor)"}}>
                      +{ing.name}
                    </span>
                ))}

              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}