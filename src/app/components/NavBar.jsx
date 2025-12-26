"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import styles from "../../app/page.module.css";

const tabs = [
  { name: "Profile", icon: "MdPerson", route: "/profile" },
  { name: "Deals", icon: "MdLocalOffer", route: "/deals" },
  { name: "Drinks", icon: "MdLocalCafe", route: "/" },
  { name: "Scan", icon: "MdQrCodeScanner", route: "/scan" },
  { name: "Cart", icon: "MdShoppingCart", route: "/cart" },
];

export default function NavBar() {
  const router = useRouter();
  const { cart } = useCart();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(2);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!user) setActiveIndex(2);
  }, [user]);

  const handleClick = (index, route) => {
    setActiveIndex(index);
    router.push(route);
  };

  return (
    <nav className={styles.navbar}>
      {tabs.map((tab, i) => {
        const Icon = require("react-icons/md")[tab.icon];
        const isActive = i === activeIndex;
        return (
          <div key={tab.name} className={styles.navItem} onClick={() => handleClick(i, tab.route)}>
            <Icon size={isActive ? 32 : 24} color={isActive ? "#fff" : "#ffc2eb"} />
            {tab.name === "Cart" && totalItems > 0 && (
              <span className={styles.badge}>{totalItems}</span>
            )}
            {isActive && <p className={styles.navText}>{tab.name}</p>}
          </div>
        );
      })}
    </nav>
  );
}
