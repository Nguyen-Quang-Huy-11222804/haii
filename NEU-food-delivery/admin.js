// Admin Dashboard JavaScript
const API_BASE_URL = 'api/';

// Check if admin is logged in
function checkAdminAuth() {
    // This would typically check session, but for simplicity, assume logged in
    // In production, check session via API
    return true;
}

if (!checkAdminAuth()) {
    window.location.href = 'auth.html';
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.getAttribute('data-section');
        showSection(section);
    });
});

function showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    document.getElementById(sectionName + '-section').classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Load data for section
    switch(sectionName) {
        case 'orders':
            loadOrders();
            break;
        case 'products':
            loadProducts();
            break;
        case 'categories':
            loadCategories();
            break;
        case 'statistics':
            loadStatistics();
            break;
    }
}

// Orders Management
async function loadOrders() {
    try {
        const response = await fetch(API_BASE_URL + 'get_orders.php');
        const result = await response.json();
        
        if (result.success) {
            const ordersList = document.getElementById('orders-list');
            ordersList.innerHTML = result.data.map(order => `
                <div class="order-card">
                    <h3>Đơn hàng #${order.id}</h3>
                    <p>Khách hàng: ${order.receiver_name}</p>
                    <p>SĐT: ${order.phone_number}</p>
                    <p>Địa chỉ: ${order.delivery_address}</p>
                    <p>Tổng: ${formatPrice(order.total_amount)}</p>
                    <p>Trạng thái: <select onchange="updateOrderStatus(${order.id}, this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Chờ xử lý</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Đã xác nhận</option>
                        <option value="Shipping" ${order.status === 'Shipping' ? 'selected' : ''}>Đang giao</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Đã giao</option>
                        <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Đã hủy</option>
                    </select></p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        const response = await fetch(API_BASE_URL + 'update_order_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId, status: status })
        });
        const result = await response.json();
        if (result.success) {
            showModal('Thành công', 'Cập nhật trạng thái đơn hàng thành công');
        } else {
            showModal('Lỗi', result.message);
        }
    } catch (error) {
        console.error('Error updating order status:', error);
    }
}

// Products Management
async function loadProducts() {
    try {
        const response = await fetch(API_BASE_URL + 'get_dishes.php');
        const result = await response.json();
        
        if (result.success) {
            const productsList = document.getElementById('products-list');
            productsList.innerHTML = result.data.map(product => `
                <div class="product-card">
                    <img src="${product.image_url}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover;">
                    <h3>${product.name}</h3>
                    <p>${formatPrice(product.price)}</p>
                    <button onclick="editProduct(${product.id})">Sửa</button>
                    <button onclick="deleteProduct(${product.id})">Xóa</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function editProduct(id) {
    // Load product data and show modal
    loadCategoriesForSelect().then(() => {
        fetch(API_BASE_URL + 'get_dish.php?id=' + id)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    const product = result.data;
                    document.getElementById('product-id').value = product.id;
                    document.getElementById('product-name').value = product.name;
                    document.getElementById('product-description').value = product.description;
                    document.getElementById('product-price').value = product.price;
                    document.getElementById('product-image').value = product.image_url;
                    document.getElementById('product-category').value = product.category_id;
                    document.getElementById('product-modal-title').textContent = 'Sửa sản phẩm';
                    document.getElementById('product-modal').style.display = 'block';
                }
            });
    });
}

function deleteProduct(id) {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
        fetch(API_BASE_URL + 'delete_dish.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadProducts();
                showModal('Thành công', 'Xóa sản phẩm thành công');
            } else {
                showModal('Lỗi', result.message);
            }
        });
    }
}

// Categories Management
async function loadCategories() {
    try {
        const response = await fetch(API_BASE_URL + 'get_categories.php');
        const result = await response.json();
        
        if (result.success) {
            const categoriesList = document.getElementById('categories-list');
            categoriesList.innerHTML = result.data.map(category => `
                <div class="category-card">
                    <h3>${category.name}</h3>
                    <p>${category.description}</p>
                    <button onclick="editCategory(${category.id})">Sửa</button>
                    <button onclick="deleteCategory(${category.id})">Xóa</button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function editCategory(id) {
    fetch(API_BASE_URL + 'get_category.php?id=' + id)
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const category = result.data;
                document.getElementById('category-id').value = category.id;
                document.getElementById('category-name').value = category.name;
                document.getElementById('category-description').value = category.description;
                document.getElementById('category-modal-title').textContent = 'Sửa danh mục';
                document.getElementById('category-modal').style.display = 'block';
            }
        });
}

function deleteCategory(id) {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
        fetch(API_BASE_URL + 'delete_category.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadCategories();
                showModal('Thành công', 'Xóa danh mục thành công');
            } else {
                showModal('Lỗi', result.message);
            }
        });
    }
}

// Statistics
async function loadStatistics() {
    try {
        const response = await fetch(API_BASE_URL + 'get_statistics.php');
        const result = await response.json();
        
        if (result.success) {
            const statsContent = document.getElementById('stats-content');
            statsContent.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Tổng đơn hàng</h3>
                        <p>${result.data.total_orders}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Tổng sản phẩm</h3>
                        <p>${result.data.total_products}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Tổng danh mục</h3>
                        <p>${result.data.total_categories}</p>
                    </div>
                    <div class="stat-card">
                        <h3>Doanh thu</h3>
                        <p>${formatPrice(result.data.total_revenue)}</p>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
    }
}

// Modal handling
document.getElementById('add-product-btn').addEventListener('click', () => {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    document.getElementById('product-modal-title').textContent = 'Thêm sản phẩm';
    loadCategoriesForSelect();
    document.getElementById('product-modal').style.display = 'block';
});

document.getElementById('add-category-btn').addEventListener('click', () => {
    document.getElementById('category-form').reset();
    document.getElementById('category-id').value = '';
    document.getElementById('category-modal-title').textContent = 'Thêm danh mục';
    document.getElementById('category-modal').style.display = 'block';
});

// Close modals
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    });
});

// Form submissions
document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(API_BASE_URL + 'save_dish.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('product-modal').style.display = 'none';
            loadProducts();
            showModal('Thành công', 'Lưu sản phẩm thành công');
        } else {
            showModal('Lỗi', result.message);
        }
    } catch (error) {
        console.error('Error saving product:', error);
    }
});

document.getElementById('category-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch(API_BASE_URL + 'save_category.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        if (result.success) {
            document.getElementById('category-modal').style.display = 'none';
            loadCategories();
            showModal('Thành công', 'Lưu danh mục thành công');
        } else {
            showModal('Lỗi', result.message);
        }
    } catch (error) {
        console.error('Error saving category:', error);
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    fetch(API_BASE_URL + 'logout.php')
        .then(() => {
            window.location.href = 'index.html';
        });
});

// Utility functions
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
}

function showModal(title, message) {
    // Simple alert for now
    alert(title + ': ' + message);
}

async function loadCategoriesForSelect() {
    try {
        const response = await fetch(API_BASE_URL + 'get_categories.php');
        const result = await response.json();
        
        if (result.success) {
            const select = document.getElementById('product-category');
            select.innerHTML = '<option value="">Chọn danh mục</option>';
            result.data.forEach(category => {
                select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
            });
        }
    } catch (error) {
        console.error('Error loading categories for select:', error);
    }
}

// Initialize
showSection('orders');