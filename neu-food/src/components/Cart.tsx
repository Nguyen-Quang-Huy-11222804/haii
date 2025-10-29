import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity(id, quantity);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="cart-empty-icon">🛒</div>
        <h1 className="cart-empty-title">Your Cart is Empty</h1>
        <p className="cart-empty-text">Add some delicious food to your cart!</p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{fontSize: '1.125rem', padding: '0.75rem 2rem'}}
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Your Shopping Cart</h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          <h2 className="cart-summary-title">Cart Items</h2>
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image_url || '/placeholder-food.jpg'}
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-info">
                  <h3 className="cart-item-title">{item.name}</h3>
                  <p className="cart-item-price">{formatPrice(item.price)}</p>
                </div>
                <div className="cart-quantity-controls">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity-display">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-actions">
                  <p className="cart-total-price">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="remove-btn"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={clearCart}
            className="btn btn-danger"
            style={{marginTop: '1.5rem'}}
          >
            Clear All Items
          </button>
        </div>

        {/* Cart Summary */}
        <div className="cart-summary">
          <h2 className="cart-summary-title">Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal:</span>
            <span style={{fontWeight: '600'}}>{formatPrice(getTotal())}</span>
          </div>
          <div className="summary-row">
            <span>Delivery:</span>
            <span style={{fontWeight: '600', color: '#10b981'}}>Free</span>
          </div>
          <hr style={{margin: '1rem 0'}} />
          <div className="summary-total">
            <span>Total:</span>
            <span>{formatPrice(getTotal())}</span>
          </div>
          <div style={{marginTop: '1.5rem'}}>
            <button
              onClick={() => navigate('/')}
              className="continue-shopping-btn"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/checkout')}
              className="checkout-btn"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;