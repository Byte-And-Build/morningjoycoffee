"use client";
import styles from "../../app/page.module.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api } from "../../app/utils/api";
import EditItemPopUp from "../../app/components/EditItemPopUp";

export default function InventoryPage() {
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editPopUp, setEditPopUp] = useState(false);
  const [deletePopUp, setDeletePopUp] = useState(false);

  useEffect(() => {
    fetchDrinks();
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
      await api.post("api/drinks/deleteInventory", { _id });
      setDrinks((prev) => prev.filter((d) => d._id !== _id));
      setDeletePopUp(false);
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete drink.");
    }
  };

  const formatPriceBySize = (priceArray) => {
    const sizes = ["Kids", "20oz", "24oz", "32oz"];
    const priceObj = Array.isArray(priceArray) ? priceArray[0] : {};

    return sizes
      .map((size) => {
        const price = priceObj?.[size];
        return `${size}: ${price ? `$${Number(price).toFixed(2)}` : "n/a"}`;
      })
      .join("\n");
  };

  return (
    <div className={styles.page}>
      <div className={styles.vertContainer}>
      <div className={styles.horizContainer}>
        <Image src="/images/Logo.png" width={65} height={65} alt="Logo" />
        <h1 className={styles.heading}>Inventory</h1>
      </div>
      < div className={styles.vertContainer}>
      {drinks.map((item) => (
        <div key={item._id} className={styles.inventoryWrapper}>
          <div className={styles.vertContainer}> 
            <p className={styles.ingrediants}>{item.name}</p>
            <Image src={item.image} width={80} height={80} alt={item.name} className="object-contain" />
          </div>
          <div className={styles.vertContainer}>
            <p className={styles.ingrediantsInventory}>{item.ingrediants}</p>
          </div>
          <pre>{formatPriceBySize(item.price)}</pre>
          <p className={styles.ingrediants}>{item.category}</p>
          <div className={styles.vertContainer}>
            <div className={styles.horizContainer}>
              <span>👍</span>
              <span>{item.rating.thumbsUp}</span>
            </div>
            <div className={styles.horizContainer}>
              <span>👎</span>
              <span>{item.rating.thumbsDown}</span>
            </div>
          </div>
          <div className={styles.vertContainer}>
            <button
              className={styles.btnsSmall}
              onClick={() => {
                setSelectedItem(item);
                setEditPopUp(true);
              }}
            >
              Edit
            </button>
            <button
              className={styles.btnsSmall}
              onClick={() => {
                setSelectedItem(item);
                setDeletePopUp(true);
              }}
            >
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
        <div className="fixed inset-0 bg-white/90 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Are you sure you want to delete <br /> {selectedItem?.name}?
          </h2>
          <div className="flex flex-col gap-4">
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => handleDelete(selectedItem?._id)}
            >
              Yes, Delete {selectedItem?.name}
            </button>
            <button
              className="bg-green-500 text-white px-4 py-2 rounded"
              onClick={() => setDeletePopUp(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}