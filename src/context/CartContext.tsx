"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  color?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size?: string, color?: string) => void;
  removeFromCart: (id: string, size?: string, color?: string) => void;
  updateQuantity: (id: string, newQuantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  total: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = (product: Product, size?: string, color?: string) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, size, color }];
    });
  };

  const removeFromCart = (id: string, size?: string, color?: string) => {
    setItems((prev) => prev.filter((item) => !(item.id === id && item.size === size && item.color === color)));
  };

  const updateQuantity = (id: string, newQuantity: number, size?: string, color?: string) => {
    if (newQuantity <= 0) {
      removeFromCart(id, size, color);
      return;
    }
    setItems((prev) => 
      prev.map(item => 
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, isCartOpen, setIsCartOpen }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
