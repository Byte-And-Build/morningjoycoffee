"use client";
import styles from "../../app/page.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import Logo from '../../app/assets/Logo.webp';
import { useRouter } from "next/navigation";
import { api } from "../../app/utils/api";
import EditItemPopUp from "../../app/components/EditItemPopUp";
import InventoryItem from "../../app/components/InventoryItem";

export default function InventoryPage() {
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editPopUp, setEditPopUp] = useState(false);
  const [deletePopUp, setDeletePopUp] = useState(false);
  const [token, setToken] = useState("");

  useEffect(() => {
    fetchDrinks();
    const t = localStorage.getItem("MJCT");
      setToken(t);
  }, []);

  const fetchDrinks = async () => {
    try {
      const response = await api.get("api/drinks");
      setDrinks(response.data || []);
    } catch (error) {
      console.error("Error fetching drinks:", error);
    }
  };

  const handleDelete = async (_id) => {
    try {
      await api.post("api/drinks/deleteInventory", { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDrinks((prev) => prev.filter((d) => d._id !== _id));
      setDeletePopUp(false);
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete drink.");
    }
  };

  const calculateCost = (ingredients = []) => {
    return ingredients.reduce((acc, i) => {
      if (i.ingredientId?.costPerUnit && i.quantity) {
        acc += i.ingredientId.costPerUnit * i.quantity;
      }
      return acc;
    }, 0).toFixed(2);
  };

  const formatPriceBySize = (sizesArray = []) => {
  if (!Array.isArray(sizesArray)) return "No sizes";

  return sizesArray
    .map((s) => {
      const price = s.price;
      console.log(price)
      return `${s.size}: ${price ? `$${Number(price).toFixed(2)}` : "n/a"}`;
    })
    .join("\n");
};

  return (
    <div className={styles.page}>
      <div className={styles.stickyContainer}>
          <Image src={Logo} width={80} height={80} alt="Logo" content="contain" style={{maxWidth:'80px'}}/>
          <h1 className={styles.heading}>Products</h1>
          <InventoryItem refreshDrinks={fetchDrinks} />
      </div>
      <div className={styles.vertContainer}>
      {drinks.map((item) => (
        <div key={item._id} className={styles.inventoryWrapper}>
          <div className={styles.vertContainer} onClick={() => router.push(`/drink/${item._id}`)} style={{flex:'.3'}}> 
            <p className={styles.ingredients}>{item.name}</p>
            {item.image && (
            <Image src={item.image} width={80} height={80} alt={item.name} className="object-contain" style={{cursor: "pointer", minWidth:'fit-content'}}/>
            )}
          </div>
          <div className={styles.horizWrapper} style={{ maxWidth:'50%', justifyContent: "flex-start", maxHeight: "inherit", overflowX:'auto' }}>
              {item.sizes?.map((s) => (
                <div key={s.size}>
                  <p className={styles.ingredientsInventory} style={{ fontWeight: 'bold' }}>
                    {s.size}
                  </p>
                  <ul className={styles.ingredientsInventory} style={{ paddingLeft: '1rem' }}>
                    {s.ingredients.map((ing, idx) => (
                      <li key={idx}>
                        {ing.ingredientId?.name || ing.name} ({ing.quantity} {ing.unit})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          <pre>{formatPriceBySize(item.sizes)}</pre>
          <div className={styles.vertContainer} style={{flex:'.3'}}>
            <p className={styles.ingrediants}>Category: <br></br>{item.category}</p>
          </div>
          <div className={styles.vertContainer} style={{flex:'.25'}}>
            <div className={styles.horizContainer} style={{ padding: '.5em', width:'100%' }}>
              <span>👍</span>
              <span>{item.rating.thumbsUp}</span>
            </div>
            <div className={styles.horizContainer} style={{ padding: '.5em', width:'100%' }}>
              <span>👎</span>
              <span>{item.rating.thumbsDown}</span>
            </div>
          </div>
          <div className={styles.vertContainer} style={{flexGrow:'0'}}>
            <button className={styles.btns} onClick={() => { setSelectedItem(item); setEditPopUp(true);}}>
              Edit
            </button>
            <button className={styles.btns} onClick={() => { setSelectedItem(item); setDeletePopUp(true);}}>
              Delete
            </button>
          </div>
        </div>
      ))}
      </div>
      {editPopUp && (
        <EditItemPopUp
          item={selectedItem}
          setEditPopUp={setEditPopUp}
          fetchDrinks={fetchDrinks}
        />
      )}

      {deletePopUp && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
          <div className={styles.vertContainer}>
          <h2 className={styles.heading}>
            Are you sure you want to delete <br /> {selectedItem?.name}?
          </h2>
            <div className={styles.horizWrapper}>
              <button
                className={styles.btns}
                onClick={() => handleDelete(selectedItem?._id)}
              >
                Yes, Delete
              </button>
              <button
                className={styles.btns}
                onClick={() => setDeletePopUp(false)}
              >
                Cancel
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}