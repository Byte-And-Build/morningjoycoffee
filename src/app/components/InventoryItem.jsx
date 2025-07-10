import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../app/page.module.css";
import { api } from "../utils/api";
import CurrencyInput from "./CurrencyInput";
import { toast, ToastContainer } from "react-toastify";

const InventoryItem = ({ refreshDrinks }) => {
  const [showForm, setShowForm] = useState(false);
  const [showIngForm, setShowIngForm] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [newIngredient, setNewIngredient] = useState({
  name: "",
  unit: "piece",
  inStock: 0,
  reorderAt: 0,
  costPerUnit: 0,
  extraCost: 0,
  isExtra: false
});
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    category: "",
    description: "",
    ingredients: [],
    image: "",
    price: [{}],
    rating: { thumbsUp: 0, thumbsDown: 0 },
  });
  useEffect(() => {
  if (showForm) document.body.style.overflow = "hidden";
  const fetchIngredients = async () => {
      try {
        const response = await axios.get("/api/drinks/ingredients");
        const data = response.data || [];
        setAvailableIngredients(data);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
      }
    };
    fetchIngredients();
    console.log("INGREDIENTS", availableIngredients)
  return () => (document.body.style.overflow = "");
}, [showForm]);

  const extraIngredients = availableIngredients.filter(i => i.isExtra);

  const availableSizes = ["Kids", "16oz", "20oz", "24oz", "32oz"];
  const [sizes, setSizes] = useState(() =>
    Object.fromEntries(availableSizes.map(size => [size, { selected: false, price: 0 }]))
  );

const handleAddIngredient = async () => {
  try {
    const token = localStorage.getItem("token");
    await api.post("/api/drinks/addIngredient", newIngredient, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Ingredient added!");
    setNewIngredient({
      name: "",
      unit: "piece",
      inStock: 0.00,
      reorderAt: 0.00,
      costPerUnit: 0.00,
      isExtra: false,
      extraPrice: 0.00
    });

    // refresh ingredients
    const refreshed = await axios.get("/api/drinks/ingredients");
    setAvailableIngredients(refreshed.data || []);
  } catch (err) {
    console.error("Ingredient Add Error:", err);
    toast.error("Failed to add ingredient");
  }
};

  const availableExtras = [
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

  const [extras, setExtras] = useState(() =>
    Object.fromEntries(availableExtras.map(extra => [extra.name, { selected: false, price: extra.price }]))
  );

  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, image: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAddOrEdit = async () => {
    const selectedPrices = Object.fromEntries(
      Object.entries(sizes)
        .filter(([_, data]) => data.selected)
        .map(([key, data]) => [key, data.price])
    );

    const payload = {
      ...formData,
      price: [selectedPrices],
    };

    try {
      const token = localStorage.getItem("token");
      await api.post("api/drinks/addInventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Drink added!");
      resetForm();
      setShowForm(false);
      refreshDrinks();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed :( ")
      // alert("Failed to save drink");
    }
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      name: "",
      category: "",
      ingredients: [],
      description: "",
      image: "",
      price: [{}],
      rating: { thumbsUp: 0, thumbsDown: 0 },
    });
    setSizes(Object.fromEntries(availableSizes.map(size => [size, { selected: false, price: 0 }])));
    setExtras(Object.fromEntries(availableExtras.map(extra => [extra.name, { selected: false, price: extra.price }])));
  };

  return (
    <>
    <div className={styles.horizWrapper} style={{paddingTop: ".3rem", gap: ".5rem"}}>
        <button onClick={() => setShowForm(true)} className={styles.btnsSmall}>➕ Product</button>
        <button onClick={() => setShowIngForm(true)} className={styles.btnsSmall}>➕ Ingredient</button>
      </div>
      {showIngForm && (
        <div className={styles.overlay} onClick={() => setShowIngForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <ToastContainer theme="dark" />
            <div className={styles.vertContainer}>
              <h3>Add New Ingredient</h3>
              <div className={styles.horizWrapper}>
                <input
                  className={styles.userInput}
                  style={{margin: "0"}}
                  placeholder="Name"
                  value={newIngredient.name || ""}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, name: e.target.value })
                  }
                />

                <select
                  className={styles.select}
                  value={newIngredient.unit}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, unit: e.target.value })
                  }
                >
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                  <option value="g">g</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              <div className={styles.horizWrapper}>
                  <div className={styles.vertContainer} style={{flex: 1}}>
                    <label htmlFor="stock" className={styles.ingrediants}>Current Stock:</label>
                    <input id="stock"
                      type="number"
                      className={styles.userInput}
                      placeholder="In Stock"
                      value={newIngredient.inStock}
                      onChange={(e) =>
                        setNewIngredient({ ...newIngredient, inStock: parseInt(e.target.value) })
                      }
                    />
                  </div>
                  <div className={styles.vertContainer} style={{flex: 1}}>
                    <label className={styles.ingrediants}>Re-Order At:</label>
                    <input
                      type="number"
                      className={styles.userInput}
                      placeholder="Reorder At"
                      value={newIngredient.reorderAt}
                      onChange={(e) =>
                        setNewIngredient({ ...newIngredient, reorderAt: parseInt(e.target.value) })
                      }
                    />
                  </div>
                <div className={styles.vertContainer} style={{flex: 1}}>
                  <label className={styles.ingrediants}>Cost Per Unit:</label>
                  <CurrencyInput
                    value={newIngredient.costPerUnit}
                    onChange={(val) =>
                      setNewIngredient({ ...newIngredient, costPerUnit: val })
                    }
                    placeholder="Cost Per Unit"
                  />
              </div>
              </div>
              <div className={styles.horizWrapper} style={{flex: 1}}>
              <label htmlFor="extra">Is Extra?</label>
                <input id="extra"
                  type="checkbox"
                  checked={newIngredient.isExtra}
                  onChange={(e) =>
                    setNewIngredient({ ...newIngredient, isExtra: e.target.checked })
                  }
                />
                {newIngredient.isExtra ? (
                  <>
                  <label className={styles.ingrediants}>Extra Cost:</label>
                      <CurrencyInput
                        value={newIngredient.extraCost}
                        onChange={(val) =>
                          setNewIngredient({ ...newIngredient, extraCost: val })
                        }
                        placeholder="0.75"
                      />
                  </>
                ) : ( <></>)}
                </div>
              <button className={styles.btns} onClick={handleAddIngredient}>
                ➕ Save Ingredient
              </button>

              <h3 style={{ marginTop: "20px" }}>Available Ingredients</h3>
              {availableIngredients.length === 0 ? (
                <p>No ingredients found.</p>
              ) : (
                <ul className={styles.ingredientList}>
                  {availableIngredients.map((ingredient) => (
                    <li key={ingredient._id} className={styles.ingredientItem}>
                      <strong>{ingredient.name}</strong> – $
                      {ingredient.costPerUnit.toFixed(2)}/{ingredient.unit}
                    </li>
                  ))}
                </ul>
              )}

              <button className={styles.btns} onClick={() => setShowIngForm(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <ToastContainer theme="dark"/>
            <div className={styles.vertContainer}>
            <div className={styles.horizWrapper}>
              <input
                className={styles.userInput}
                name="Item Name"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <select
                id="category"
                className={styles.select}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Category</option>
                <option value="Specialty Drink">Specialty Drink</option>
                <option value="Morning Joy Faves">Morning Joy Faves</option>
                <option value="Coffee">Coffee</option>
                <option value="Tea">Tea</option>
                <option value="Lotus Energy">Lotus Energy</option>
                <option value="Smoothie">Smoothie</option>
                <option value="Red Bull Infusions">Red Bull Infusions</option>
                <option value="Family Flaves">Family Flaves</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <textarea
              name="description"
              className={styles.textarea}
              placeholder="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className={styles.vertContainer}>
            <h4>Select Ingredients/Extras</h4>
            {extraIngredients === 0 ? (
              <p>No ingredients found.</p>
            ) : (
              <div className={styles.ingredientList}>
                {extraIngredients.map((ingredient) => {
                  const found = formData.ingredients.find((i) => i.ingredientId === ingredient._id);
                  return (
                    <div key={ingredient._id} className={styles.ingredientItem}>
                      <input
                        hidden
                        id={ingredient.name}
                        className={ingredient.name}
                        type="checkbox"
                        checked={!!found}
                        onChange={(e) => {
                          let updatedIngredients;
                          if (e.target.checked) {
                            updatedIngredients = [...formData.ingredients, { ingredientId: ingredient._id, name: ingredient.name, unit: ingredient.unit, quantity: 1 }];
                          } else {
                            updatedIngredients = formData.ingredients.filter((i) => i.ingredientId !== ingredient._id);
                          }
                          setFormData({ ...formData, ingredients: updatedIngredients });
                        }}
                      />
                      <div className={styles.qtyContainer}>
                      <label className={styles.btnsSmall} htmlFor={ingredient.name} style={{ cursor: "pointer" }}>
                        {ingredient.name}
                      </label>
                      {found && (
                        <>
                        <input
                          type="number"
                          className={styles.userInput}
                          min="1"
                          value={found.quantity}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value);
                            const updated = formData.ingredients.map((i) =>
                              i.ingredientId === ingredient._id ? { ...i, quantity } : i
                            );
                            setFormData({ ...formData, ingredients: updated });
                          }}
                        />
                        <label className={styles.ingrediants}>
                        {ingredient.unit}
                        </label>
                        </>
                      )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
            </div>
            <div className={styles.vertContainer}>
              <h4>Sizes & Prices</h4>
              {availableSizes.map(size => (
                <div key={size} className={styles.horizContainer}>
                  <input
                    className={styles.itemCheckbox}
                    type="checkbox"
                    checked={sizes[size].selected}
                    onChange={() =>
                      setSizes(prev => ({
                        ...prev,
                        [size]: { ...prev[size], selected: !prev[size].selected },
                      }))
                    }
                  />
                  <label>{size}</label>
                  <CurrencyInput
                    value={sizes[size].price}
                    onChange={(val) =>
                      setSizes(prev => ({
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
              <label className={styles.uploadLabel}>Upload Image</label>
              <input type="file" accept="image/*" onChange={pickImage} />
              {formData.image && (
                <img src={formData.image} alt="preview" className={styles.preview} />
              )}
            </div>

            <button className={styles.btns} onClick={handleAddOrEdit}>Save</button>
            <button className={styles.btns} onClick={() => setShowForm(false)}>Close</button>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryItem;
