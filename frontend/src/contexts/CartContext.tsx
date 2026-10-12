import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { useBookingStore } from '../store/bookingStore';
import { buildBookingCartItem } from '../utils/bookingCart';

const BOOKING_CART_PREFIX = 'booking-';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  quantity: number;
  category: string;
  image?: string;
  description?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Mirror confirmed bookings into the cart. Any upcoming booking not yet
  // shown in the cart is added, and a line whose booking is no longer upcoming
  // (cancelled) drops out, so the cart always reflects the traveler's bookings.
  const bookings = useBookingStore((state) => state.bookings);
  const trackedBookings = useRef<Set<string>>(new Set());

  useEffect(() => {
    const upcomingIds = new Set(
      bookings.filter((booking) => booking.status === 'upcoming').map((booking) => booking.id)
    );
    const fresh = bookings.filter(
      (booking) => upcomingIds.has(booking.id) && !trackedBookings.current.has(booking.id)
    );
    trackedBookings.current = upcomingIds;

    setItems((prev) => {
      const kept = prev.filter((item) => {
        if (!item.id.startsWith(BOOKING_CART_PREFIX)) return true;
        return upcomingIds.has(item.id.slice(BOOKING_CART_PREFIX.length));
      });
      const existingIds = new Set(kept.map((item) => item.id));
      const additions = fresh
        .map(buildBookingCartItem)
        .filter((item) => !existingIds.has(item.id));
      if (additions.length === 0 && kept.length === prev.length && kept.every((item, i) => item === prev[i])) {
        return prev;
      }
      return [...kept, ...additions];
    });
  }, [bookings]);

  const addItem = useCallback((newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.title === newItem.title && item.category === newItem.category
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      const newCartItem: CartItem = {
        ...newItem,
        id: `${newItem.category}-${newItem.title}-${Date.now()}`,
        quantity: 1
      };

      return [...prevItems, newCartItem];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const isInCart = useCallback((id: string) => {
    return items.some(item => item.id === id);
  }, [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isInCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};