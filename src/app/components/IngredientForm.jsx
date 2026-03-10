import styles from "../../app/page.module.css";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import { FaPlus } from "react-icons/fa";

import CurrencyInput from "./CurrencyInput";

const IngredientForm = ({showIngForm, setShowIngForm, availableIngredients}) => {

    const [newIngredient, setNewIngredient] = useState({
      name: "",
      unit: "",
      inStock: 0,
      reorderAt: 0,
      costPerUnit: 0,
      extraCost: 0,
      isExtra: false
    });

    const handleDeleteIngredient = async (id) => {
    if (!confirm("Really delete this ingredient?")) return;
    try {
      const token = localStorage.getItem("MJCT");
      await api.delete(
        `/api/items/ingredients/${id}`,
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

  const handleAddIngredient = async () => {
    try {
      const token = localStorage.getItem("MJCT");
      await api.post("/api/items/addIngredient", newIngredient, {
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
      const refreshed = await axios.get("/api/items/ingredients");
      setAvailableIngredients(refreshed.data || []);
    } catch (err) {
      console.error("Ingredient Add Error:", err);
      toast.error("Failed to add ingredient");
    }
  };
    
    return ( 
        <>
            {showIngForm && (
            <div className={styles.overlay} onClick={() => setShowIngForm(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <ToastContainer theme="dark" />
                <div className={styles.vertContainer} style={{padding: '1rem', flexGrow:'0'}}>
                <div className={styles.vertContainer} style={{boxShadow:'var(--insetShadow)', borderRadius: 'var(--borderRadiusLarge)', padding: '1rem', flexGrow:'0'}}>
                    <h3>Add New Item</h3>
                    <div className={styles.horizWrapper}>
                    <input className={styles.userInput} style={{margin: "0"}} placeholder="Name" value={newIngredient.name || ""} onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })} />
                    <select className={styles.select} value={newIngredient.unit} onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value }) }>
                        <option value="ml">ml</option>
                        <option value="oz">oz</option>
                        <option value="g">g</option>
                        <option value="piece">piece</option>
                        <option value="each">each</option>
                    </select>
                    </div>
                    <div className={styles.horizWrapper}>
                    <div className={styles.vertContainer} style={{flex: '1'}}>
                        <label htmlFor="stock" className={styles.ingredients}>Current Stock:</label>
                        <input id="stock" type="number" className={styles.userInput} placeholder="In Stock" value={newIngredient.inStock} onChange={(e) => setNewIngredient({ ...newIngredient, inStock: parseInt(e.target.value) })} />
                    </div>
                    <div className={styles.vertContainer} style={{flex: '1'}}>
                        <label className={styles.ingredients}>Re-Order At:</label>
                        <input type="number" className={styles.userInput} placeholder="Reorder At" value={newIngredient.reorderAt} onChange={(e) => setNewIngredient({ ...newIngredient, reorderAt: parseInt(e.target.value) })} />
                    </div>
                    <div className={styles.vertContainer} style={{flex: '1'}}>
                        <label className={styles.ingredients}>Cost Per Unit:</label>
                        <CurrencyInput value={newIngredient.costPerUnit} onChange={(val) => setNewIngredient({ ...newIngredient, costPerUnit: val })} placeholder="Cost Per Unit" />
                    </div>
                    <div className={styles.vertContainer} style={{flex: '1'}}>
                        <div className={styles.horizContainer} style={{boxShadow:'none'}}>
                        <label htmlFor="extra">Is Extra?</label>
                        <input id="extra" type="checkbox" checked={newIngredient.isExtra} onChange={(e) => setNewIngredient({ ...newIngredient, isExtra: e.target.checked })} />
                        </div>
                        {newIngredient.isExtra ? (
                        <>
                            <label className={styles.ingredients}>Extra Cost:</label>
                            <CurrencyInput value={newIngredient.extraCost} onChange={(val) => setNewIngredient({ ...newIngredient, extraCost: val })} placeholder="0.75" />
                        </>
                        ) : ( <></>)}
                        </div>
                    </div>
                    <button className={styles.btns} onClick={handleAddIngredient}> <FaPlus/> Save Ingredient </button>
                </div>
                {availableIngredients.length === 0 ? (
                    <p>No ingredients found.</p>
                ) : (
                    <div className={styles.vertWrapper} style={{ padding:'0px', width:'100%', overflowY:'auto', maxHeight:'45vh', borderRadius:'var(--borderRadiusLarge)', boxShadow:'var(--insetShadow)'}}>
                        <div className={styles.stickyContainer} style={{width:'100%', flexDirection: 'column'}}>
                            <h3>Available Items</h3>
                        <div className={styles.horizWrapper} style={{paddingBottom:'1rem'}}>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left"}}>Name</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left"}}>Cost/Unit</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left"}}>Extra Price</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left"}}>In Stock</span>
                            <span className={styles.ingredients} style={{flexGrow:'0', minWidth: "64px", textAlign: "center"}}>Is Extra</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "center"}}>Edit/Save</span>
                        </div>
                        </div>
                        {availableIngredients.map((ingredient) => (
                        <>
                        <div className={styles.cartWrapper} key={ingredient._id} style={{borderBottom: "1px black dashed"}}>
                            <span className={styles.ingredients} style={{flex: 1, textAlign: "left", minWidth: "100px"}}>{ingredient.name}</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left"}}>${ingredient.costPerUnit.toFixed(2)}/{ingredient.unit}</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "100px", textAlign: "left"}}>${ingredient.extraPrice.toFixed(2)}/{ingredient.unit}</span>
                            <span className={styles.ingredients} style={{flex: 1, minWidth: "64px", textAlign: "left"}}>{ingredient.inStock} {ingredient.unit}{ingredient.inStock > 1 ? "(s)" : ""}</span>
                            <input type="checkbox" defaultChecked={ingredient?.isExtra ? "checked" : ""} style={{flexGrow:'0', minWidth:"64px"}}/>
                            <button className={styles.btns} style={{flex: 1, minWidth: "100px"}} onClick={() => { setEditIngredient(ingredient); setIngredientForm(true); }}>Edit</button>
                            <button className={styles.btns} style={{flex: 1, minWidth: "100px"}} onClick={() => handleDeleteIngredient(ingredient._id)}>Delete</button>
                        </div>
                        </>
                        ))}
                        </div>
                )}
                <button className={styles.btns} style={{maxHeight:'fit-content'}} onClick={() => setShowIngForm(false)}>Close</button>
                </div>
            </div>
            </div>
        )}
        </>
     );
}
 
export default IngredientForm;