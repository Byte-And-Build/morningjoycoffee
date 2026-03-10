import styles from "../../app/page.module.css";

const AddEditIngredient = ({ingredientForm, editIngredient, setIngredientForm}) => {
  
    return ( 
        <>
        {ingredientForm && editIngredient && (
                <div className={styles.overlay} onClick={() => { setEditIngredient(null); setIngredientForm(false) }}>
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
                            setIngredientForm(false);
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
        </>
     );
}
 
export default AddEditIngredient;