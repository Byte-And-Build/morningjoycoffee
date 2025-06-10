"use client";
import styles from "../../app/page.module.css";
import { useState } from "react";
import { api } from "../../app/utils/api";
import CurrencyInput from "../../app/components/CurrencyInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const availableSizes = ["Kids", "20oz", "24oz", "32oz"];

export default function EditItemPopUp({ item, setEditPopUp, fetchDrinks }) {
  const [formData, setFormData] = useState({
    _id: item._id,
    name: item.name,
    category: item.category,
    ingrediants: item.ingrediants,
    image: item.image,
    rating: item.rating || { thumbsUp: 0, thumbsDown: 0 },
  });

  const [sizes, setSizes] = useState(() => {
    const priceArray = item.price || [{}];
    const priceObj = priceArray[0];
    return availableSizes.reduce((acc, size) => {
      const price = priceObj[size];
      acc[size] = {
        selected: price !== undefined,
        price: price !== undefined ? price : 0,
      };
      return acc;
    }, {});
  });

  const pickImage = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");

    const selectedPrices = Object.entries(sizes)
      .filter(([_, data]) => data.selected)
      .reduce((acc, [key, data]) => {
        acc[key] = data.price;
        return acc;
      }, {});

    const payload = {
      ...formData,
      price: [selectedPrices],
    };

    try {
      await api.post("api/drinks/editInventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Drink updated!");
      setEditPopUp(false);
      fetchDrinks();
    } catch (err) {
      console.error("Update error", err);
      alert("Failed to update drink.");
    }
  };

  return (
    <div className={styles.overlay}>
        <div className={styles.horizContainer}>
          <input
            className={styles.userInput}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name"
          />
          <select
            className={styles.select}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="">Select a category</option>
            <option value="Specialty Drink">Specialty Drink</option>
            <option value="Coffee">Coffee</option>
            <option value="Tea">Tea</option>
            <option value="Smoothie">Smoothie</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <textarea
          value={formData.ingrediants}
          onChange={(e) => setFormData({ ...formData, ingrediants: e.target.value })}
          placeholder="Ingredients"
        />
        <h4>Sizes & Prices</h4>
        {availableSizes.map((size) => (
          <div key={size} className={styles.horizContainer}>
            <label>
              <input
                type="checkbox"
                checked={sizes[size].selected}
                onChange={() =>
                  setSizes((prev) => ({
                    ...prev,
                    [size]: { ...prev[size], selected: !prev[size].selected },
                  }))
                }
              />
              {size}
            </label>
            <CurrencyInput
              value={sizes[size].price}
              onChange={(val) =>
                setSizes((prev) => ({
                  ...prev,
                  [size]: { ...prev[size], price: val },
                }))
              }
              placeholder={`$ Price for ${size}`}
            />
          </div>
        ))}

        <button className={styles.btns} onClick={pickImage}>
          Upload Image
        </button>

        {formData.image && (
          <img src={formData.image} alt="Preview" className={styles.preview} />
        )}

        <button className={styles.btns} onClick={handleSave}>
          Save
        </button>
        <button className={styles.btns} onClick={() => setEditPopUp(false)}>
          Close
        </button>
      </div>
  );
}