// DOM Elements
const balanceElement = document.getElementById('balance');
const moneyPlusElement = document.getElementById('money-plus');
const moneyMinusElement = document.getElementById('money-minus');
const transactionsElement = document.getElementById('transactions');
const form = document.getElementById('form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const dateInput = document.getElementById('date');
const clearAllBtn = document.getElementById('clear-all');
const categoryBreakdownElement = document.getElementById('category-breakdown');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize transactions from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize charts
let expenseChart;
let pieChart;

// Initialize the application
function init() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    // Add event listeners
    form.addEventListener('submit', addTransaction);
    clearAllBtn.addEventListener('click', clearAllTransactions);
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Update UI
    updateAll();
}

// Add transaction
function addTransaction(e) {
    e.preventDefault();
    
    if (textInput.value.trim() === '' || amountInput.value.trim() === '' || categoryInput.value === '') {
        showAlert('Please fill in all fields', 'error');
        return;
    }
    
    const transaction = {
        id: generateID(),
        text: textInput.value.trim(),
        amount: +amountInput.value,
        category: categoryInput.value,
        date: dateInput.value
    };
    
    transactions.push(transaction);
    updateLocalStorage();
    updateAll();
    
    // Reset form
    form.reset();
    dateInput.value = today;
    textInput.focus();
    
    // Show success message
    showAlert('Transaction added successfully!', 'success');
}

// Show alert message
function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button class="close-alert">&times;</button>
    `;
    
    document.body.appendChild(alert);
    
    // Remove alert after 3 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
    
    // Close button
    alert.querySelector('.close-alert').addEventListener('click', () => {
        alert.remove();
    });
}

// Generate random ID
function generateID() {
    return Math.floor(Math.random() * 1000000000);
}

// Remove transaction by ID
function removeTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    updateAll();
    showAlert('Transaction deleted!', 'warning');
}

// Clear all transactions
function clearAllTransactions() {
    if (transactions.length === 0) {
        showAlert('No transactions to clear', 'info');
        return;
    }
    
    if (confirm('Are you sure you want to delete all transactions?')) {
        transactions = [];
        updateLocalStorage();
        updateAll();
        showAlert('All transactions cleared!', 'warning');
    }
}

// Switch between tabs
function switchTab(tabName) {
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        }
    });
    
    // Update charts when switching to their tab
    if (tabName === 'monthly') {
        updateChart();
    } else if (tabName === 'category') {
        updatePieChart();
    }
}

// Update local storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Update all UI elements
function updateAll() {
    updateBalance();
    updateTransactionList();
    updateChart();
    updatePieChart();
    updateCategoryBreakdown();
}

// Update balance, income and expense
function updateBalance() {
    const amounts = transactions.map(transaction => transaction.amount);
    
    const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
    const income = amounts
        .filter(item => item > 0)
        .reduce((acc, item) => (acc += item), 0)
        .toFixed(2);
    const expense = (
        amounts
            .filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0) * -1
    ).toFixed(2);
    
    balanceElement.innerText = `$${total}`;
    moneyPlusElement.innerText = `+$${income}`;
    moneyMinusElement.innerText = `-$${expense}`;
}

// Update transaction list
function updateTransactionList() {
    // Clear existing transactions
    transactionsElement.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-money-bill-wave"></i>
                <p>No transactions yet. Add one to get started!</p>
            </div>
        `;
        return;
    }
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedTransactions.forEach(transaction => {
        const sign = transaction.amount < 0 ? 'minus' : 'plus';
        const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        const categoryIcon = getCategoryIcon(transaction.category);
        
        const item = document.createElement('li');
        item.classList.add(sign);
        
        item.innerHTML = `
            <div class="transaction-details">
                <span class="transaction-text">${transaction.text}</span>
                <span class="transaction-amount">$${Math.abs(transaction.amount).toFixed(2)}</span>
                <div class="transaction-category">
                    <i class="fas fa-${categoryIcon}"></i> ${transaction.category}
                </div>
                <div class="transaction-date">${formattedDate}</div>
            </div>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        transactionsElement.appendChild(item);
    });
}

// Get icon for category
function getCategoryIcon(category) {
    const icons = {
        food: 'utensils',
        transportation: 'car',
        housing: 'home',
        entertainment: 'gamepad',
        shopping: 'shopping-bag',
        salary: 'money-check',
        freelance: 'laptop-code',
        investment: 'chart-line',
        health: 'heartbeat',
        education: 'graduation-cap',
        other: 'ellipsis-h'
    };
    return icons[category] || 'tag';
}

// Update monthly chart
function updateChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    
    // Group transactions by month
    const monthlyData = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = { income: 0, expense: 0 };
        }
        
        if (transaction.amount > 0) {
            monthlyData[monthYear].income += transaction.amount;
        } else {
            monthlyData[monthYear].expense += Math.abs(transaction.amount);
        }
    });
    
    // Sort months chronologically
    const sortedMonths = Object.keys(monthlyData).sort();
    
    const labels = sortedMonths.map(month => {
        const [year, monthNum] = month.split('-');
        return new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const incomeData = sortedMonths.map(month => monthlyData[month].income);
    const expenseData = sortedMonths.map(month => monthlyData[month].expense);
    
    // Destroy previous chart if it exists
    if (expenseChart) {
        expenseChart.destroy();
    }
    
    expenseChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#00b894',
                    borderColor: '#00b894',
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    backgroundColor: '#d63031',
                    borderColor: '#d63031',
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    title: {
                        display: true,
                        text: 'Amount ($)',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    title: {
                        display: true,
                        text: 'Month',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Income vs Expense',
                    color: 'white',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

// Update pie chart for categories
function updatePieChart() {
    const ctx = document.getElementById('pie-chart').getContext('2d');
    
    // Group expenses by category (only negative amounts)
    const categoryData = {};
    
    transactions.forEach(transaction => {
        if (transaction.amount < 0) {
            const category = transaction.category;
            if (!categoryData[category]) {
                categoryData[category] = 0;
            }
            categoryData[category] += Math.abs(transaction.amount);
        }
    });
    
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    // Generate colors for each category
    const backgroundColors = categories.map((_, index) => {
        const hue = (index * 137.508) % 360; // Golden angle for color distribution
        return `hsl(${hue}, 70%, 60%)`;
    });
    
    // Destroy previous chart if it exists
    if (pieChart) {
        pieChart.destroy();
    }
    
    if (categories.length === 0) {
        document.getElementById('pie-chart').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-pie"></i>
                <p>No expense data to display</p>
            </div>
        `;
        return;
    }
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: backgroundColors,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: 'white',
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Expense by Category',
                    color: 'white',
                    font: {
                        size: 16
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${context.label}: $${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Update category breakdown
function updateCategoryBreakdown() {
    // Clear existing breakdown
    categoryBreakdownElement.innerHTML = '';
    
    if (transactions.length === 0) {
        categoryBreakdownElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <p>No transactions to analyze</p>
            </div>
        `;
        return;
    }
    
    // Group transactions by category
    const categoryData = {};
    
    transactions.forEach(transaction => {
        const category = transaction.category;
        if (!categoryData[category]) {
            categoryData[category] = { income: 0, expense: 0 };
        }
        
        if (transaction.amount > 0) {
            categoryData[category].income += transaction.amount;
        } else {
            categoryData[category].expense += Math.abs(transaction.amount);
        }
    });
    
    // Sort categories by total amount (absolute value)
    const sortedCategories = Object.keys(categoryData).sort((a, b) => {
        const totalA = categoryData[a].income + categoryData[a].expense;
        const totalB = categoryData[b].income + categoryData[b].expense;
        return totalB - totalA;
    });
    
    // Create HTML for each category
    for (const category of sortedCategories) {
        const total = categoryData[category].income - categoryData[category].expense;
        const icon = getCategoryIcon(category);
        
        const categoryItem = document.createElement('div');
        categoryItem.classList.add('category-item');
        
        categoryItem.innerHTML = `
            <span class="category-name">
                <i class="fas fa-${icon}"></i> ${category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <span class="category-amount ${total >= 0 ? 'plus' : 'minus'}">
                $${Math.abs(total).toFixed(2)}
            </span>
        `;
        
        categoryBreakdownElement.appendChild(categoryItem);
    }
}

// Initialize the app
init();

// Add alert styles to the head
const style = document.createElement('style');
style.textContent = `
    .alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        transition: all 0.3s ease;
        transform: translateX(0);
        opacity: 1;
    }
    
    .alert-success {
        background-color: #00b894;
        border-left: 5px solid #008c6d;
    }
    
    .alert-error {
        background-color: #d63031;
        border-left: 5px solid #a31a1a;
    }
    
    .alert-warning {
        background-color: #fdcb6e;
        border-left: 5px solid #f9a825;
        color: #2d3436;
    }
    
    .alert-info {
        background-color: #0984e3;
        border-left: 5px solid #0767b1;
    }
    
    .close-alert {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.5rem;
        cursor: pointer;
        margin-left: 15px;
        line-height: 1;
    }
`;
document.head.appendChild(style);