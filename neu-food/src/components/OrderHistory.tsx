import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Order {
  id: number;
  receiver_name: string;
  phone_number: string;
  area_address: string;
  detail_address: string;
  payment_method: string;
  status: string;
  total_amount: number;
  created_at: string;
  items: Array<{
    dish_id: number;
    quantity: number;
    price: number;
    dish_name: string;
  }>;
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading-text">Loading your orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="product-list-title">My Order History</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-text">You haven't placed any orders yet.</div>
        </div>
      ) : (
        <div className="order-history">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p>{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="order-status">
                  <p className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </p>
                  <p>{order.total_amount.toLocaleString()} VNĐ</p>
                </div>
              </div>

              <div className="order-delivery">
                <h4>Delivery Details</h4>
                <p><strong>Name:</strong> {order.receiver_name}</p>
                <p><strong>Phone:</strong> {order.phone_number}</p>
                <p><strong>Address:</strong> {order.area_address}, {order.detail_address}</p>
                <p><strong>Payment:</strong> {order.payment_method}</p>
              </div>

              <div className="order-items">
                <h4>Items</h4>
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.dish_name} x {item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString()} VNĐ</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;