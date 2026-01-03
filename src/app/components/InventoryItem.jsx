import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../app/page.module.css";
import { api } from "../utils/api";
import CurrencyInput from "./CurrencyInput";
import { FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import EditSymbol from "../assets/editSymbol.svg";
import DeleteSymbol from "../assets/deleteSymbol.svg";

const InventoryItem = ({ refreshDrinks, item }) => {
  const [showForm, setShowForm] = useState(false);
  const [showIngForm, setShowIngForm] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredneantForm , setIngrediantForm ] = useState(false)
  const [editIngredient, setEditIngredient] = useState(null);
  const [newIngredient, setNewIngredient] = useState({
  name: "",
  unit: "",
  inStock: 0,
  reorderAt: 0,
  costPerUnit: 0,
  extraCost: 0,
  isExtra: false
});

const availableSizes = ["Single Item", "Kids", "16oz", "20oz", "24oz", "32oz"];

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
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
          setAvailableIngredients(sortedData);
      } catch (err) {
        console.error("Error fetching ingredients:", err);
      }
    };
    fetchIngredients();
  return () => (document.body.style.overflow = "");
}, [showForm]);

  const regularIngredients = availableIngredients;
  const extraIngredients = availableIngredients.filter(i => i.isExtra);

const toggleSize = (idx) => {
  setSizesConfig(prev => {
    const next = prev.map((s, i) =>
      i === idx ? { ...s, selected: !s.selected } : s
    );

    setFormData(prevForm => ({
      ...prevForm,
      sizes: next.filter(s => s.selected),
    }));

    return next;
  });
};

const updateSizePrice = (idx, price) => {
  setSizesConfig(prev => {
    const next = prev.map((s, i) =>
      i === idx ? { ...s, price } : s
    );

    setFormData(prevForm => ({
      ...prevForm,
      sizes: next.filter(s => s.selected),
    }));

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

const handleAddIngredient = async () => {
  try {
    const token = localStorage.getItem("token");
    await api.post("/api/drinks/addIngredient", newIngredient, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Ingredient added!");
    setNewIngredient({
      name: "",
      unit: "",
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

  const pickImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const token = localStorage.getItem("token");
  if (!token) {
    toast.error("You must be logged in to upload images.");
    return;
  }

  const imageName = `${formData.name.replace(/\s+/g, "_")}_${Date.now()}.webp`;
  const webpBlob = await convertToWebp(file);

  const presigned = await api.post(
    "/api/drinks/upload/presign",
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
  setFormData({ ...formData, image: imageUrl });
};

const convertToWebp = async (file) => {
  return new Promise((resolve) => {
    const img = new Image();
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
        0.8 // quality
      );
    };

    reader.readAsDataURL(file);
  });
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

function removeSize(sizeToRemove) {
  setSizesConfig(prev => {
    const next = prev.filter(s => s.size !== sizeToRemove);

    setFormData(prevForm => ({
      ...prevForm,
      sizes: next.filter(s => s.selected),
    }));

    return next;
  });
}

function removeIngredient(sizeName, ingredientIdToRemove) {
  setSizesConfig(prev => {
    const next = prev.map(size => {
      if (size.size !== sizeName) return size;

      return {
        ...size,
        ingredients: size.ingredients.filter(
          ing => ing.ingredientId !== ingredientIdToRemove
        ),
      };
    });

    setFormData(prevForm => ({
      ...prevForm,
      sizes: next.filter(s => s.selected),
    }));

    return next;
  });
}

  return (
    <>
    <div className={styles.horizWrapper} style={{width:'unset', flexGrow:'0', flexWrap:'wrap', gap:'.5rem', justifyContent:'flex-end'}}>
        <button onClick={() => setShowForm(true)} className={styles.btns} style={{display:'flex', alignItems:'center', justifyContent:'center' }}><EditSymbol alt='edit product' style={{ width: "24px", height: "24px", stroke: "var(--fontColor)" }} /> Product</button>
        <button onClick={() => setShowIngForm(true)} className={styles.btns} style={{display:'flex', alignItems:'center', justifyContent:'center' }}><EditSymbol alt='edit ingredient' style={{ width: "24px", height: "24px", stroke: "var(--fontColor)" }} /> Ingredient</button>
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
                  <option value="each">each</option>
                </select>
              </div>
              <div className={styles.horizWrapper}>
                  <div className={styles.vertContainer} style={{flex: 1}}>
                    <label htmlFor="stock" className={styles.ingredients}>Current Stock:</label>
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
                    <label className={styles.ingredients}>Re-Order At:</label>
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
                  <label className={styles.ingredients}>Cost Per Unit:</label>
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
                  <label className={styles.ingredients}>Extra Cost:</label>
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
                <FaPlus/> Save Ingredient
              </button>

              <h3 style={{ marginTop: "20px" }}>Available Ingredients</h3>
              {availableIngredients.length === 0 ? (
                <p>No ingredients found.</p>
              ) : (
                <div className={styles.vertContainer} style={{width:'100%'}}>
                  <div className={styles.vertWrapperInset} style={{justifyContent: "flex-start", position: "relative", padding:'0px', width:'100%', overflowX:'auto'}}>
                    <div className={styles.stickyContainer} style={{ minHeight:'50px', backgroundColor:'var(--btnColor2)', top:'0px', left:'0px', boxShadow:'var(--shadow)', width:'unset'}}>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left", color: "black"}}>Name</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", color: "black"}}>Cost/Unit</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", color: "black"}}>Extra Price</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", color: "black"}}>In Stock</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", color: "black"}}>Is Extra</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", color: "black"}}>Edit/Save</span>
                    </div>
                    {availableIngredients.map((ingredient) => (
                      <>
                      <div className={styles.cartWrapper} key={ingredient._id} style={{borderBottom: "1px black dashed", padding:'0px .75rem', width:'unset'}}>
                        <span className={styles.ingredients} style={{flex: 1, textAlign: "left", minWidth: "100px"}}>{ingredient.name}</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px"}}>${ingredient.costPerUnit.toFixed(2)}/{ingredient.unit}</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px"}}>${ingredient.extraPrice.toFixed(2)}/{ingredient.unit}</span>
                        <span className={styles.ingredients} style={{flex: 1, minWidth: "100px"}}>{ingredient.inStock} {ingredient.unit}{ingredient.inStock > 1 ? "(s)" : ""}</span>
                        <input type="checkbox" defaultChecked={ingredient?.isExtra ? "checked" : ""} style={{flex: .33, minWidth: "75px"}}/>
                        <button className={styles.btns} style={{flex: .33, minWidth: "75px"}} onClick={() => { setEditIngredient(ingredient); setIngrediantForm(true); }}>Edit</button>
                        <button className={styles.btns} style={{flex: .33, minWidth: "75px"}} onClick={() => handleDeleteIngredient(ingredient._id)}>Delete</button>
                      </div>
                      </>
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
                <label htmlFor={editIngredient.name} className={styles.ingredients} style={{flex: 1, textAlign: "left"}}>Name:</label>
                <input className={styles.userInput} id={editIngredient.name} placeholder="Name" value={editIngredient.name} onChange={(e) => setEditIngredient({ ...editIngredient, name: e.target.value })} />
                <label htmlFor={editIngredient.name} className={styles.ingredients} style={{flex: 1, textAlign: "left"}}>Unit:</label>
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
                <label htmlFor={editIngredient.name} className={styles.ingredients} style={{flex: 1, textAlign: "left"}}>Current Stock:</label>
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
                <label htmlFor={editIngredient.name} className={styles.ingredients} style={{flex: 1, textAlign: "left"}}>Reorder At:</label>
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
                <label htmlFor={editIngredient.name} className={styles.ingredients} style={{flex: 1, textAlign: "left"}}>Cost Per Unit</label>
                <CurrencyInput
                  value={editIngredient.costPerUnit}
                  onChange={(val) =>
                    setEditIngredient({ ...editIngredient, costPerUnit: val })
                  }
                  placeholder="Cost Per Unit"
                />
                </div>
                <div className={styles.horizWrapper}>
                  <label htmlFor={editIngredient.name} className={styles.ingredients} style={{flex: 1, textAlign: "left"}}>Is Extra?</label>
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
            <div className={styles.horizWrapper} style={{width:'100%', flexWrap:'nowrap'}}>
              <div className={styles.vertContainer} style={{gap:'0px'}}>
                <input
                  className={styles.userInput}
                  name="Item Name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{marginBottom:'0px'}}
                />
                <select id="category" className={styles.select} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
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
                className={styles.textArea}
                placeholder="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <h4>Sizes & Prices</h4>
            <div className={styles.horizContainer} style={{gap:'2rem', overflowY:'auto', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusSmall)', padding:'1rem'}}>
              {sizesConfig.map((s, idx) => (
                <div key={s.size} className={styles.vertContainer} style={{gap:'1rem', alignItems:'flex-start', justifyContent:'stretch', border:'1px dashed var(--fontColor)', borderRadius:'var(--borderRadiusSmall)', padding:'10px'}}>
                    <input type="checkbox" id={s.size} className={styles.hidden}  onChange={() => toggleSize(idx)}/>
                    <label className={styles.horizContainer} style={{fontSize:'1rem', justifyContent:'space-between', padding:'.5rem', alignItems:'center' ,width:'100%', boxShadow: 'var(--shadow)', borderRadius:'var(--borderRadiusSmall)'}} htmlFor={s.size}>{" "} {s.size}
                      <button type="button" style={{color:'red', backgroundColor:'var(--btnColor2)', display:'flex', alignItems:'center', fill:'red', cursor:'pointer', padding:'2px', borderRadius:'50%'}} onClick={() => removeSize(s.size)}><DeleteSymbol style={{width:'24px', height:'24px'}}/></button>
                    </label>
                  {s.ingredients.map((ing) => (
                    <div key={ing.ingredientId} className={styles.horizContainer} style={{boxShadow:'none', flexWrap:'nowrap', justifyContent:'space-between', width:'100%'}}>
                      <button type="button" style={{color:'red', backgroundColor:'var(--btnColor2)', display:'flex', alignItems:'center', fill:'red', cursor:'pointer', padding:'2px', borderRadius:'50%'}} onClick={() => removeIngredient(s.size, ing.ingredientId)}>
                        <DeleteSymbol style={{width:'16px', height:'16px'}}/>
                      </button>
                      <span style={{textAlign: "right", fontSize:'.8rem'}}>{ing.name}</span>
                      <input
                        style={{textAlign: "right"}}
                        className={styles.userInput}
                        type="number"
                        value={ing.quantity}
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value, 10);
                          setSizesConfig(prev => {
                            const copy = prev.map(size =>
                              size.size === s.size
                                ? {
                                    ...size,
                                    ingredients: size.ingredients.map(x =>
                                      x.ingredientId === ing.ingredientId
                                        ? { ...x, quantity: newQty }
                                        : x
                                    ),
                                  }
                                : size
                            );

                            setFormData(prevForm => ({
                              ...prevForm,
                              sizes: copy.filter(sz => sz.selected),
                            }));

                            return copy;
                          });
                        }}
                      />
                      <span>{ing.unit}</span>
                    </div>
                  ))}
                  <div className={styles.vertContainer} style={{overflowX:'auto'}}>
                    <div className={styles.horizContainer} style={{boxShadow:'none', justifyContent:'flex-start'}}>
                      <span>Sell Price:</span> 
                      {s.selected && (
                        <CurrencyInput
                          value={s.price}
                          onChange={(val) => updateSizePrice(idx, val)}
                          placeholder={`$ Price for ${s.size}`}
                        />
                      )}
                    </div>
                    <div className={styles.horizContainer} style={{boxShadow:'none'}}>
                      <span className={styles.ingredients} style={{textAlign: "right"}}>Your Cost: ${calculateCost(s, availableIngredients).toFixed(2)}</span> 
                    </div>
                    <div className={styles.horizContainer} style={{boxShadow:'none'}}>
                      <span className={styles.ingredients} style={{textAlign: "right"}}>Gross Profit: </span> 
                      <span className={styles.ingredients} style={{ textAlign:'left', color: calculateProfit(s, availableIngredients) < 0 ? 'red' : 'green' }}>
                        ${calculateProfit(s, availableIngredients)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h4>Items/Ingredients</h4>
            <div className={styles.horizWrapper} style={{display:'flex', flexWrap:'wrap', overflowX:'hidden', overflowY:'auto', maxHeight:'300px', justifyContent:'flex-start', padding:'1rem', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusLarge)'}}>
              {regularIngredients.map((ingredient) => {
                const selectedIngredients = formData.sizes?.flatMap(s => s.ingredients) || [];
                const found = selectedIngredients.find(i => i.ingredientId === ingredient._id);
                return (
                  <>
                    <input id={`ing-${ingredient._id}`} type="checkbox" className={styles.hidden} checked={!!found} onChange={(e) => {
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
                    <label className={found ? styles.btnsSelected : styles.btns}  htmlFor={`ing-${ingredient._id}`} style={{fontSize:'.8rem'}}>
                      {ingredient.name}
                    </label>
                  </>
                );
              })}
              </div>
              <h4>Extras</h4>
              <div className={styles.horizWrapper} style={{display:'flex', flexWrap:'wrap', overflowX:'hidden', overflowY:'auto', maxHeight:'300px', justifyContent:'flex-start', padding:'20px', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusLarge)'}}>
                {extraIngredients.map((ingredient) => {
                  const found = formData.extras?.find((i) => i.ingredientId === ingredient._id);
                  return (
                    <>
                        <input
                          id={`extra-${ingredient._id}`}
                          type="checkbox"
                          checked={!!found}
                          className={styles.hidden}
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
                        <label className={found ? styles.btnsSelected : styles.btns} style={{fontSize:'.8rem'}} htmlFor={`extra-${ingredient._id}`}>
                          {ingredient.name}
                        </label>
                      </>
                  );
                })}
              </div>
            </div>
            <div className={styles.vertContainer}>
              <label className={styles.btns} htmlFor='previewImage'>Upload Image</label>
              <input type="file" id='previewImage' accept="image/*" onChange={pickImage} className={styles.hidden}/>
              {formData.image && (
                <img src={formData.image} alt="preview" className={styles.preview} style={{height:'256px', width:'256px'}}/>
              )}
            </div>
            <div className={styles.horizContainer} style={{boxShadow:'none'}}>
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
