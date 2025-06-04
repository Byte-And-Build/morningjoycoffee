import React, { createContext, useContext, useState } from "react";

interface CustomOption {
  name: string;
  price?: number;
}

interface CartItem {
  id: string;
  name: string;
  selectedSize: string;
  image: string;
  quantity: number;
  selectedPrice: number;
  customOptions: CustomOption[]; // ✅ Fix: Ensure this is an array instead of a string
  totalPrice: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void; // ✅ Fix: Ensure id is passed
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      const uniqueId = `${item.name}-${item.selectedSize}-${item.customOptions
        ?.map((opt) => opt.name)
        .join(",")}`;

      const existingItem = prevCart.find((cartItem) => cartItem.id === uniqueId);
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === uniqueId
            ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
            : cartItem
        );
      }

      return [...prevCart, { ...item, id: uniqueId }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { 
              ...item, 
              quantity: newQuantity,
              totalPrice: (item.selectedPrice + item.customOptions.reduce((sum, opt) => sum + (opt.price || 0), 0)) * newQuantity
            }
          : item
      )
    );
  };
  

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

export default CartProvider;
