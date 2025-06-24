// Shopping Cart functionality
class ShoppingCart {
    constructor() {
        this.items = [];
        this.total = 0;
        this.init();
    }

    init() {
        this.loadCart();
        this.updateCartDisplay();
        this.addEventListeners();
    }

    addItem(name, price, image) {
        const existingItem = this.items.find(item => item.name === name);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        
        this.updateTotal();
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Item added to cart!');
    }

    removeItem(name) {
        this.items = this.items.filter(item => item.name !== name);
        this.updateTotal();
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Item removed from cart!');
    }

    updateQuantity(name, newQuantity) {
        const item = this.items.find(item => item.name === name);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(name);
            } else {
                item.quantity = newQuantity;
                this.updateTotal();
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    clearCart() {
        this.items = [];
        this.total = 0;
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('Cart cleared!');
    }

    updateTotal() {
        this.total = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    loadCart() {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.items = JSON.parse(savedCart);
            this.updateTotal();
        }
    }

    updateCartDisplay() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');
        
        if (cartContainer) {
            cartContainer.innerHTML = '';
            
            if (this.items.length === 0) {
                cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            } else {
                this.items.forEach(item => {
                    const itemElement = this.createCartItemElement(item);
                    cartContainer.appendChild(itemElement);
                });
            }
        }
        
        if (cartTotal) {
            cartTotal.textContent = `$${this.total.toFixed(2)}`;
        }
        
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'block' : 'none';
        }
    }

    createCartItemElement(item) {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        itemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <button class="quantity-btn quantity-minus" data-name="${item.name}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn quantity-plus" data-name="${item.name}">+</button>
                </div>
            </div>
            <button class="remove-btn" data-name="${item.name}">×</button>
        `;
        return itemDiv;
    }

    addEventListeners() {
        // Main document click listener for delegation
        document.addEventListener('click', (e) => {
            const target = e.target;

            // Add to cart buttons
            if (target.matches('.add-to-cart')) {
                const name = target.dataset.name;
                const price = parseFloat(target.dataset.price);
                const image = target.dataset.image;
                this.addItem(name, price, image);
            }

            // Cart toggle
            const cartToggle = document.getElementById('cart-toggle');
            if (cartToggle && cartToggle.contains(target)) {
                document.getElementById('cart-sidebar').classList.toggle('active');
            }

            // Close cart when clicking outside
            const cartSidebar = document.getElementById('cart-sidebar');
            if (cartSidebar && cartSidebar.classList.contains('active') && !cartSidebar.contains(target) && !cartToggle.contains(target)) {
                cartSidebar.classList.remove('active');
            }

            // --- In-Cart Buttons ---
            const cartItem = target.closest('.cart-item');
            if (cartItem) {
                const itemName = target.dataset.name;

                // Quantity Plus
                if(target.matches('.quantity-plus')) {
                    e.stopPropagation();
                    const item = this.items.find(i => i.name === itemName);
                    if (item) this.updateQuantity(itemName, item.quantity + 1);
                }

                // Quantity Minus
                if(target.matches('.quantity-minus')) {
                    e.stopPropagation();
                    const item = this.items.find(i => i.name === itemName);
                    if (item) this.updateQuantity(itemName, item.quantity - 1);
                }

                // Remove Button
                if(target.matches('.remove-btn')) {
                    e.stopPropagation();
                    this.removeItem(itemName);
                }
            }
        });

        // Checkout Modal events
        const checkoutBtn = document.getElementById('checkout-btn');
        const closeModalBtn = document.querySelector('.close-modal');
        const checkoutModal = document.getElementById('checkout-modal');
        const confirmCheckoutBtn = document.getElementById('confirm-checkout-btn');

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => this.showCheckoutModal());
        }
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.hideCheckoutModal());
        }
        if (confirmCheckoutBtn) {
            confirmCheckoutBtn.addEventListener('click', () => {
                this.showNotification('Your order has been confirmed!');
                this.hideCheckoutModal();
                this.clearCart();
            });
        }
        window.addEventListener('click', (event) => {
            if (event.target === checkoutModal) {
                this.hideCheckoutModal();
            }
        });
    }

    showCheckoutModal() {
        if (this.items.length === 0) {
            this.showNotification('Your cart is empty!');
            return;
        }

        const summaryContainer = document.getElementById('modal-order-summary');
        const modalTotalPrice = document.getElementById('modal-total-price');
        const checkoutModal = document.getElementById('checkout-modal');
        
        summaryContainer.innerHTML = '';
        this.items.forEach(item => {
            const itemElement = document.createElement('p');
            itemElement.textContent = `${item.name} x ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
            summaryContainer.appendChild(itemElement);
        });
        modalTotalPrice.textContent = `$${this.total.toFixed(2)}`;

        if(checkoutModal) checkoutModal.style.display = 'block';
    }

    hideCheckoutModal() {
        const checkoutModal = document.getElementById('checkout-modal');
        if(checkoutModal) checkoutModal.style.display = 'none';
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 2000);
    }
}

// Initialize cart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
}); 