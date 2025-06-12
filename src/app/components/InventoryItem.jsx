import { useState } from "react";
import styles from "../../app/page.module.css";
import { api } from "../utils/api";
import CurrencyInput from "./CurrencyInput";

const InventoryItem = ({ refreshDrinks }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    _id: null,
    name: "",
    category: "",
    ingrediants: "",
    image: "",
    price: [{}],
    rating: { thumbsUp: 0, thumbsDown: 0 },
  });

  const availableSizes = ["Kids", "16oz", "20oz", "24oz", "32oz"];
  const [sizes, setSizes] = useState(() =>
    Object.fromEntries(availableSizes.map(size => [size, { selected: false, price: 0 }]))
  );

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
      alert("Failed to save drink");
    }
  };

  const resetForm = () => {
    setFormData({
      _id: null,
      name: "",
      category: "",
      ingrediants: "",
      image: "",
      price: [{}],
      rating: { thumbsUp: 0, thumbsDown: 0 },
    });
    setSizes(Object.fromEntries(availableSizes.map(size => [size, { selected: false, price: 0 }])));
    setExtras(Object.fromEntries(availableExtras.map(extra => [extra.name, { selected: false, price: extra.price }])));
  };

  return (
    <>
      <button onClick={() => setShowForm(true)} className={styles.btns}>➕ Add Item</button>
      {showForm && (
        <div className={styles.popupScroll}>
          <div className={styles.popup}>
            <div className={styles.vertContainer}>
            <div className={styles.InventoryHoriz}>
              <input
                name="Item Name"
                style={{padding:".25rem"}}
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
              name="ingrediants"
              className={styles.textarea}
              placeholder="Ingredients"
              value={formData.ingrediants}
              onChange={(e) => setFormData({ ...formData, ingrediants: e.target.value })}
            />
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
