'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '@/types/product';
import confetti from 'canvas-confetti';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, flavor?: string, size?: string, customPrice?: number) => void;
  removeFromCart: (productId: string, flavor?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, flavor?: string, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  freeShippingThreshold: number;
  shippingRemaining: number;
  shippingProgress: number;
  quickViewProduct: Product | null;
  setQuickViewProduct: (product: Product | null) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const FREE_SHIPPING_THRESHOLD = 1000000; // 1,000,000 VND

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isClient, setIsClient] = useState(false);

  const [freeshipThreshold, setFreeshipThreshold] = useState(FREE_SHIPPING_THRESHOLD);

  // Load cart and freeship policy from localStorage on mount
  useEffect(() => {
    setIsClient(true);
    try {
      const savedCart = localStorage.getItem('whey4you_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedThreshold = localStorage.getItem('w4u_freeship_threshold');
      if (savedThreshold) {
        setFreeshipThreshold(Number(savedThreshold));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isClient) {
      try {
        localStorage.setItem('whey4you_cart', JSON.stringify(cart));
      } catch (e) {
        console.error('Failed to save cart to storage', e);
      }
    }
  }, [cart, isClient]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (e) {
      // ignore
    }
  };

  const addToCart = (
    product: Product,
    quantity: number = 1,
    flavor?: string,
    size?: string,
    customPrice?: number
  ) => {
    const selectedFlavor = flavor || product.flavors?.[0] || 'Tiêu chuẩn';
    const selectedSize = size || product.sizes?.[0] || 'Tiêu chuẩn';

    // Tìm mức giá của kích cỡ tương ứng
    let itemPrice = product.price;
    if (customPrice !== undefined && customPrice > 0) {
      itemPrice = customPrice;
    } else if (product.sizeVariants && product.sizeVariants.length > 0) {
      const matchedVariant = product.sizeVariants.find((v) => v.name === selectedSize);
      if (matchedVariant && matchedVariant.price && matchedVariant.price > 0) {
        itemPrice = matchedVariant.price;
      }
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedFlavor === selectedFlavor &&
          item.selectedSize === selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        updated[existingIndex].price = itemPrice;
        return updated;
      } else {
        return [
          ...prev,
          {
            product,
            quantity,
            selectedFlavor,
            selectedSize,
            price: itemPrice,
          },
        ];
      }
    });

    triggerCelebration();
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, flavor?: string, size?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (!flavor || item.selectedFlavor === flavor) &&
            (!size || item.selectedSize === size)
          )
      )
    );
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    flavor?: string,
    size?: string
  ) => {
    if (quantity <= 0) {
      removeFromCart(productId, flavor, size);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (
          item.product.id === productId &&
          (!flavor || item.selectedFlavor === flavor) &&
          (!size || item.selectedSize === size)
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingRemaining = Math.max(0, freeshipThreshold - subtotal);
  const shippingProgress = Math.min(100, Math.round((subtotal / freeshipThreshold) * 100));

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        freeShippingThreshold: freeshipThreshold,
        shippingRemaining,
        shippingProgress,
        quickViewProduct,
        setQuickViewProduct,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
