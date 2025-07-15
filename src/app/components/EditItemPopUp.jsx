"use client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { api } from "../../app/utils/api";
import CurrencyInput from "../../app/components/CurrencyInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const availableSizes = ["Kids", "20oz", "24oz", "32oz"];

export default function EditItemPopUp({ item, setEditPopUp, fetchDrinks }) {
  
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [formData, setFormData] = useState({
    _id: item._id,
    name: item.name,
    category: item.category,
    ingredients: item.ingredients || [],
    description: item.description,
    image: item.image,
    rating: item.rating || { thumbsUp: 0, thumbsDown: 0 },
  });
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);
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

  useEffect(() => {
  const fetchIngredients = async () => {
    try {
      const res = await api.get("api/drinks/ingredients");
      const allIngredients = res.data || [];
      setAvailableIngredients(allIngredients);

      // Normalize only if needed
      const normalized = (item.ingredients || []).map((ing) => {
        if (typeof ing === "string") {
          return { ingredientId: ing, quantity: 1 };
        }
        if (ing.ingredientId) {
          return ing;
        }
        if (ing._id) {
          return { ingredientId: ing._id, quantity: ing.quantity || 1 };
        }
        return ing;
      });

      setFormData((prev) => ({
        ...prev,
        ingredients: normalized,
      }));
    } catch (err) {
      console.error("Failed to fetch ingredients:", err);
    }
  };

  document.body.style.overflow = "hidden";
  fetchIngredients();
  return () => {
    document.body.style.overflow = "";
  };
}, []);

  useEffect(() => {
  if (ingredientSearch.length >= 3) {
    const matches = availableIngredients.filter((ing) =>
      ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
      !formData.ingredients.some(i => i.ingredientId === ing._id)
    );
    setIngredientSuggestions(matches);
  } else {
    setIngredientSuggestions([]);
  }
}, [ingredientSearch, availableIngredients, formData.ingredients]);

const handleAddNewIngredient = async (name) => {
  const token = localStorage.getItem("token");
  try {
    const res = await api.post(
      "api/drinks/addIngredient",
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setAvailableIngredients((prev) => [...prev, res.data]);
    const updated = [...formData.ingredients.split(", "), name].filter(Boolean).join(", ");
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          ingredientId: res.data._id,
          name: res.data.name,
          quantity: 1,
          unit: res.data.unit || "unit"
        }
      ]
    });
    setIngredientSearch("");
    toast.success(`Ingredient "${name}" added!`);
  } catch (error) {
    console.error("Error adding new ingredient:", error);
    toast.error("Failed to add new ingredient");
  }
};

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
    <div className={styles.overlay} onClick={() => setEditPopUp(false)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.horizWrapper}>
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
            <option value={formData.category}>{formData.category}</option>
            <option value="Specialty Drink">Specialty Drink</option>
            <option value="Coffee">Coffee</option>
            <option value="Tea">Tea</option>
            <option value="Smoothie">Smoothie</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Description"
        />
        <div className={styles.horizWrapper} style={{ justifyContent: "flex-start", gap: "2rem", borderBottom: "1px dashed black"}}>
        <h4>Sizes & Prices</h4>
        {availableSizes.map((size) => (
          <div key={size} className={styles.horizWrapper}>
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
        </div>
        <div className={styles.vertContainer}>
          <label>Ingredients</label>
          <div className={styles.userInput}>
            {formData.ingredients.map((ingredientObj, idx) => {
            return (
              ingredientObj && (
                <div key={ingredientObj.ingredientId + idx} className={styles.horizWrapper} style={{ marginBottom: ".5rem" }}>
                  <button
                    className={styles.btnsSmall}
                    onClick={() => {
                      const updated = formData.ingredients.filter(i => i.ingredientId !== ingredientObj._id);
                      setFormData({ ...formData, ingredients: updated });
                    }}
                  >
                    {ingredientObj.name} ×
                  </button>
                  <input
                    type="number"
                    min={1}
                    className={styles.userInput}
                    value={ingredientObj.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value);
                      const updated = formData.ingredients.map((i) =>
                        i.ingredientId === ingredientObj._id ? { ...i, quantity: qty } : i
                      );
                      setFormData({ ...formData, ingredients: updated });
                    }}
                  />
                  <span style={{ whiteSpace: "nowrap" }}>/{ingredientObj.unit || "unit"}</span>
                </div>
              )
            );
          })}
            <input
              type="text"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Add ingredients..."
              className={styles.userInput}
            />
          </div>
            <div className={styles.horizWrapper} style={{flex: "1", fontSize: ".75rem"}}>
              {availableIngredients
                .filter((ing) =>
                  ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
                  !formData.ingredients.some((i) => i.ingredientId === ing._id)
                )
                .map((ing) => (
                  <button
                    key={ing._id}
                    className={styles.btnsSmall} style={{flex: "1"}}
                    onClick={() => {
                      const updated = [
                        ...formData.ingredients,
                        { ingredientId: ing._id, name: ing.name, quantity: 1, unit: ing.unit }
                      ];
                      setFormData({ ...formData, ingredients: updated });
                      setIngredientSearch("");
                    }}
                  >
                   {ing.name}
                  </button>
                ))}
            </div>
        </div>
        <button className={styles.btns} onClick={pickImage}>
          Upload Image
        </button>

        {formData.image && (
          <Image src={formData.image} alt="Preview" width={256} height={256} content="contain" className={styles.preview}/>
        )}

        <button className={styles.btns} onClick={handleSave}>
          Save
        </button>
        <button className={styles.btns} onClick={() => setEditPopUp(false)}>
          Close
        </button>
        </div>
      </div>
  );
}