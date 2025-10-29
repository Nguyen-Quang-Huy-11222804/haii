import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout: React.FC = () => {
  const { cart, getTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    receiver_name: user?.fullname || '',
    phone_number: '',
    area_address: '',
    detail_address: '',
    payment_method: 'cod'
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        ...formData,
        cart_items: cart
      };

      const response = await axios.post('http://localhost:3001/api/orders', orderData);
      alert(response.data.message);
      clearCart();
      navigate('/');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-login-prompt">
        <div className="checkout-login-icon">🔒</div>
        <h1 className="checkout-login-title">Please Login</h1>
        <p className="checkout-login-text">You need to login to place an order.</p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary"
          style={{fontSize: '1.125rem', padding: '0.75rem 2rem'}}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1 className="checkout-title">Checkout</h1>

      <div className="checkout-layout">
        {/* Order Form */}
        <div className="checkout-form">
          <div className="checkout-form-card">
            <h2 className="checkout-section-title">Delivery Information</h2>

            <form onSubmit={handleSubmit} className="checkout-form-fields">
              <div className="checkout-form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="receiver_name"
                    value={formData.receiver_name}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Area</label>
                <select
                  name="area_address"
                  value={formData.area_address}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                >
                  <option value="">Select Area</option>
                  <option value="Tòa A1">Tòa A1</option>
                  <option value="Tòa A2">Tòa A2</option>
                  <option value="Tòa D">Tòa D</option>
                  <option value="Kí túc xá">Kí túc xá</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Detail Address</label>
                <textarea
                  name="detail_address"
                  value={formData.detail_address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="form-textarea"
                  placeholder="Room number, floor, etc."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <div className="payment-options">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={formData.payment_method === 'cod'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">Cash on Delivery (COD)</span>
                  </label>
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="payment_method"
                      value="transfer"
                      checked={formData.payment_method === 'transfer'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">Bank Transfer</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="checkout-submit-btn"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary">
          <div className="checkout-summary-card">
            <h2 className="checkout-section-title">Order Summary</h2>
            <div className="checkout-items">
              {cart.map(item => (
                <div key={item.id} className="checkout-item">
                  <img
                    src={item.image_url || '/placeholder-food.jpg'}
                    alt={item.name}
                    className="checkout-item-image"
                  />
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{item.name}</span>
                    <span className="checkout-item-quantity">x {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">{(item.price * item.quantity).toLocaleString()} VNĐ</span>
                </div>
              ))}
            </div>
            <hr />
            <div className="checkout-total">
              <span>Total:</span>
              <span className="checkout-total-amount">{getTotal().toLocaleString()} VNĐ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;