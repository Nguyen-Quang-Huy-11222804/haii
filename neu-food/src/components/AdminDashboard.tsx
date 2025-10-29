import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  description: string;
}

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  available: boolean;
}

interface Order {
  id: number;
  user_id: number;
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

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Dish form
  const [dishForm, setDishForm] = useState({
    name: '',
    description: '',
    price: '',
    image_url: '',
    category_id: '',
    available: true
  });
  const [editingDish, setEditingDish] = useState<Dish | null>(null);

  useEffect(() => {
    // Cancel editing when switching tabs
    setEditingDish(null);
    setDishForm({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      available: true
    });

    if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'dishes') {
      fetchCategories(); // Need categories for dish form
      fetchDishes();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchDishes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/dishes');
      setDishes(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dishes:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if category already exists
      const checkResponse = await axios.get('http://localhost:3001/api/categories');
      const existingCategory = checkResponse.data.data.find((cat: Category) => cat.name.toLowerCase() === categoryForm.name.toLowerCase());
      if (existingCategory) {
        alert('Category with this name already exists');
        return;
      }

      await axios.post('http://localhost:3001/api/categories', categoryForm);
      setCategoryForm({ name: '', description: '' });
      fetchCategories();
      alert('Category added successfully');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dishData = {
        ...dishForm,
        price: parseFloat(dishForm.price),
        category_id: parseInt(dishForm.category_id)
      };

      if (editingDish) {
        await axios.put(`http://localhost:3001/api/dishes/${editingDish.id}`, dishData);
        alert('Dish updated successfully');
      } else {
        await axios.post('http://localhost:3001/api/dishes', dishData);
        alert('Dish added successfully');
      }

      setDishForm({
        name: '',
        description: '',
        price: '',
        image_url: '',
        category_id: '',
        available: true
      });
      setEditingDish(null);
      fetchDishes();
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || `Failed to ${editingDish ? 'update' : 'add'} dish`);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await axios.put(`http://localhost:3001/api/orders/${orderId}/status`, { status });
      fetchOrders();
      alert('Order status updated');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to update order status');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/categories/${id}`);
      fetchCategories();
      alert('Category deleted');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to delete category');
    }
  };

  const deleteDish = async (id: number) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;

    try {
      await axios.delete(`http://localhost:3001/api/dishes/${id}`);
      fetchDishes();
      alert('Dish deleted');
    } catch (error) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to delete dish');
    }
  };

  const startEditingDish = (dish: Dish) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      image_url: dish.image_url,
      category_id: dish.category_id.toString(),
      available: dish.available
    });
  };

  const cancelEditingDish = () => {
    setEditingDish(null);
    setDishForm({
      name: '',
      description: '',
      price: '',
      image_url: '',
      category_id: '',
      available: true
    });
  };

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      <div className="admin-tabs">
        <nav className="admin-nav">
          <button
            onClick={() => setActiveTab('categories')}
            className={`admin-tab-btn ${activeTab === 'categories' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('dishes')}
            className={`admin-tab-btn ${activeTab === 'dishes' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          >
            Dishes
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`admin-tab-btn ${activeTab === 'orders' ? 'admin-tab-active' : 'admin-tab-inactive'}`}
          >
            Orders
          </button>
        </nav>
      </div>

      {activeTab === 'categories' && (
        <div>
          <h2 className="admin-section-title">Manage Categories</h2>

          <form onSubmit={handleCategorySubmit} className="admin-form-card">
            <h3 className="admin-form-title">Add New Category</h3>
            <div className="admin-form-grid">
              <input
                type="text"
                placeholder="Category Name"
                value={categoryForm.name}
                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                required
                className="admin-form-input"
              />
              <input
                type="text"
                placeholder="Description"
                value={categoryForm.description}
                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                className="admin-form-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="admin-submit-btn"
            >
              {loading ? 'Adding...' : 'Add Category'}
            </button>
          </form>

          <div className="admin-grid">
            {categories.map(category => (
              <div key={category.id} className="admin-card">
                <h3 className="admin-card-title">{category.name}</h3>
                <p className="admin-card-text">{category.description}</p>
                <button
                  onClick={() => deleteCategory(category.id)}
                  className="admin-delete-btn"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'dishes' && (
        <div>
          <h2 className="admin-section-title">Manage Dishes</h2>

          <form onSubmit={handleDishSubmit} className="admin-form-card">
            <h3 className="admin-form-title">{editingDish ? 'Edit Dish' : 'Add New Dish'}</h3>
            <div className="admin-form-grid">
              <input
                type="text"
                placeholder="Dish Name"
                value={dishForm.name}
                onChange={(e) => setDishForm({...dishForm, name: e.target.value})}
                required
                className="admin-form-input"
              />
              <input
                type="number"
                placeholder="Price"
                value={dishForm.price}
                onChange={(e) => setDishForm({...dishForm, price: e.target.value})}
                required
                className="admin-form-input"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={dishForm.image_url}
                onChange={(e) => setDishForm({...dishForm, image_url: e.target.value})}
                className="admin-form-input"
              />
              <select
                value={dishForm.category_id}
                onChange={(e) => setDishForm({...dishForm, category_id: e.target.value})}
                required
                className="admin-form-input"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <textarea
                placeholder="Description"
                value={dishForm.description}
                onChange={(e) => setDishForm({...dishForm, description: e.target.value})}
                rows={3}
                className="admin-form-textarea"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="admin-submit-btn"
            >
              {loading ? (editingDish ? 'Updating...' : 'Adding...') : (editingDish ? 'Update Dish' : 'Add Dish')}
            </button>
            {editingDish && (
              <button
                type="button"
                onClick={cancelEditingDish}
                className="admin-submit-btn"
                style={{ backgroundColor: '#6b7280', marginLeft: '1rem' }}
              >
                Cancel
              </button>
            )}
          </form>

          <div className="admin-grid">
            {dishes.map(dish => (
              <div key={dish.id} className="admin-card">
                <img src={dish.image_url || '/placeholder-food.jpg'} alt={dish.name} className="admin-card-image" />
                <h3 className="admin-card-title">{dish.name}</h3>
                <p className="admin-card-price">{dish.price.toLocaleString()} VNĐ</p>
                <p className="admin-card-description">{dish.description}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => startEditingDish(dish)}
                    className="admin-delete-btn"
                    style={{ backgroundColor: '#10b981' }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDish(dish.id)}
                    className="admin-delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 className="admin-section-title">Manage Orders</h2>

          <div className="admin-orders-list">
            {orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              orders.map(order => (
                <div key={order.id} className="admin-order-card">
                  <div className="admin-order-header">
                    <div className="admin-order-info">
                      <h3 className="admin-order-title">Order #{order.id}</h3>
                      <p className="admin-order-detail">{order.receiver_name} - {order.phone_number}</p>
                      <p className="admin-order-detail">{order.area_address}, {order.detail_address}</p>
                      <p className="admin-order-detail">Payment: {order.payment_method}</p>
                    </div>
                    <div className="admin-order-actions">
                      <p className="admin-order-total">{order.total_amount.toLocaleString()} VNĐ</p>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="admin-status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-order-items">
                    <h4 className="admin-items-title">Items:</h4>
                    {order.items.map((item, index) => (
                      <div key={index} className="admin-order-item">
                        <span>{item.dish_name} x {item.quantity}</span>
                        <span>{(item.price * item.quantity).toLocaleString()} VNĐ</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;