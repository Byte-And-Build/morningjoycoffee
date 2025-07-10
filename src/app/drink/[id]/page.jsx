'use client';
import styles from "../../../app/page.module.css";
import { useEffect, useState, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { api } from "../../utils/api";
import Rating from "../../components/Rating";
import Image from "next/image";

export default function DrinkDetails() {
  const router = useRouter();
  const { id } = useParams(); // ✅ This replaces router.query.id

  const { addToCart } = useCart();

  const [drink, setDrink] = useState(null);
  const [count, setCount] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [thumbsUp, setThumbsUp] = useState(0);
  const [thumbsDown, setThumbsDown] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchDrink = async () => {
      try {
        const response = await api.get(`/api/drinks/${id}`);
        const drinkData = response.data;
        setDrink(drinkData);
        console.log(drinkData)
        if (drinkData?.price?.length > 0) {
          const defaultSize = Object.keys(drinkData.price[0])[0];
          setSelectedSize(defaultSize);
          setSelectedPrice(parseFloat(drinkData.price[0][defaultSize]));
        }

        setThumbsUp(drinkData?.rating?.thumbsUp || 0);
        setThumbsDown(drinkData?.rating?.thumbsDown || 0);
      } catch (error) {
        console.error("Error fetching drink:", error);
      }
    };

    fetchDrink();
  }, [id]);

  const totalPrice = useMemo(() => {
    const optionsTotal = selectedOptions.reduce((sum, o) => sum + (o.price || 0), 0);
    return (selectedPrice + optionsTotal) * count;
  }, [selectedPrice, selectedOptions, count]);

  const customOptions = [
    { name: "Extra Shot", price: 1.0 },
    { name: "Extra Flavor", price: 0.7 },
    { name: "Almond Milk", price: 1.0 },
    { name: "Oat Milk", price: 1.0 },
    { name: "Whole Milk/Cream", price: 1.0 },
    { name: "Glitter", price: 0.25 },
    { name: "Caramel Drizzle", price: 1.0 },
    { name: "Whipped Cream", price: 1.0 },
    { name: "Half/Half (splash)", price: 1.0 },
    { name: "Cold Foam", price: 1.0 },
    { name: "Heavy Whipping Cream (splash)", price: 1.0 },
    { name: "Extra Pump Lotus", price: 1.0 },
    { name: "Blended", price: 1.0 },
    { name: "Breve (half/half)", price: 1.0 },
    { name: "Skim Milk", price: 1.0 },
    { name: "Coconut Milk", price: 1.0 },
    { name: "Whole Milk", price: 1.0 },
  ];

  const toggleOption = (option) => {
    setSelectedOptions((prev = []) => {
      const exists = prev.find((o) => o.name === option.name);
      return exists ? prev.filter((o) => o.name !== option.name) : [...prev, option];
    });
  };

  const handleRatingUpdate = async (type) => {
    try {
      const response = await api.post(`/api/drinks/${String(id)}/rate`, { type });
      if (response.status === 200) {
        const updated = response.data;
        setThumbsUp(updated.rating.thumbsUp);
        setThumbsDown(updated.rating.thumbsDown);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
    }
  };

  if (!drink) return <div className="text-center mt-10">Drink not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer}>
      <button
        onClick={() => router.push("/")}
        className={styles.backBtn}
      >
        ← Back
      </button>
      <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
      <Image src={drink.image} alt={drink.name} className={styles.drinkImage} width={256} height={256}/>
      </div>
      <h1 className={styles.itemName}>{drink.name}</h1>
      <Rating
        item={drink}
        thumbsUp={thumbsUp}
        thumbsDown={thumbsDown}
        handleRatingUpdate={handleRatingUpdate}
      />
      <p className={styles.drinkDetails}>{drink.description}</p>
      <p className={styles.drinkDetailsPrice}>Total: ${totalPrice.toFixed(2)}</p>

      <div className={styles.horizContainer} style={{justifyContent: "space-around", maxWidth: "80%"}}>
        {Object.keys(drink.price[0]).map((size) => (
          <button
            key={size}
            onClick={() => {
              setSelectedSize(size);
              setSelectedPrice(parseFloat(drink.price[0][size]));
            }}
            className={` ${selectedSize === size ? `${styles.selectedSize}` : `${styles.sizeBtns}`}`}
          >
            {size}
          </button>
        ))}
      </div>

      <div className={styles.optionContainer}>
        {customOptions.map((option) => (
          <button
            key={option.name}
            onClick={() => toggleOption(option)}
            className={`${selectedOptions.some(o => o.name === option.name) ? `${styles.optionBtnsSelected}` : `${styles.optionBtns}` }`}
          >
            {option.name} (+${option.price.toFixed(2)})
          </button>
        ))}
      </div>
      <div className={styles.horizContainer}>
        <div className={styles.qtyContainer}>
          <div style={{display: "flex",}}>
            <button onClick={() => setCount((c) => Math.max(c - 1, 1))} className={styles.qtyBtns}>-</button>
            <input value={count} readOnly className={styles.qtyInput} />
            <button onClick={() => setCount((c) => c + 1)} className={styles.qtyBtns}>+</button>
          </div>
          <button
            onClick={() => addToCart({
              ...drink,
              quantity: count,
              selectedSize,
              selectedPrice,
              customOptions: selectedOptions,
              totalPrice: parseFloat(totalPrice.toFixed(2))
            })}
            className={styles.btns}
          >
            Add to Cart
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}