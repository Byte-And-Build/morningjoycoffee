"use client";
import styles from "../../app/page.module.css";
import { useCart } from "../../app/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { MdAdd, MdRemove } from "react-icons/md";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const [coupon, setCoupon] = useState("");

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <div className={styles.vertContainer}>
            {cart.map((item) => (
              <div
                key={item.id}
                className={styles.cartWrapper}
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  width={60}
                  height={60}
                  className="rounded-lg"
                />
                <div className={styles.cartDetails}>
                  <span className={styles.itemNameCart}>{item.name}</span>
                  <div className={styles.vertContainer}>
                  {item.customOptions?.length > 0 && (
                    <ul>
                      <li className={styles.itemDetails}>Size: {item.selectedSize}</li>
                      {item.customOptions.map((opt, i) => (
                        <li key={i} className={styles.itemDetails}>
                          - {opt.name} (+${opt.price?.toFixed(2) || "0.00"})
                        </li>
                      ))}
                    </ul>
                  )}        
                  </div>    
                </div>
                <div className={styles.vertContainer}>
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(item.quantity - 1, 1))}
                    className={styles.qtyBtns}
                  >
                    <MdRemove size={20} />
                  </button>
                  <span className={styles.qtyInput}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className={styles.qtyBtns}
                  >
                    <MdAdd size={20} />
                  </button>
                </div>

                <div className={styles.vertContainer}>
                  <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className={styles.btnsSmall}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          
            <div className={styles.vertContainer} style={{width: "60%", maxHeight: "fit-content"}}>
              <h2 className={styles.heading}>
                Subtotal: ${subtotal.toFixed(2)}
              </h2>
              <button
                className={styles.btns}
                onClick={() => router.push("/checkout")}
              >
                Checkout
              </button>
              <button
                className={styles.btns}
                onClick={clearCart}
              >
                Clear Cart
              </button>
            </div>
        </>
      )}
    </div>
  );
}