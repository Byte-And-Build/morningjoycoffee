import styles from "../../app/page.module.css";
import { api } from "../../app/utils/api";

const DeletePopUp = ({selectedItem, setDeletePopUp, setItems, token}) => {

    const handleDelete = async (_id) => {
    try {
      await api.post("api/items/deleteInventory", { _id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setItems((prev) => prev.filter((d) => d._id !== _id));
      setDeletePopUp(false);
    } catch (err) {
      console.error("Delete error", err);
      alert("Failed to delete item.");
    }
  };

    return ( 
        <div className={styles.overlay}>
          <div className={styles.modal}>
          <div className={styles.vertContainer}>
          <h2 className={styles.heading}>
            Are you sure you want to delete: <br /> {selectedItem?.name}?
          </h2>
            <p className={styles.drinkDetails}>This action is irreversible, and cannot be recovered. Proceed at your own risk.</p>
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
     );
}
 
export default DeletePopUp;