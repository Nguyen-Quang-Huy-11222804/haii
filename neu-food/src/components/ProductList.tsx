import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
}

const ProductList: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDishes = useCallback(async () => {
    try {
      setLoading(true);
      const params = selectedCategory ? { category_id: selectedCategory } : {};
      const response = await axios.get('http://localhost:3001/api/dishes', { params });
      setDishes(response.data.data);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchCategories();
    fetchDishes();
  }, [fetchDishes]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  const handleAddToCart = (dish: Dish) => {
    addToCart({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      image_url: dish.image_url
    });
    alert(`${dish.name} added to cart!`);
  };

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
  };

  return (
    <div>
      <h1 className="product-list-title">NEU Food Menu</h1>

      {/* Category Filter */}
      <div className="category-filter-card">
        <div className="category-buttons">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`category-btn ${selectedCategory === null ? 'category-btn-active' : 'category-btn-inactive'}`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`category-btn ${selectedCategory === category.id ? 'category-btn-active' : 'category-btn-inactive'}`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-text">Loading delicious food...</div>
        </div>
      ) : (
        <div className="product-grid">
          {dishes.map(dish => (
            <div key={dish.id} className="product-card">
              <div className="product-image-container">
                <img
                  src={dish.image_url || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={dish.name}
                  className="product-image"
                />
              </div>
              <div className="product-content">
                <h3 className="product-title">{dish.name}</h3>
                <p className="product-description">{dish.description}</p>
                <p className="product-category">{dish.category_name}</p>
                <div className="product-footer">
                  <span className="product-price">{formatPrice(dish.price)}</span>
                  <button
                    onClick={() => handleAddToCart(dish)}
                    className="add-to-cart-btn"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {dishes.length === 0 && !loading && (
        <div className="empty-state">
          <div className="empty-state-text">No dishes found in this category.</div>
        </div>
      )}
    </div>
  );
};

export default ProductList;