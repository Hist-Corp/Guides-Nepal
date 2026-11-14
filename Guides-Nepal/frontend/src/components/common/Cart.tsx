import React, { useState } from 'react';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useBookingStore } from '../../store/bookingStore';

const BOOKING_CART_PREFIX = 'booking-';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQuantity, getTotalItems, getTotalPrice } = useCart();
  const [showCheckoutPrompt, setShowCheckoutPrompt] = useState(false);
  const { formatPrice } = useCurrency();
  const cancelBooking = useBookingStore((state) => state.cancelBooking);
  const deleteBooking = useBookingStore((state) => state.deleteBooking);

  if (!isOpen) return null;

  // Booking lines mirror real bookings: removing one cancels the booking
  // (status → cancelled, releasing the reserved guide) and deletes the booking
  // record, so "Remove from cart" is a true cancellation, not just a UI hide.
  const handleRemove = (itemId: string) => {
    if (itemId.startsWith(BOOKING_CART_PREFIX)) {
      const bookingId = itemId.slice(BOOKING_CART_PREFIX.length);
      cancelBooking(bookingId);
      deleteBooking(bookingId);
    }
    removeItem(itemId);
  };

  const handleCheckout = () => {
    // Implement checkout logic here
    setShowCheckoutPrompt(true);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 transition-opacity"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart ({getTotalItems()})</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="h-16 w-16 mb-4" />
                <p className="text-lg">Your cart is empty</p>
                <p className="text-sm mt-2">Add some experiences to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const isBookingLine = item.id.startsWith('booking-');
                  return (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}

                      <div className="flex-1">
                        <h3 className="font-medium">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        <p className="text-sm text-gray-500 capitalize">{item.category}</p>
                        <p className="font-semibold text-primary">
                          {formatPrice(item.price, item.currency)}
                          {item.quantity > 1 && ' each'}
                        </p>
                      </div>

                      {/* Booking lines have a fixed guest count, so the quantity
                          stepper only applies to regular cart items. */}
                      {!isBookingLine && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      <button
                        onClick={() => handleRemove(item.id)}
                        className="p-1 hover:bg-gray-100 rounded text-red-500"
                        title={
                          isBookingLine
                            ? 'Cancel and delete this booking'
                            : 'Remove from cart'
                        }
                        aria-label={
                          isBookingLine
                            ? 'Cancel and delete this booking'
                            : 'Remove from cart'
                        }
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(getTotalPrice(), 'USD')}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-hover transition-colors font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
      )}
    {showCheckoutPrompt && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4"
        onClick={() => setShowCheckoutPrompt(false)}
      >
        <div
          className="relative w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl animate-in fade-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
            <svg className="h-7 w-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Checkout functionality will be implemented soon!</h2>
          <p className="mt-2 text-sm text-gray-600">
            We're working on bringing you a seamless checkout experience. Stay tuned!
          </p>
          <button
            onClick={() => setShowCheckoutPrompt(false)}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            OK
          </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Cart;