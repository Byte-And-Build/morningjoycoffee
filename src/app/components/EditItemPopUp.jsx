"use client";
import styles from "../../app/page.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { api } from "../../app/utils/api";
import CurrencyInput from "../../app/components/CurrencyInput";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function EditItemPopUp({ item, setEditPopUp, fetchDrinks }) {

  console.log(item)
  
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    category: "",
    description: "",
    image: "",
    extras: [],
    sizes: [],
    rating: { thumbsUp: 0, thumbsDown: 0 },
  });
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [ingredientSuggestions, setIngredientSuggestions] = useState([]);

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
  if (item) {
    setFormData({
      _id: item._id,
      name: item.name,
      category: item.category,
      description: item.description,
      image: item.image,
      extras: item.extras || [],
      sizes: item.sizes || [],
      rating: item.rating || { thumbsUp: 0, thumbsDown: 0 },
      ingredients: item.ingredients || []
    });
  }
}, [item]);

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

const calculateCostForSize = (size) => {
  return size.ingredients.reduce((total, ing) => {
    const match = availableIngredients.find(
      (ai) =>
        ai._id === ing.ingredientId?._id || // when full object
        ai._id === ing.ingredientId         // when just the ID
    );

    const costPerUnit = match?.costPerUnit ?? 0;
    return (costPerUnit * ing.quantity);
  }, 0);
};


 const pickImage = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You must be logged in to upload images.");
      return;
    }

    const imageName = `${formData.name.replace(/\s+/g, "_")}_${Date.now()}.webp`;
    const webpBlob = await convertToWebp(file);

    try {
      const presigned = await api.post(
        "/api/drinks/upload/presign", // or /api/upload/presign if you split it out
        {
          fileName: imageName,
          fileType: "image/webp",
          clientFolder: "morningjoycoffee",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetch(presigned.data.url, {
        method: "PUT",
        headers: {
          "Content-Type": "image/webp",
        },
        body: webpBlob,
      });

      const imageUrl = presigned.data.url.split("?")[0];
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success("Image uploaded!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Image upload failed.");
    }
  };

  input.click();
};

const convertToWebp = async (file) => {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => resolve(blob),
        "image/webp",
        0.8
      );
    };

    reader.readAsDataURL(file);
  });
};

  const deleteSize = (sizeToRemove) => {
  setFormData((prev) => ({
    ...prev,
    sizes: prev.sizes.filter((s) => s.size !== sizeToRemove),
  }));
};

  const handleSave = async () => {
  const token = localStorage.getItem("token");

  const payload = {
    ...formData,
    sizes: formData.sizes.map((s) => ({
      size: s.size,
      price: parseFloat(s.price),
      ingredients: s.ingredients.map((i) => ({
        ingredientId: typeof i.ingredientId === "object" ? i.ingredientId._id : i.ingredientId,
        name: i.name,
        unit: i.unit,
        quantity: i.quantity
      }))
    })),
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
            placeholder={item.name}
          />
          <select
            className={styles.select}
            value={item.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value={formData.category}>{item.category}</option>
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
          placeholder={item.description}
        />
        <div className={styles.horizWrapper} style={{ justifyContent: "flex-start", gap: "2rem", borderBottom: "1px dashed black"}}>
        <h4>Recipe</h4>
        </div>
        <div className={styles.vertContainer}>
          <div className={styles.horizWrapper} style={{justifyContent: "flex-start", overflowX: "auto"}}>
            {formData.sizes.map((size, idx) => {
              const cost = calculateCostForSize(size);
              const price = size.price;
              const profit = price - cost;

              return (
                <div key={size + idx} className={styles.vertContainer} style={{paddingRight: ".75rem", paddingLeft: ".75rem", borderRight: "1px dashed black"}}>
                  <button className={styles.btnsSmall} onClick={() => deleteSize(size.size)}>{size.size} ×</button>
                  {size.ingredients.map((ing, indx) => (
                    <div key={ing.ingredientId?._id || ing.name || indx} className={styles.horizWrapper} style={{justifyContent: "space-between"}}>
                      <span style={{flex: 1.5}}>{ing.name}</span>
                      <input
                        type="number"
                        min="0"
                        className={styles.userInput}
                        value={ing.quantity}
                        style={{maxWidth: "50px", minWidth: "50px"}}
                        onChange={(e) => {
                          const newQty = parseFloat(e.target.value);
                          const updatedSizes = [...formData.sizes];
                          updatedSizes[idx].ingredients[indx].quantity = isNaN(newQty) ? 0 : newQty;
                          setFormData((prev) => ({
                            ...prev,
                            sizes: updatedSizes,
                          }));
                        }}
                      />
                      <span style={{flex: .1}}>{ing.unit}</span>
                    </div>
                  ))}
                  <span style={{flex: 1}}>Price: $
                    <input
                    type="decimal"
                      className={styles.userInput}
                      style={{ flex: 1 }}
                      value={size.price.toFixed(2)}
                      onChange={(e) => {
                        const updatedSizes = [...formData.sizes];
                        updatedSizes[idx].price = parseFloat(e.target.value) || 0;
                        setFormData((prev) => ({
                          ...prev,
                          sizes: updatedSizes,
                        }));
                      }}
                    />
                  </span>
                  <span style={{flex: 1}}>Cost: ${cost.toFixed(2)}</span>
                  <span style={{flex: 1}}>Profit:
                    <span style={{ color: profit >= 0 ? "green" : "red" }}>
                      ${profit.toFixed(2)}
                    </span>
                  </span>
                </div>
              );
            })}
          <div className={styles.vertContainer} style={{flex: 1}}>
            <input
              type="text"
              value={ingredientSearch}
              onChange={(e) => setIngredientSearch(e.target.value)}
              placeholder="Add ingredients..."
              className={styles.userInput}
              
            />
            </div>
          </div>
            <div className={styles.horizWrapper} style={{flex: "1", fontSize: ".75rem", justifyContent: "flex-start", overflowX: "auto", padding: ".75rem", overflowY: "hidden"}}>
              {availableIngredients
                .filter((ing) =>
                  ing.name.toLowerCase().includes(ingredientSearch.toLowerCase()) &&
                  !formData.ingredients.some((i) => i.ingredientId === ing._id)
                )
                .map((ing) => (
                  <button
                    key={ing._id}
                    className={styles.btnsSmall}
                    onClick={() => {
                      // ✅ Add this ingredient to each size's ingredient list
                      const updatedSizes = formData.sizes.map((size) => ({
                        ...size,
                        ingredients: [
                          ...(size.ingredients || []),
                          {
                            ingredientId: ing._id,
                            name: ing.name,
                            quantity: 1,
                            unit: ing.unit || "unit",
                          },
                        ],
                      }));

                      setFormData((prev) => ({
                        ...prev,
                        sizes: updatedSizes,
                      }));

                      setIngredientSearch("");
                    }}
                  >
                    {ing.name}
                  </button>
                ))}
            </div>
        </div>
        <div className={styles.vertContainer}>
        <button className={styles.btns} onClick={pickImage}>
          Upload Image
        </button>

        {formData.image && (
          <Image src={formData.image} alt="Preview" width={256} height={256} style={{ objectFit: "contain" }} className={styles.preview} onError={(e) => e.currentTarget.style.display = 'none'}/>
        )}
        </div>
          <div className={styles.horizWrapper}>
            <button className={styles.btns} onClick={handleSave}>
              Save
            </button>
            <button className={styles.btns} onClick={() => setEditPopUp(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
  );
}