import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../app/page.module.css";
import { api } from "../utils/api";
import CurrencyInput from "./CurrencyInput";
import { toast, ToastContainer } from "react-toastify";

const InventoryItem = ({ refreshDrinks, item }) => {
  const [showForm, setShowForm] = useState(false);
  const [showIngForm, setShowIngForm] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredneantForm , setIngrediantForm ] = useState(false)
  const [editIngredient, setEditIngredient] = useState(null);
  const [newIngredient, setNewIngredient] = useState({
  name: "",
  unit: "piece",
  inStock: 0,
  reorderAt: 0,
  costPerUnit: 0,
  extraCost: 0,
  isExtra: false
});

const availableSizes = ["Kids", "16oz", "20oz", "24oz", "32oz"];

const [sizesConfig, setSizesConfig] = useState(
  availableSizes.map(size => ({
    size,
    selected: true,
    price: 0,
    ingredients: []
  }))
);

const [formData, setFormData] = useState({
  _id: null,
  name: "",
  category: "",
  description: "",
  image: "",
  extras: [],
  sizes: sizesConfig,
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
  return () => (document.body.style.overflow = "");
}, [showForm]);

  const regularIngredients = availableIngredients.filter(i => !i.isExtra);
  const extraIngredients = availableIngredients.filter(i => i.isExtra);

const toggleSize = (idx) => {
  setSizesConfig(prev => {
    const next = [...prev];
    next[idx].selected = !next[idx].selected;
    formData.sizes = next.filter(s => s.selected);
    return next;
  });
};

const updateSizePrice = (idx, price) => {
  setSizesConfig(prev => {
    const next = [...prev];
    next[idx].price = price;
    formData.sizes = next.filter(s => s.selected);
    return next;
  });
};

const calculateProfit = (size, availableIngredients) => {
  const cost = calculateCost(size, availableIngredients);
  const sellPrice = parseFloat(size.price) || 0;
  const profit = sellPrice - cost;
  return profit.toFixed(2);
};

const calculateCost = (size, availableIngredients) => {
  let totalCost = 0;
  for (const ing of size.ingredients) {
    const fullIngredient = availableIngredients.find(i => i._id === ing.ingredientId);
    if (!fullIngredient) continue;
    const unitCost = (parseFloat(fullIngredient.costPerUnit) / 100) * parseFloat(ing.quantity) || 0;
    totalCost += unitCost;
  }
  return totalCost;
};

const multipliers = {
  "Kids": 0.5,
  "16oz": 1,
  "20oz": 1.25,
  "24oz": 1.5,
  "32oz": 2
};

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

const handleSaveEditIngredient = async () => {
  try {
    const token = localStorage.getItem("token");
    await api.post("/api/drinks/editIngredient", editIngredient, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Ingredient updated!");
    setEditIngredient(null);
    setIngrediantForm(false);
    const refreshed = await axios.get("/api/drinks/ingredients");
    setAvailableIngredients(refreshed.data || []);
  } catch (err) {
    console.error("Edit ingredient error:", err);
    toast.error("Failed to update ingredient");
  }
};

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
    const payload = {
      ...formData,
        sizes: sizesConfig.filter(s => s.selected).map(s => ({
        size: s.size,
        price: s.price,
        ingredients: s.ingredients
      })),
    };

    try {
      const token = localStorage.getItem("token");
      await api.post("/api/drinks/addInventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Drink added!");
      resetForm();
      setShowForm(false);
      refreshDrinks();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed :( ");
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!confirm("Really delete this ingredient?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(
        `/api/drinks/ingredients/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // drop it from local state so UI updates immediately
      setAvailableIngredients((prev) => prev.filter((i) => i._id !== id));
      toast.success("Ingredient deleted");
    } catch (err) {
      console.error("Delete ingredient error:", err);
      toast.error("Failed to delete ingredient");
    }
  };

  const resetForm = () => {
  setFormData({
    _id: null,
    name: "",
    category: "",
    description: "",
    image: "",
    extras: [],
    sizes: [],
    rating: { thumbsUp: 0, thumbsDown: 0 },
  });

  setSizesConfig(availableSizes.map(size => ({
    size,
    selected: false,
    price: 0,
    ingredients: []
  })));
};

  const selectedIngredients = formData.sizes?.flatMap(s => s.ingredients) || []

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
                <div className={styles.vertContainer}>
                  <div className={styles.horizWrapper}>
                    <span className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Name</span>
                    <span className={styles.ingrediants} style={{flex: 1}}>Cost/Unit</span>
                    <span className={styles.ingrediants} style={{flex: 1}}>Extra Price</span>
                    <span className={styles.ingrediants} style={{flex: 1}}>In Stock</span>
                    <span className={styles.ingrediants} style={{flex: .5}}>Is Extra</span>
                    <span className={styles.ingrediants} style={{flex: .6}}>Edit/Save</span>
                  </div>
                  <div className={styles.vertWrapperInset}>
                    {availableIngredients.map((ingredient) => (
                      <div className={styles.cartWrapper} key={ingredient._id} style={{borderBottom: "1px black dashed", width: "inherit"}}>
                        <span className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>{ingredient.name}</span>
                        <span className={styles.ingrediants} style={{flex: 1}}>${ingredient.costPerUnit.toFixed(2)}/{ingredient.unit}</span>
                        <span className={styles.ingrediants} style={{flex: 1}}>${ingredient.extraPrice.toFixed(2)}/{ingredient.unit}</span>
                        <span className={styles.ingrediants} style={{flex: 1}}>{ingredient.inStock} {ingredient.unit}{ingredient.inStock > 1 ? "(s)" : ""}</span>
                        <input type="checkbox" defaultChecked={ingredient?.isExtra ? "checked" : ""} style={{flex: .4}}/>
                        <button className={styles.btnsSmall} style={{flex: .5}} onClick={() => { setEditIngredient(ingredient); setIngrediantForm(true); }}>Edit</button>
                        <button className={styles.btnsSmall} style={{flex: .5}} onClick={() => handleDeleteIngredient(ingredient._id)}>Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button className={styles.btns} onClick={() => setShowIngForm(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {ingredneantForm && editIngredient && (
        <div className={styles.overlay} onClick={() => { setEditIngredient(null); setIngrediantForm(false) }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.vertContainer}>
              <h3>Edit Ingredient</h3>
              <div className={styles.horizWrapper}>
                <label htmlFor={editIngredient.name} className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Name:</label>
                <input className={styles.userInput} id={editIngredient.name} placeholder="Name" value={editIngredient.name} onChange={(e) => setEditIngredient({ ...editIngredient, name: e.target.value })} />
                <label htmlFor={editIngredient.name} className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Unit:</label>
                <select
                  className={styles.select}
                  value={editIngredient.unit}
                  onChange={(e) =>
                    setEditIngredient({ ...editIngredient, unit: e.target.value })
                  }
                >
                  <option value="ml">ml</option>
                  <option value="oz">oz</option>
                  <option value="g">g</option>
                  <option value="piece">piece</option>
                </select>
              </div>
              <div className={styles.horizWrapper}>
                <label htmlFor={editIngredient.name} className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Current Stock:</label>
                <input
                  className={styles.userInput}
                  placeholder="In Stock"
                  type="number"
                  value={editIngredient.inStock}
                  onChange={(e) =>
                    setEditIngredient({ ...editIngredient, inStock: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className={styles.horizWrapper}>
                <label htmlFor={editIngredient.name} className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Reorder At:</label>
                <input
                  className={styles.userInput}
                  placeholder="Reorder At"
                  type="number"
                  value={editIngredient.reorderAt}
                  onChange={(e) =>
                    setEditIngredient({ ...editIngredient, reorderAt: parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className={styles.horizWrapper}>
                <label htmlFor={editIngredient.name} className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Cost Per Unit</label>
                <CurrencyInput
                  value={editIngredient.costPerUnit}
                  onChange={(val) =>
                    setEditIngredient({ ...editIngredient, costPerUnit: val })
                  }
                  placeholder="Cost Per Unit"
                />
                </div>
                <div className={styles.horizWrapper}>
                  <label htmlFor={editIngredient.name} className={styles.ingrediants} style={{flex: 1, textAlign: "left"}}>Is Extra?</label>
                  <input type="checkbox" checked={editIngredient.isExtra} onChange={(e) => setEditIngredient({ ...editIngredient, isExtra: e.target.checked })}/>
                    {editIngredient.isExtra && (
                      <CurrencyInput
                        value={editIngredient.extraPrice}
                        onChange={(val) =>
                          setEditIngredient({ ...editIngredient, extraPrice: val })
                        }
                        placeholder="Extra Price"
                      />
                    )}
                  </div>
              <div className={styles.horizWrapper}>
                <button
                  className={styles.btns}
                  onClick={handleSaveEditIngredient}
                >
                  Save Changes
                </button>
                <button
                  className={styles.btns}
                  onClick={() => {
                    setIngrediantForm(false);
                    setEditIngredient(null);
                  }}
                >
                  Cancel
                </button>
              </div>
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
                <option value="Food">Food</option>
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
              <h4>Sizes & Prices</h4>
              {sizesConfig.map((s, idx) => (
                <div key={s.size} className={styles.horizWrapper}>
                  <label>
                    <input
                      type="checkbox"
                      checked={s.selected}
                      onChange={() => toggleSize(idx)}
                    />{" "}
                    {s.size}
                  </label>
                  {s.ingredients.map((ing) => (
                    <div key={ing.ingredientId} className={styles.horizWrapper} style={{width: "100%", justifyContent: "flex-start"}}>
                      <span className={styles.ingrediants} style={{flex:.3, textAlign: "right"}}>{ing.name}</span>
                      <input
                        className={styles.userInput}
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value, 10);
                          setSizesConfig(prev => {
                            const copy = [...prev];
                            const sizeObj = copy.find(x => x.size === s.size);
                            sizeObj.ingredients = sizeObj.ingredients.map(x =>
                              x.ingredientId === ing.ingredientId ? { ...x, quantity: newQty } : x
                            );
                            formData.sizes = copy.filter(s => s.selected);
                            return copy;
                          });
                        }}
                      />
                      <span>{ing.unit}</span>
                    </div>
                  ))}
                  <div className={styles.horizWrapper} style={{flex:.4, textAlign: "right"}}>
                    <span className={styles.ingrediants} style={{flex:1, textAlign: "right"}}>Sell Price: </span> 
                    {s.selected && (
                      <CurrencyInput
                        value={s.price}
                        onChange={(val) => updateSizePrice(idx, val)}
                        placeholder={`$ Price for ${s.size}`}
                      />
                    )}
                    <span className={styles.ingrediants} style={{flex:1, textAlign: "right"}}>Your Cost: </span> 
                    <span className={styles.ingrediants}>${calculateCost(s, availableIngredients).toFixed(2)}</span>
                    <span className={styles.ingrediants} style={{ textAlign: "right"}}>Profit: </span> 
                      <span className={styles.ingrediants} style={{ color: calculateProfit(s, availableIngredients) < 0 ? 'red' : 'green' }}>
                        ${calculateProfit(s, availableIngredients)}
                      </span>
                    </div>
                </div>
              ))}
            </div>
            <div className={styles.vertContainer}>
            <h4>Ingredients</h4>
            <div className={styles.ingredientList}>
              {regularIngredients.map((ingredient) => {
                const selectedIngredients = formData.sizes?.flatMap(s => s.ingredients) || [];
                const found = selectedIngredients.find(i => i.ingredientId === ingredient._id);
                return (
                  <div key={ingredient._id} className={styles.ingredientItem}>
                    <input
                      id={`ing-${ingredient._id}`}
                      type="checkbox"
                      checked={!!found}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        const updatedSizes = formData.sizes.map((size) => {
                          if (!size.selected) return size;

                          const hasIng = size.ingredients.some(i => i.ingredientId === ingredient._id);
                          let newIngredients;

                          if (checked && !hasIng) {
                            newIngredients = [
                              ...size.ingredients,
                              {
                                ingredientId: ingredient._id,
                                name: ingredient.name,
                                unit: ingredient.unit,
                                quantity: 1,
                              },
                            ];
                          } else if (!checked && hasIng) {
                            newIngredients = size.ingredients.filter(i => i.ingredientId !== ingredient._id);
                          } else {
                            newIngredients = size.ingredients;
                          }

                          return { ...size, ingredients: newIngredients };
                        });

                        setSizesConfig(prev => {
                          const merged = prev.map(s => {
                            const found = updatedSizes.find(x => x.size === s.size);
                            return found || s;
                          });
                          setFormData({ ...formData, sizes: merged.filter(s => s.selected) });
                          return merged;
                        });
                      }}
                    />
                    <label className={styles.btnsSmall} htmlFor={`ing-${ingredient._id}`}>
                      {ingredient.name}
                    </label>
                    {/* {found && (
                      <>
                        <input
                          type="number"
                          className={styles.userInput}
                          min="1"
                          value={found.quantity}
                          onChange={(e) => {
                            const quantity = parseInt(e.target.value);
                            const updated = formData.sizes.map((i) =>
                              i.ingredientId === ingredient._id ? { ...i, quantity } : i
                            );
                            setFormData({ ...formData, ingredients: updated });
                          }}
                        />
                        <label className={styles.ingrediants}>{ingredient.unit}</label>
                      </>
                    )} */}
                  </div>
                );
              })}
            </div>
            <h4 style={{ marginTop: "1rem" }}>Extras</h4>
            <div className={styles.ingredientList}>
              {extraIngredients.map((ingredient) => {
                const found = formData.extras?.find((i) => i.ingredientId === ingredient._id);
                return (
                  <div key={ingredient._id} className={styles.ingredientItem}>
                    <input
                      id={`extra-${ingredient._id}`}
                      type="checkbox"
                      checked={!!found}
                      onChange={(e) => {
                        let updated = e.target.checked
                          ? [...(formData.extras || []), {
                              ingredientId: ingredient._id,
                              name: ingredient.name,
                              unit: ingredient.unit,
                              extraPrice: ingredient.extraPrice,
                              quantity: 1,
                            }]
                          : formData.extras?.filter((i) => i.ingredientId !== ingredient._id);
                        setFormData({ ...formData, extras: updated });
                      }}
                    />
                    <label className={styles.btnsSmall} htmlFor={`extra-${ingredient._id}`}>
                      {ingredient.name}
                    </label>
                  </div>
                );
              })}
            </div>
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
        </div>
      )}
    </>
  );
};

export default InventoryItem;
