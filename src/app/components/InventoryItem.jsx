import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../../app/page.module.css";
import { api } from "../utils/api";
import CurrencyInput from "./CurrencyInput";
import { toast, ToastContainer } from "react-toastify";
import EditSymbol from "../assets/editSymbol.svg";
import DeleteSymbol from "../assets/deleteSymbol.svg";
import EditIngredient from "./EditIngredient";
import IngredientForm from "./IngredientForm";

const InventoryItem = ({ refreshItems, item }) => {
  const [showForm, setShowForm] = useState(false);
  const [showIngForm, setShowIngForm] = useState(false);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [ingredientForm , setIngredientForm ] = useState(false)
  const [editIngredient, setEditIngredient] = useState(null);

const availableSizes = ["Single Item", "16oz", "20oz", "24oz", "32oz"];

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
        const response = await axios.get("/api/items/ingredients");
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

  const pickImage = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const token = localStorage.getItem("MJCT");
  if (!token) {
    toast.error("You must be logged in to upload images.");
    return;
  }

  const imageName = `${formData.name.replace(/\s+/g, "_")}_${Date.now()}.webp`;
  const webpBlob = await convertToWebp(file);

  const presigned = await api.post(
    "/api/items/upload/presign",
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
      const token = localStorage.getItem("MJCT");
      await api.post("/api/items/addInventory", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Item added!");
      resetForm();
      setShowForm(false);
      refreshItems();
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed :( ");
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
      {/* add/edit items */}
      <IngredientForm showIngForm={showIngForm} setShowIngForm={setShowIngForm} availableIngredients={availableIngredients} />
      <EditIngredient setIngredientForm={setIngredientForm} setEditIngredient={setEditIngredient} editIngredient={editIngredient} ingredientForm={ingredientForm}/>
      {/* add product */}
      {showForm && (
        <div className={styles.overlay} onClick={() => setShowForm(false)}>
          <div className={styles.modal} style={{overflowY:'auto', gap:'1.5rem'}} onClick={(e) => e.stopPropagation()}>
            <ToastContainer theme="dark"/>
            <div className={styles.vertContainer}>
              <div className={styles.horizWrapper} style={{width:'100%', flexWrap:'nowrap'}}>
                <div className={styles.vertContainer} style={{gap:'0px'}}>
                  <input className={styles.userInput} name="Item Name" placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{  width:'100%'}} />
                  <select id="category" className={styles.select} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width:'100%'}}>
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
                <textarea name="description" className={styles.textArea} placeholder="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
            </div>
            <div className={styles.vertContainer}>
            <h4>Sizes & Prices</h4>
            <div className={styles.horizContainer} style={{gap:'1rem', overflowY:'auto', justifyContent:'space-between', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusSmall)', padding:'1rem'}}>
              {sizesConfig.map((s, idx) => (
                <div key={s.size} className={styles.vertContainer} style={{ flexGrow:'0', border:'1px dashed var(--fontColor)', borderRadius:'var(--borderRadiusSmall)', padding:'10px'}}>
                    <input type="checkbox" id={s.size} className={styles.hidden}  onChange={() => toggleSize(idx)}/>
                    <label className={styles.horizContainer} style={{fontSize:'1rem', justifyContent:'space-between', padding:'.5rem', alignItems:'center' ,width:'100%', boxShadow: 'var(--shadow)', borderRadius:'var(--borderRadiusSmall)'}} htmlFor={s.size}>{" "} {s.size}
                      <button type="button" style={{color:'red', backgroundColor:'var(--btnColor2)', display:'flex', alignItems:'center', fill:'red', cursor:'pointer', padding:'2px', borderRadius:'50%'}} onClick={() => removeSize(s.size)}><DeleteSymbol style={{width:'24px', height:'24px'}}/></button>
                    </label>
                  {s.ingredients.map((ing) => (
                    <div key={ing.ingredientId} className={styles.horizContainer} style={{boxShadow:'none', flexWrap:'nowrap', justifyContent:'space-between', width:'100%'}}>
                      <button type="button" style={{color:'red', backgroundColor:'var(--btnColor2)', display:'flex', alignItems:'center', fill:'red', cursor:'pointer', padding:'2px', borderRadius:'50%'}} onClick={() => removeIngredient(s.size, ing.ingredientId)}>
                        <DeleteSymbol style={{width:'16px', height:'16px'}}/>
                      </button>
                      <span style={{textAlign: "left", fontSize:'.8rem', flex:'1', width:'100%'}}>{ing.name}</span>
                      <input
                        className={styles.userInput}
                        style={{textAlign: "right"}}
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
            </div>
            <div className={styles.vertContainer}>
            <h4>Items</h4>
            <div className={styles.horizWrapper} style={{display:'flex', flexWrap:'wrap', overflowY:'auto', minHeight:'100%', justifyContent:'flex-start', padding:'20px', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusLarge)'}}>
              {regularIngredients.map((ingredient, i) => {
                const selectedIngredients = formData.sizes?.flatMap(s => s.ingredients) || [];
                const found = selectedIngredients.find(i => i.ingredientId === ingredient._id);
                return (
                  <div key={ingredient._id}>
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
                  </div>
                );
              })}
              </div>
              </div>
              <div className={styles.vertContainer}>
              <h4>Extras</h4>
              <div className={styles.horizWrapper} style={{display:'flex', flexWrap:'wrap', overflowX:'hidden', overflowY:'auto', minHeight:'100%', justifyContent:'flex-start', padding:'20px', boxShadow:'var(--insetShadow)', borderRadius:'var(--borderRadiusLarge)'}}>
                {extraIngredients.map((ingredient) => {
                  const found = formData.extras?.find((i) => i.ingredientId === ingredient._id);
                  return (
                    <div key={ingredient.name}>
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
                      </div>
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
