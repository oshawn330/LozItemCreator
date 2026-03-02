// Equipment Tracker - Main Script

// Load items from localStorage on page load
window.addEventListener('DOMContentLoaded', loadItems);

// Handle form submission
document.getElementById('itemForm').addEventListener('submit', addItem);

// Get or initialize inventory from localStorage
function getInventory() {
    const saved = localStorage.getItem('equipment-inventory');
    return saved ? JSON.parse(saved) : { weapon: [], armor: [], helmet: [], shield: [] };
}

// Save inventory to localStorage
function saveInventory(inventory) {
    localStorage.setItem('equipment-inventory', JSON.stringify(inventory));
}

// Add a new item
function addItem(e) {
    e.preventDefault();

    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const description = document.getElementById('itemDescription').value;
    const quantity = parseInt(document.getElementById('itemQuantity').value) || 1;

    if (!name || !category) return;

    const inventory = getInventory();
    
    // Check if item already exists
    const existingItem = inventory[category].find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        inventory[category].push({
            id: Date.now(),
            name,
            description,
            quantity,
            dateAdded: new Date().toLocaleDateString()
        });
    }

    saveInventory(inventory);
    
    // Clear form
    document.getElementById('itemForm').reset();
    
    // Reload display
    loadItems();
}

// Load and display items
function loadItems() {
    const inventory = getInventory();
    
    const categories = ['weapon', 'armor', 'helmet', 'shield'];
    
    categories.forEach(category => {
        const container = document.getElementById(category);
        const items = inventory[category];
        
        if (items.length === 0) {
            container.innerHTML = '<div class="empty-message">No items yet</div>';
            return;
        }
        
        container.innerHTML = items.map(item => `
            <div class="item">
                <div class="item-name">${escapeHtml(item.name)}</div>
                ${item.description ? `<div class="item-description">${escapeHtml(item.description)}</div>` : ''}
                <div class="item-quantity">Quantity: ${item.quantity}</div>
                <div class="item-actions">
                    <button onclick="increaseQuantity('${category}', ${item.id})">+ Add</button>
                    <button onclick="decreaseQuantity('${category}', ${item.id})">- Remove</button>
                    <button class="delete-btn" onclick="deleteItem('${category}', ${item.id})">Delete</button>
                </div>
            </div>
        `).join('');
    });
}

// Increase quantity
function increaseQuantity(category, id) {
    const inventory = getInventory();
    const item = inventory[category].find(i => i.id === id);
    if (item) {
        item.quantity++;
        saveInventory(inventory);
        loadItems();
    }
}

// Decrease quantity
function decreaseQuantity(category, id) {
    const inventory = getInventory();
    const item = inventory[category].find(i => i.id === id);
    if (item && item.quantity > 1) {
        item.quantity--;
        saveInventory(inventory);
        loadItems();
    }
}

// Delete item
function deleteItem(category, id) {
    if (confirm('Are you sure you want to delete this item?')) {
        const inventory = getInventory();
        inventory[category] = inventory[category].filter(i => i.id !== id);
        saveInventory(inventory);
        loadItems();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}