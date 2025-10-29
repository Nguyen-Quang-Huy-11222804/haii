import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          NEU Food
        </Link>

        <div className="header-actions">
          {user ? (
            <div className="header-user-info">
              <div className="user-details">
                <div className="user-greeting">Welcome back</div>
                <div className="user-name">{user.fullname}</div>
              </div>
              {user.role !== 'admin' && (
                <Link to="/orders" className="btn btn-primary">
                  My Orders
                </Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger">
                Logout
              </button>
            </div>
          ) : (
            <div className="header-auth-buttons">
              <Link to="/login" className="btn btn-secondary">
                Login
              </Link>
              <Link to="/register" className="btn btn-success">
                Register
              </Link>
            </div>
          )}

          <Link to="/cart" className="cart-link">
            <span className="cart-icon">🛒</span>
            {getItemCount() > 0 && (
              <span className="cart-badge">
                {getItemCount()}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;