// --- CONFIG & UTILS ---
// Base URL cho các API PHP của bạn (Đảm bảo đường dẫn này là chính xác so với file index.html)
const API_BASE_URL = 'api/';

// Global user session state
let currentUser = null;

// Check user session and update UI
async function checkAndUpdateUserSession() {
    try {
        const response = await fetch(API_BASE_URL + 'check_session.php', {
            credentials: 'include'
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            currentUser = result.data;
            updateUserUI(true);
        } else {
            currentUser = null;
            updateUserUI(false);
        }
    } catch (error) {
        console.error('Error checking session:', error);
        currentUser = null;
        updateUserUI(false);
    }
}

// Update user interface based on login status
function updateUserUI(isLoggedIn) {
    const authLink = document.querySelector('.nav-auth-link');
    if (!authLink) return;
    
    if (isLoggedIn && currentUser) {
        // Show user name and logout option
        authLink.innerHTML = `
            <i class='bx bx-user' style="margin-right: 4px;"></i> 
            <span>${currentUser.fullname}</span>
        `;
        authLink.href = '#';
        authLink.onclick = (e) => {
            e.preventDefault();
            showUserMenu();
        };
    } else {
        // Show login/register link
        authLink.innerHTML = `
            <i class='bx bx-user' style="margin-right: 4px;"></i> Đăng nhập/Đăng kí
        `;
        authLink.href = 'auth.html';
        authLink.onclick = null;
    }
}

// Show user menu dropdown
function showUserMenu() {
    showModal('Tài khoản', `Xin chào, ${currentUser.fullname}!\n\nBạn muốn đăng xuất?`, true).then(async (confirmed) => {
        if (confirmed) {
            await logoutUser();
        }
    });
}

// Logout user
async function logoutUser() {
    try {
        await fetch(API_BASE_URL + 'logout.php', {
            credentials: 'include'
        });
        currentUser = null;
        updateUserUI(false);
        showModal('Thành công', 'Đã đăng xuất thành công.');
        // Redirect to home if on checkout page
        if (window.location.pathname.includes('checkout.html')) {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Logout error:', error);
        showModal('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
}

// Hàm hiển thị Modal (thay thế alert/confirm)
function showModal(title, message, isConfirm = false) {
    // Logic Modal đã được tối ưu để hoạt động độc lập
    return new Promise(resolve => {
        let modal = document.getElementById('custom-modal');
        if (!modal) {
            // TẠO MODAL nếu chưa có (chỉ cần tạo 1 lần)
            modal = document.createElement('div');
            modal.id = 'custom-modal';
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-opacity duration-300 opacity-0 pointer-events-none';
            modal.innerHTML = `
                <div class="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform -translate-y-4 transition-transform duration-300">
                    <div class="text-center">
                        <i id="modal-icon" class='bx text-4xl mb-4' style="color: #fd4646;"></i>
                        <h3 id="modal-title" class="text-xl font-semibold text-text-color mb-3">Thông báo</h3>
                        <p id="modal-message" class="text-gray-600 mb-4"></p>
                        <div class="flex justify-center space-x-3">
                            <button id="modal-cancel" class="py-2 px-4 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition duration-200 hidden">Hủy</button>
                            <button id="modal-ok" class="py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition duration-200">Đồng ý</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        // Cập nhật nội dung
        const icon = modal.querySelector('#modal-icon');
        const modalTitle = modal.querySelector('#modal-title');
        const modalMessage = modal.querySelector('#modal-message');
        const modalOk = modal.querySelector('#modal-ok');
        const modalCancel = modal.querySelector('#modal-cancel');
        
        // Cập nhật trạng thái và màu icon
        const successColor = '#10B981';
        const errorColor = '#fd4646';
        const confirmColor = '#FFC107';

        let iconClass = 'bxs-check-circle';
        let iconColor = successColor;
        if (isConfirm) {
            iconClass = 'bxs-help-circle';
            iconColor = confirmColor;
        } else if (title === 'Lỗi' || title === 'Thất bại' || title === 'Không hợp lệ') {
             iconClass = 'bxs-x-circle';
             iconColor = errorColor;
        }

        icon.className = `bx text-4xl mb-4 ${iconClass}`;
        icon.style.color = iconColor;
        modalTitle.textContent = title;
        modalMessage.textContent = message;

        // Cài đặt nút
        if (isConfirm) {
            modalCancel.style.display = 'inline-block';
            modalOk.textContent = 'Đồng ý';
            modalOk.onclick = () => { modal.classList.add('hidden'); resolve(true); };
            modalCancel.onclick = () => { modal.classList.add('hidden'); resolve(false); };
        } else {
            modalCancel.style.display = 'none';
            modalOk.textContent = 'OK';
            modalOk.onclick = () => { modal.classList.add('hidden'); resolve(true); };
        }

        // Hiển thị modal
        modal.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
        modal.classList.add('flex');
    });
}


// --- CÁC HÀM TIỆN ÍCH KHÁC (LocalStorage, Price Formatting) ---

// Function to format price: 45000 -> "45.000 VNĐ"
function formatPrice(price) {
    if (price === null || isNaN(price)) return "0 VNĐ";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " VNĐ";
}

// Hàm tiện ích để lấy giỏ hàng từ LocalStorage
function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem('neu_food_cart'));
        return Array.isArray(cart) ? cart : [];
    } catch (e) {
        console.error("Lỗi khi đọc giỏ hàng từ localStorage:", e);
        return [];
    }
}

// Hàm tiện ích để lưu giỏ hàng vào LocalStorage
function saveCart(cart) {
    localStorage.setItem('neu_food_cart', JSON.stringify(cart));
    updatetotal();
    updateCartCount();
}

// --- CORE APPLICATION STARTUP ---
let cartIcon = document.querySelector('#cart-icon');
let cart = document.querySelector('.cart');
let closeCart = document.querySelector('#close-cart');
let buyButton = document.querySelector('.btn-buy');

// OPEN/CLOSE CART
if (cartIcon) { cartIcon.onclick = () => { cart.classList.add("active"); }; }
if (closeCart) { closeCart.onclick = () => { cart.classList.remove("active"); }; }

// READY FUNCTION
if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
} else {
    ready();
}

function ready() {
    // Check user session first
    checkAndUpdateUserSession();
    
    // Khởi tạo các event listeners cho Giỏ hàng
    setupCartListeners();
    // Tải danh mục và món ăn động từ API
    fetchAndDisplayCategories();
    if (document.getElementById('product-list')) {
        fetchAndDisplayProducts();
    }
    // Setup form logic nếu các form tồn tại
    if (document.getElementById('login-form')) {
        setupAuthForm();
    }
    if (document.getElementById('checkout-form')) {
        setupCheckoutForm();
    }

    // Gắn sự kiện cho nút Thanh toán (chuyển hướng)
    if (buyButton) {
        buyButton.addEventListener("click", buyButtonClicked);
    }
}

// --- API FETCH LOGIC (Kiểm tra lỗi Render) ---
async function fetchAndDisplayProducts(categoryId = null) {
    // Lấy ID chính xác từ HTML mới
    const shopContent = document.getElementById('product-list'); 
    const loadingMessage = document.getElementById('loading-message');
    if (!shopContent) {
        console.error("Lỗi: Không tìm thấy phần tử #product-list");
        return;
    }
    
    if (loadingMessage) loadingMessage.style.display = 'flex'; 

    try {
        let url = API_BASE_URL + 'get_dishes.php';
        if (categoryId) {
            url += '?category_id=' + categoryId;
        }
        console.log("Đang gọi API:", url);
        const response = await fetch(url);
        
        // KIỂM TRA PHẢN HỒI HTTP (Rất quan trọng)
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Dữ liệu nhận được:", result);

        if (loadingMessage) loadingMessage.style.display = 'none';

        if (result.success && result.data && result.data.length > 0) {
            let productsHTML = '';
            
            result.data.forEach(dish => {
                const formattedPrice = formatPrice(dish.price);

                // Log each image URL for debugging (will appear in Console)
                console.log(`Dish #${dish.id} image_url:`, dish.image_url);

                productsHTML += `
                    <div class="product-box">
                        <!-- Thêm đường dẫn placeholder dự phòng nếu ảnh lỗi 404 -->
                        <img src="${dish.image_url}" alt="${dish.name}" class="product-img" onerror="console.warn('Image failed to load:', this.src); this.onerror=null; this.src='https://placehold.co/600x400/FF33A1/FFFFFF?text=Food';">
                        <h2 class="product-title">${dish.name}</h2>
                        <span class="price">${formattedPrice}</span>
                        <i class='bx bx-shopping-bag add-cart' 
                            data-id="${dish.id}" 
                            data-name="${dish.name}" 
                            data-price="${dish.price}" 
                            data-img="${dish.image_url}"></i>
                    </div>
                `;
            });
            
            // IN HTML ĐÃ TẠO RA CONSOLE ĐỂ KIỂM TRA
            console.log("HTML được tạo:", productsHTML);
            
            shopContent.innerHTML = productsHTML;
            
            // Gắn lại sự kiện cho các nút "Add to Cart" mới được tạo
            attachAddToCartListeners();

        } else {
            shopContent.innerHTML = `<div class="text-center w-full col-span-full py-10 text-xl text-red-500">${result.message || "Hiện tại không có món ăn nào để hiển thị."}</div>`;
        }

    } catch (error) {
        console.error("LỖI KHÔNG TẢI ĐƯỢC MÓN ĂN:", error);
        if (loadingMessage) loadingMessage.style.display = 'none';
        shopContent.innerHTML = `<div class="text-center w-full col-span-full py-10 text-xl text-red-500">Lỗi: Không thể kết nối hoặc Server gặp lỗi. (Xem Console)</div>`;
    }
}

// Load categories
async function fetchAndDisplayCategories() {
    try {
        const response = await fetch(API_BASE_URL + 'get_categories.php');
        const result = await response.json();
        
        if (result.success && result.data) {
            const categoryFilter = document.querySelector('.category-filter');
            const allBtn = categoryFilter.querySelector('.category-btn');
            
            result.data.forEach(category => {
                const btn = document.createElement('button');
                btn.className = 'category-btn';
                btn.textContent = category.name;
                btn.setAttribute('data-category-id', category.id);
                categoryFilter.appendChild(btn);
            });
            
            // Add event listeners for category buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    const categoryId = btn.getAttribute('data-category-id') || null;
                    fetchAndDisplayProducts(categoryId);
                });
            });
        }
    } catch (error) {
        console.error("Lỗi tải danh mục:", error);
    }
}


// --- CART LISTENERS ---
function setupCartListeners() {
    loadCartDisplay();
    attachAddToCartListeners(); // Gắn sự kiện cho các nút có sẵn
    updatetotal();
}

function attachAddToCartListeners() {
    // Gắn sự kiện cho các nút "Add to Cart"
    document.querySelectorAll(".add-cart").forEach(button => {
        button.removeEventListener("click", addCartClicked); 
        button.addEventListener("click", addCartClicked);
    });
    
    // Gắn sự kiện cho các item trong giỏ hàng (tải từ localStorage)
    const cartContent = document.getElementsByClassName("cart-content")[0];
    if (cartContent) {
        cartContent.querySelectorAll(".cart-remove").forEach(btn => {
            btn.removeEventListener("click", removeCartItem);
            btn.addEventListener("click", removeCartItem);
        });
        cartContent.querySelectorAll(".cart-quantity").forEach(input => {
            input.removeEventListener("change", quantityChanged);
            input.addEventListener("change", quantityChanged);
        });
    }
}

function loadCartDisplay() {
    const cart = getCart();
    const cartContent = document.getElementsByClassName("cart-content")[0];
    
    if (cartContent) {
        cartContent.innerHTML = ''; 
        
        cart.forEach(item => {
            const formattedPrice = formatPrice(item.price);
            const cartBoxContent = `
                <div class="cart-box" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.name}" class="cart-img" onerror="this.onerror=null; this.src='https://placehold.co/60x60/FF33A1/FFFFFF?text=Food';">
                    <div class="detail-box">
                        <div class="cart-product-title">${item.name}</div>
                        <div class="cart-price">${formattedPrice}</div>
                        <input type="number" value="${item.quantity}" min="1" class="cart-quantity" data-id="${item.id}">
                    </div>
                    <i class='bx bxs-trash-alt cart-remove' data-id="${item.id}"></i>
                </div>
            `;
            cartContent.insertAdjacentHTML('beforeend', cartBoxContent);
        });
        
        attachAddToCartListeners(); // Cập nhật lại listeners cho các phần tử mới
    }
}

// --- CART EVENT HANDLERS ---
function buyButtonClicked() {
    const cartItems = getCart();
    if (cartItems.length === 0) {
        showModal("Giỏ hàng trống", "Giỏ hàng của bạn đang trống! Vui lòng thêm món ăn.", false);
        return;
    }
    
    // Check if user is logged in
    if (!currentUser) {
        showModal("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục thanh toán.", false).then(() => {
            window.location.href = "auth.html";
        });
        return;
    }
    
    // Chuyển hướng đến trang thanh toán
    window.location.href = "checkout.html";
}

function addCartClicked(event) {
    const button = event.target;
    
    // Lấy dữ liệu từ data attributes
    const dishId = button.getAttribute('data-id');
    const title = button.getAttribute('data-name');
    const price = parseInt(button.getAttribute('data-price'));
    const img = button.getAttribute('data-img');
    
    let cart = getCart();
    const existingItem = cart.find(item => item.id === dishId);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showModal("Thành công", "Đã tăng số lượng món ăn trong giỏ hàng.", false);
    } else {
        cart.push({
            id: dishId,
            name: title,
            price: price,
            img: img,
            quantity: 1
        });
        showModal("Thành công", `Đã thêm món ${title} vào giỏ hàng!`, false);
    }
    
    saveCart(cart);
    loadCartDisplay(); // Tải lại giỏ hàng trong sidebar
}

function removeCartItem(event) {
    var buttonClicked = event.target;
    var cartBox = buttonClicked.parentElement;
    const dishId = buttonClicked.getAttribute('data-id');
    
    showModal("Xác nhận", "Bạn có chắc muốn xóa món ăn này khỏi giỏ hàng không?", true).then(confirmed => {
        if (confirmed) {
            let cart = getCart();
            cart = cart.filter(item => item.id !== dishId);
            saveCart(cart);
            cartBox.remove();
        }
    });
}

function quantityChanged(event) {
    var input = event.target;
    let quantity = parseInt(input.value);
    
    if (isNaN(quantity) || quantity <= 0) {
        quantity = 1;
        input.value = 1;
    }
    
    const dishId = input.getAttribute('data-id');
    let cart = getCart();
    
    const itemIndex = cart.findIndex(item => item.id === dishId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity = quantity;
        saveCart(cart);
    }
}

// UPDATE TOTAL
function updatetotal() {
    const cart = getCart();
    let total = 0;
    
    cart.forEach(item => {
        total += item.price * item.quantity;
    });
    
    const formattedTotal = formatPrice(total);
    const totalPriceElement = document.getElementsByClassName("total-price")[0];
    if (totalPriceElement) {
        totalPriceElement.innerText = formattedTotal;
    }
}

// UPDATE CART COUNT
function updateCartCount() {
    const cart = getCart();
    const cartCountElement = document.getElementById("cart-count");
    
    let totalItems = 0;
    cart.forEach(item => {
        totalItems += item.quantity;
    });

    if (cartCountElement) {
        cartCountElement.textContent = totalItems.toString();
    }
}

// **********************************************
// LOGIC FORM AUTH VÀ CHECKOUT (API)
// **********************************************
// NOTE: Logic API cho Auth và Checkout sẽ được triển khai đầy đủ khi bạn cung cấp file auth.html và checkout.html
// Hiện tại chỉ là hàm giả lập để tránh lỗi.

function setupAuthForm() {
    // Thiết lập chuyển tab giữa Đăng nhập và Đăng kí và xử lý submit
    try {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (!loginTab || !registerTab || !loginForm || !registerForm) {
            console.warn('Auth form elements not found, skipping setupAuthForm.');
            return;
        }

        const activateLogin = () => {
            // Styling đơn giản: active = nền xanh, text trắng
            loginTab.classList.add('bg-blue-500', 'text-white');
            loginTab.classList.remove('text-blue-500', 'bg-white');
            registerTab.classList.remove('bg-red-500', 'text-white');
            registerTab.classList.add('text-red-500', 'bg-white');

            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        };

        const activateRegister = () => {
            registerTab.classList.add('bg-red-500', 'text-white');
            registerTab.classList.remove('text-red-500', 'bg_white');
            loginTab.classList.remove('bg-blue-500', 'text-white');
            loginTab.classList.add('text-blue-500', 'bg-white');

            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        };

        // Khởi tạo trạng thái: Hiển thị login
        activateLogin();

        loginTab.addEventListener('click', (e) => { e.preventDefault(); activateLogin(); });
        registerTab.addEventListener('click', (e) => { e.preventDefault(); activateRegister(); });

        // Xử lý submit đăng nhập
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value;

            if (!email || !password) {
                showModal('Không hợp lệ', 'Vui lòng điền đầy đủ email và mật khẩu.');
                return;
            }

            try {
                const body = new URLSearchParams();
                body.append('email', email);
                body.append('password', password);

                const resp = await fetch(API_BASE_URL + 'login.php', {
                    method: 'POST',
                    headers: { 
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    credentials: 'include',
                    body: body
                });
                console.log('Login: response url', resp.url);

                const data = await resp.json().catch(() => ({ success: false, message: 'Phản hồi không hợp lệ từ server.' }));
                if (data.success) {
                    // Update current user state
                    currentUser = data.user;
                    await showModal('Thành công', data.message || 'Đăng nhập thành công.');
                    // Redirect based on role
                    if (data.user && data.user.role === 'admin') {
                        window.location.href = 'admin.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    showModal('Thất bại', data.message || 'Đăng nhập thất bại.');
                }
            } catch (err) {
                console.error('Login error:', err);
                showModal('Lỗi', 'Không thể kết nối tới server. Vui lòng thử lại.');
            }
        });

        // Xử lý submit đăng kí
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('register-email').value.trim();
            const fullname = document.getElementById('register-name').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm-password').value;

            if (!email || !fullname || !password || !confirm) {
                showModal('Không hợp lệ', 'Vui lòng điền đầy đủ thông tin đăng kí.');
                return;
            }
            if (password !== confirm) {
                showModal('Không hợp lệ', 'Mật khẩu và xác nhận mật khẩu không khớp.');
                return;
            }

            try {
                const body = new URLSearchParams();
                body.append('email', email);
                body.append('password', password);
                body.append('fullname', fullname);

                // Debug: log payload before sending
                console.log('Register: sending payload', { email, fullname, passwordLength: password.length });

                const resp = await fetch(API_BASE_URL + 'register.php', {
                    method: 'POST',
                    headers: { 
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    },
                    body: body
                });

                console.log('Register: response status', resp.status, resp.statusText);
                console.log('Register: response url', resp.url);

                const data = await resp.json().catch(() => ({ success: false, message: 'Phản hồi không hợp lệ từ server.' }));
                if (data.success) {
                    await showModal('Thành công', data.message || 'Đăng kí thành công.');
                    // Chuyển sang tab đăng nhập để người dùng login
                    activateLogin();
                    // Prefill email vào form login
                    document.getElementById('login-username').value = email;
                } else {
                    showModal('Thất bại', data.message || 'Đăng kí thất bại.');
                }
            } catch (err) {
                console.error('Register error:', err);
                showModal('Lỗi', 'Không thể kết nối tới server. Vui lòng thử lại.');
            }
        });

    } catch (e) {
        console.error('setupAuthForm error', e);
    }
}

function setupCheckoutForm() {
    const checkoutForm = document.getElementById('checkout-form');
    if (!checkoutForm) {
        console.warn('Checkout form not found, skipping setupCheckoutForm.');
        return;
    }

    // Check if user is logged in on checkout page
    checkAndUpdateUserSession().then(() => {
        if (!currentUser) {
            showModal('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tiếp tục thanh toán.', false).then(() => {
                window.location.href = 'auth.html';
            });
            return;
        } else {
            // Pre-fill user's name in the form
            const nameInput = document.getElementById('name');
            if (nameInput && currentUser.fullname) {
                nameInput.value = currentUser.fullname;
            }
        }
    });

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Double check user is logged in before submitting
        if (!currentUser) {
            showModal('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tiếp tục thanh toán.', false).then(() => {
                window.location.href = 'auth.html';
            });
            return;
        }

        // Lấy thông tin từ form
        const receiverName = document.getElementById('name').value.trim();
        const phoneNumber = document.getElementById('phone').value.trim();
        const areaAddress = document.getElementById('area').value;
        const detailAddress = document.getElementById('detail-address').value.trim();
        const paymentMethod = document.getElementById('payment-method').value;

        // Validate input
        if (!receiverName || !phoneNumber || !areaAddress || !detailAddress) {
            showModal('Không hợp lệ', 'Vui lòng điền đầy đủ thông tin giao hàng.');
            return;
        }

        // Lấy giỏ hàng từ localStorage
        const cart = getCart();
        if (cart.length === 0) {
            showModal('Lỗi', 'Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi đặt hàng.');
            return;
        }

        // Chuẩn bị dữ liệu đơn hàng
        const orderData = {
            receiver_name: receiverName,
            phone_number: phoneNumber,
            area_address: areaAddress,
            detail_address: detailAddress,
            payment_method: paymentMethod,
            cart_items: cart
        };

        console.log('Đang gửi đơn hàng:', orderData);

        try {
            // Gửi đơn hàng lên server
            const response = await fetch(API_BASE_URL + 'place_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(orderData)
            });

            const result = await response.json();
            
            if (result.success) {
                // Xóa giỏ hàng sau khi đặt hàng thành công
                localStorage.removeItem('neu_food_cart');
                updateCartCount();
                updatetotal();

                // Hiển thị modal thành công
                const modalSuccess = document.getElementById('modal-success');
                if (modalSuccess) {
                    modalSuccess.classList.remove('hidden');
                    modalSuccess.classList.add('flex');

                    // Xử lý nút đóng modal
                    const closeModalButton = document.getElementById('close-modal-button');
                    if (closeModalButton) {
                        closeModalButton.onclick = () => {
                            window.location.href = 'index.html';
                        };
                    }
                } else {
                    // Fallback nếu không có modal
                    await showModal('Thành công', result.message || 'Đơn hàng đã được đặt thành công!');
                    window.location.href = 'index.html';
                }
            } else {
                showModal('Lỗi', result.message || 'Không thể đặt hàng. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Lỗi khi đặt hàng:', error);
            showModal('Lỗi', 'Không thể kết nối tới server. Vui lòng thử lại.');
        }
    });
}
