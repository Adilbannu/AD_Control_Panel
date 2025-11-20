// =================================================================
// 0. GLOBAL APPLICATION STATE & CONFIGURATION
// =================================================================

const PORTFOLIO_CONTAINER = document.getElementById('portfolio-container');
const CONTROL_PANEL_APP = document.getElementById('control-panel-app');
const LOGIN_MODAL = document.getElementById("loginModal");

const CORRECT_USERNAME = 'admin';
const CORRECT_PASSWORD = 'password123'; // CHANGE THIS!

let isLoggedIn = false;

// =================================================================
// GOOGLE SHEETS DATABASE CONFIGURATION
// =================================================================

// ⚠️ REPLACE THIS WITH YOUR ACTUAL GOOGLE APPS SCRIPT DEPLOYMENT URL ⚠️
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbgfhNRKXI_H0OrwIkTkwhSeoft5fWbexNrWwx_lEJ94wUYv_5Dj5H2bKw7t-Qr-AN/exec';

// Initialize data
let receipts = [];
let schedules = [];
let todoItems = [];
let documents = [];

const sheets = [
    { name: "Dashboard", id: "dashboard", icon: "fas fa-tachometer-alt" },
    { name: "To-Do List", id: "todoList", icon: "fas fa-check-double" },
    { name: "Schedules & Reminders", id: "schedules", icon: "fas fa-calendar-alt" },
    { name: "Receipt Maker", id: "receiptMaker", icon: "fas fa-receipt" },
    { name: "Document Library", id: "documentLibrary", icon: "fas fa-folder-open" },
    { name: "Settings & Backup", id: "settings", icon: "fas fa-cogs" }
];

const categoryColors = {
    document: '#3498db',
    invoice: '#e67e22',
    email: '#f1c40f',
    meeting: '#9b59b6',
    deadline: '#e74c3c',
    hr: '#2ecc71',
    other: '#95a5a6'
};

// =================================================================
// 1. INITIALIZATION & LOGIN/LOGOUT LOGIC
// =================================================================

function setupLoginListeners() {
    const OPEN_LOGIN_BTN = document.getElementById("openLoginBtn");
    const CLOSE_LOGIN_BTN = document.getElementById("closeLoginBtn");
    const LOGIN_FORM = document.getElementById("loginForm");
    
    if (OPEN_LOGIN_BTN) {
        OPEN_LOGIN_BTN.onclick = openLoginModal;
    }

    if (CLOSE_LOGIN_BTN) {
        CLOSE_LOGIN_BTN.onclick = closeLoginModal;
    }

    if (LOGIN_FORM) {
        LOGIN_FORM.onsubmit = handleLogin;
    }

    window.onclick = function(event) {
        if (event.target == LOGIN_MODAL) {
            closeLoginModal();
        }
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Portfolio JS Initialization
    initializePortfolioJS();

    // Setup login/logout listeners
    setupLoginListeners();
    
    // Check login status on page load
    isLoggedIn = localStorage.getItem('docControl_loggedIn') === 'true';
    if (isLoggedIn) {
        await switchToControlPanel();
    } else {
        switchToPortfolio();
    }
    
    // Initialize Control Panel Modules
    initializeNavigation();
    initializeSearch();
    setInterval(checkReminders, 60000);
});

function switchToPortfolio() {
    if (PORTFOLIO_CONTAINER) PORTFOLIO_CONTAINER.style.display = 'block';
    if (CONTROL_PANEL_APP) CONTROL_PANEL_APP.style.display = 'none';
    localStorage.removeItem('docControl_loggedIn');
    isLoggedIn = false;
}

async function switchToControlPanel() {
    if (PORTFOLIO_CONTAINER) PORTFOLIO_CONTAINER.style.display = 'none';
    if (CONTROL_PANEL_APP) CONTROL_PANEL_APP.style.display = 'block';
    
    // Load data from storage
    await loadAllData();
    
    // Set CP styles
    document.body.style.fontFamily = "'Montserrat', sans-serif";
    document.body.style.backgroundColor = '#f8fafc';
    
    // Load default dashboard
    loadSheet('dashboard', 'Dashboard');
    typeWriter();
    localStorage.setItem('docControl_loggedIn', 'true');
    isLoggedIn = true;
    
    showNotification('Data loaded successfully!', 'success');
}

function openLoginModal() {
    if (!LOGIN_MODAL) return;
    LOGIN_MODAL.style.display = "block";
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) loginMessage.textContent = '';
    const adminUsername = document.getElementById('adminUsername');
    if (adminUsername) adminUsername.focus();
}

function closeLoginModal() {
    if (LOGIN_MODAL) LOGIN_MODAL.style.display = "none";
}

function handleLogin(e) {
    e.preventDefault();
    const loginMessage = document.getElementById('loginMessage');
    if (loginMessage) loginMessage.textContent = '';

    const usernameInput = document.getElementById('adminUsername');
    const passwordInput = document.getElementById('adminPassword');
    
    const username = usernameInput ? usernameInput.value : '';
    const password = passwordInput ? passwordInput.value : '';

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
        if (loginMessage) loginMessage.textContent = 'Login successful! Redirecting...';
        setTimeout(() => {
            closeLoginModal();
            switchToControlPanel();
            showNotification('Welcome to DocControl Pro!', 'success');
        }, 1000);
    } else {
        if (loginMessage) loginMessage.textContent = 'Invalid credentials. Please try again.';
        if (passwordInput) passwordInput.value = '';
        showNotification('Login failed. Please check your credentials.', 'error');
    }
}

function handleLogout() {
    if (confirm("Are you sure you want to log out?")) {
        switchToPortfolio();
        showNotification('Successfully logged out.', 'success');
    }
}

// =================================================================
// 2. PORTFOLIO-SPECIFIC JAVASCRIPT
// =================================================================

function initializePortfolioJS() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all fields');
                return;
            }
            alert(`Thank you, ${name}! Your message has been sent. I'll get back to you soon.`);
            contactForm.reset();
        });
    }

    // Navbar background change on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = 'white';
                navbar.style.backdropFilter = 'none';
            }
        }
    });

    // Animation on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.timeline-item, .skill-category, .education-item');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Set initial state for animated elements and listen for scroll
    const elementsToAnimate = document.querySelectorAll('.timeline-item, .skill-category, .education-item');
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Add current year to footer
    const year = new Date().getFullYear();
    const yearElement = document.querySelector('#footer p:first-child');
    if (yearElement) {
        yearElement.innerHTML = `&copy; ${year} Adil Zaman. All Rights Reserved.`;
    }
}

// =================================================================
// 3. GOOGLE SHEETS DATA STORAGE FUNCTIONS
// =================================================================

async function saveToGoogleSheets(data, sheetName) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save',
                sheet: sheetName,
                data: data
            })
        });
        
        const result = await response.json();
        if (result.success) {
            console.log(`Data saved to ${sheetName}`);
            return true;
        } else {
            console.error('Error saving data:', result.error);
            return false;
        }
    } catch (error) {
        console.error('Network error:', error);
        // Fallback to localStorage
        saveToLocalStorage();
        return false;
    }
}

async function loadFromGoogleSheets(sheetName) {
    try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=load&sheet=${sheetName}`);
        const result = await response.json();
        
        if (result.success && result.data) {
            return result.data;
        } else {
            console.log(`No data found in ${sheetName}, using localStorage`);
            return loadFromLocalStorage(sheetName);
        }
    } catch (error) {
        console.error('Error loading from Google Sheets:', error);
        return loadFromLocalStorage(sheetName);
    }
}

function loadFromLocalStorage(sheetName) {
    switch(sheetName) {
        case 'receipts': return JSON.parse(localStorage.getItem('docControl_receipts') || '[]');
        case 'schedules': return JSON.parse(localStorage.getItem('docControl_schedules') || '[]');
        case 'todos': return JSON.parse(localStorage.getItem('docControl_todos') || '[]');
        case 'documents': return JSON.parse(localStorage.getItem('docControl_documents') || '[]');
        default: return [];
    }
}

function saveToLocalStorage() {
    localStorage.setItem('docControl_schedules', JSON.stringify(schedules));
    localStorage.setItem('docControl_todos', JSON.stringify(todoItems));
    localStorage.setItem('docControl_receipts', JSON.stringify(receipts));
    localStorage.setItem('docControl_documents', JSON.stringify(documents));
}

// Enhanced save function that tries Google Sheets first, then localStorage
async function saveData() {
    // Save to Google Sheets
    const receiptsSaved = await saveToGoogleSheets(receipts, 'receipts');
    const schedulesSaved = await saveToGoogleSheets(schedules, 'schedules');
    const todosSaved = await saveToGoogleSheets(todoItems, 'todos');
    const documentsSaved = await saveToGoogleSheets(documents, 'documents');
    
    // Always save to localStorage as backup
    saveToLocalStorage();
    
    return receiptsSaved && schedulesSaved && todosSaved && documentsSaved;
}

// Enhanced load function
async function loadAllData() {
    receipts = await loadFromGoogleSheets('receipts');
    schedules = await loadFromGoogleSheets('schedules');
    todoItems = await loadFromGoogleSheets('todos');
    documents = await loadFromGoogleSheets('documents');
}

// =================================================================
// 4. CONTROL PANEL MODULES
// =================================================================

function initializeNavigation() {
    const sheetList = document.getElementById('sheetList');
    if (!sheetList) return; 

    sheetList.innerHTML = ''; 
    sheets.forEach(sheet => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = "#";
        link.id = sheet.id;
        link.innerHTML = `<i class="${sheet.icon}"></i> ${sheet.name}`;
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add click feedback
            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = 'scale(1)';
            }, 150);
            
            loadSheet(sheet.id, sheet.name);
        });
        
        listItem.appendChild(link);
        sheetList.appendChild(listItem);
    });
    
    // Set dashboard as active by default
    const dashboardLink = document.getElementById('dashboard');
    if (dashboardLink) {
        dashboardLink.classList.add('active');
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('globalSearch');
    if (!searchInput) return;

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        if (searchTerm.length > 2) {
            performGlobalSearch(searchTerm);
        } else if (searchTerm.length === 0) {
            loadSheet('dashboard', 'Dashboard'); 
        }
    });
}

function loadSheet(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    if (!container) return;

    // Add fade out effect
    container.style.opacity = '0';
    container.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        // Update active navigation
        document.querySelectorAll('.sidebar li a').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.getElementById(sheetId);
        if (activeLink) activeLink.classList.add('active');
        
        // Show/hide main title header
        const mainHeader = document.getElementById('mainTitleHeader');
        if (mainHeader) {
            mainHeader.style.display = (sheetId === 'dashboard') ? 'flex' : 'none';
        }
        
        // Load appropriate content
        switch(sheetId) {
            case 'dashboard':
                container.innerHTML = renderDashboard();
                break;
            case 'todoList':
                container.innerHTML = renderTodoList();
                break;
            case 'schedules':
                container.innerHTML = renderSchedulesPage();
                setTimeout(() => {
                    const calendarContainer = document.getElementById('calendarContainer');
                    if(calendarContainer) calendarContainer.innerHTML = renderMonthCalendar();
                    const remindersList = document.getElementById('upcomingRemindersList');
                    if(remindersList) remindersList.innerHTML = renderUpcomingReminders();
                }, 50);
                break;
            case 'receiptMaker':
                container.innerHTML = renderReceiptMaker();
                break;
            case 'documentLibrary':
                container.innerHTML = renderDocumentLibrary();
                break;
            case 'settings':
                container.innerHTML = renderSettings();
                break;
            default:
                container.innerHTML = `<div class="page-header"><h2>Module Under Development</h2></div>`;
        }
        
        // Add fade in effect
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 50);
        
    }, 200);
}

function renderDashboard() {
    const pendingTasks = todoItems.filter(t => !t.completed).length;
    const todayReminders = getTodayRemindersCount();
    const totalDocuments = documents.length;
    const totalReceipts = receipts.length;
    
    return `
        <div class="dashboard">
            <div class="page-header">
                <h2>📊 Dashboard</h2>
                <p>Welcome to your Document Control Center</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #3498db;">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${pendingTasks}</h3>
                        <p>Pending Tasks</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #e74c3c;">
                        <i class="fas fa-calendar-times"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${todayReminders}</h3>
                        <p>Today's Reminders</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #27ae60;">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalDocuments}</h3>
                        <p>Documents</p>
                    </div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-icon" style="background: #f39c12;">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${totalReceipts}</h3>
                        <p>Receipts Generated</p>
                    </div>
                </div>
            </div>

            <div class="recent-activities">
                <h3>Recent Activities</h3>
                <div class="activities-list">
                    ${getRecentActivities()}
                </div>
            </div>
        </div>
    `;
}

function getRecentActivities() {
    const recentSchedules = schedules
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentSchedules.length === 0) {
        return '<p class="no-activities">No recent activities</p>';
    }
    
    return recentSchedules.map(schedule => `
        <div class="activity-item ${schedule.completed ? 'completed' : 'pending'}">
            <div class="activity-icon">
                <i class="fas fa-${schedule.completed ? 'check-circle' : 'clock'}"></i>
            </div>
            <div class="activity-details">
                <strong>${schedule.title}</strong>
                <span>${formatDateTime(schedule.date, schedule.time)} • ${schedule.category}</span>
            </div>
        </div>
    `).join('');
}

function renderTodoList() {
    return `
        <div class="todo-page">
            <div class="page-header">
                <h2>✅ To-Do List</h2>
                <button onclick="showNewTodoForm()" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>
            
            <div class="todo-list-container">
                ${todoItems.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No tasks yet</h3>
                        <p>Start by adding your first task!</p>
                    </div>
                ` : renderTodoItems()}
            </div>
        </div>
    `;
}

function renderTodoItems() {
    const sortedItems = [...todoItems].sort((a, b) => {
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        return new Date(b.createdAt) - new Date(a.createdAt);
    });
    
    return sortedItems.map(item => `
        <div class="todo-item ${item.completed ? 'completed' : 'pending'} priority-${item.priority || 'medium'}">
            <div class="todo-checkbox" onclick="toggleTodoStatus('${item.id}')">
                ${item.completed 
                    ? '<i class="fas fa-check-circle"></i>' 
                    : '<i class="far fa-circle"></i>'}
            </div>
            <span class="todo-text">${item.text}</span>
            <span class="todo-priority">${item.priority || 'Medium'}</span>
            <div class="todo-actions">
                <button onclick="editTodo('${item.id}')" class="btn-icon" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTodo('${item.id}')" class="btn-icon" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function showNewTodoForm() {
    const taskText = prompt('Enter your new task:');
    if (taskText && taskText.trim()) {
        const newTodo = {
            id: generateId(),
            text: taskText.trim(),
            completed: false,
            priority: 'medium',
            createdAt: new Date().toISOString()
        };
        todoItems.push(newTodo);
        saveData();
        loadSheet('todoList', 'To-Do List');
        showNotification('Task added successfully!', 'success');
    }
}

function toggleTodoStatus(id) {
    const todo = todoItems.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveData();
        loadSheet('todoList', 'To-Do List');
        showNotification(`Task ${todo.completed ? 'completed' : 'marked as pending'}`, 'success');
    }
}

function editTodo(id) {
    const todo = todoItems.find(t => t.id === id);
    if (todo) {
        const newText = prompt('Edit your task:', todo.text);
        if (newText && newText.trim()) {
            todo.text = newText.trim();
            saveData();
            loadSheet('todoList', 'To-Do List');
            showNotification('Task updated successfully!', 'success');
        }
    }
}

function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todoItems = todoItems.filter(t => t.id !== id);
        saveData();
        loadSheet('todoList', 'To-Do List');
        showNotification('Task deleted successfully', 'success');
    }
}

// =================================================================
// 5. RECEIPT SYSTEM WITH STORAGE
// =================================================================

function renderReceiptMaker() {
    return `
        <div class="receipt-maker">
            <div class="page-header">
                <h2>🧾 Receipt Maker</h2>
                <div class="header-actions">
                    <button onclick="showAllReceipts()" class="btn-secondary">
                        <i class="fas fa-list"></i> View All Receipts
                    </button>
                    <button onclick="generatePDF()" class="btn-primary">
                        <i class="fas fa-download"></i> Generate PDF
                    </button>
                </div>
            </div>

            <div class="receipt-form-container">
                <form id="receiptForm">
                    <div class="form-section">
                        <h3>Company Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="receiptCompany">Company Name:</label>
                                <input type="text" id="receiptCompany" value="Al Shirawi Group" required>
                            </div>
                            <div class="form-group">
                                <label for="receiptAddress">Company Address:</label>
                                <input type="text" id="receiptAddress" value="Dubai, UAE" required>
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Client Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="receiptClient">Client Name:</label>
                                <input type="text" id="receiptClient" placeholder="Enter client name" required>
                            </div>
                            <div class="form-group">
                                <label for="receiptClientAddress">Client Address:</label>
                                <input type="text" id="receiptClientAddress" placeholder="Client address">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Receipt Details</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="receiptNumber">Receipt #:</label>
                                <input type="text" id="receiptNumber" value="RC-${Date.now().toString().slice(-6)}" required>
                            </div>
                            <div class="form-group">
                                <label for="receiptDate">Date:</label>
                                <input type="date" id="receiptDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="receiptAmount">Amount (AED):</label>
                                <input type="number" id="receiptAmount" placeholder="0.00" step="0.01" required>
                            </div>
                            <div class="form-group">
                                <label for="receiptPaymentMethod">Payment Method:</label>
                                <select id="receiptPaymentMethod" required>
                                    <option value="cash">Cash</option>
                                    <option value="bank_transfer">Bank Transfer</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="card">Credit/Debit Card</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="receiptDescription">Description:</label>
                            <textarea id="receiptDescription" placeholder="Payment description..." rows="3" required></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" onclick="createReceipt()" class="btn-primary">
                            <i class="fas fa-receipt"></i> Create & Save Receipt
                        </button>
                        <button type="button" onclick="clearReceiptForm()" class="btn-secondary">
                            <i class="fas fa-times"></i> Clear Form
                        </button>
                    </div>
                </form>

                <div class="receipt-preview">
                    <h3>Live Preview</h3>
                    <div id="receiptPreview" class="receipt-template printable">
                        <div class="receipt-header">
                            <h3 id="previewCompany">Al Shirawi Group</h3>
                            <p id="previewAddress">Dubai, UAE</p>
                            <h2>OFFICIAL RECEIPT</h2>
                        </div>
                        
                        <div class="receipt-body">
                            <div class="receipt-details">
                                <div class="detail-row">
                                    <span class="label">Receipt #:</span>
                                    <span id="previewNumber">RC-${Date.now().toString().slice(-6)}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Date:</span>
                                    <span id="previewDate">${new Date().toLocaleDateString()}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Client:</span>
                                    <span id="previewClient">Client Name</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Address:</span>
                                    <span id="previewClientAddress">Client address</span>
                                </div>
                            </div>
                            
                            <div class="amount-section">
                                <div class="amount-row large">
                                    <span class="label">Amount Received:</span>
                                    <span id="previewAmount" class="amount">0.00 AED</span>
                                </div>
                                <div class="amount-row">
                                    <span class="label">Payment Method:</span>
                                    <span id="previewPaymentMethod">Cash</span>
                                </div>
                            </div>
                            
                            <div class="description-section">
                                <p><strong>Description:</strong></p>
                                <p id="previewDescription">Payment description</p>
                            </div>
                        </div>
                        
                        <div class="receipt-footer">
                            <div class="signature-section">
                                <div class="signature-line"></div>
                                <p>Authorized Signature</p>
                            </div>
                            <p class="thank-you">Thank you for your business!</p>
                        </div>
                    </div>
                    
                    <div class="preview-actions">
                        <button onclick="printReceipt()" class="btn-primary">
                            <i class="fas fa-print"></i> Print Receipt
                        </button>
                        <button onclick="downloadReceiptPDF()" class="btn-secondary">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function createReceipt() {
    const receipt = {
        id: generateId(),
        company: document.getElementById('receiptCompany').value,
        address: document.getElementById('receiptAddress').value,
        client: document.getElementById('receiptClient').value,
        clientAddress: document.getElementById('receiptClientAddress').value,
        receiptNumber: document.getElementById('receiptNumber').value,
        date: document.getElementById('receiptDate').value,
        amount: parseFloat(document.getElementById('receiptAmount').value),
        paymentMethod: document.getElementById('receiptPaymentMethod').value,
        description: document.getElementById('receiptDescription').value,
        createdAt: new Date().toISOString()
    };

    // Add to receipts array
    receipts.push(receipt);
    
    // Save to storage
    const saved = await saveData();
    
    if (saved) {
        showNotification('Receipt created and saved successfully!', 'success');
        updateReceiptPreview(receipt);
    } else {
        showNotification('Receipt created but saved locally only', 'info');
    }
}

function updateReceiptPreview(receipt) {
    document.getElementById('previewCompany').textContent = receipt.company;
    document.getElementById('previewAddress').textContent = receipt.address;
    document.getElementById('previewClient').textContent = receipt.client;
    document.getElementById('previewClientAddress').textContent = receipt.clientAddress;
    document.getElementById('previewNumber').textContent = receipt.receiptNumber;
    document.getElementById('previewDate').textContent = new Date(receipt.date).toLocaleDateString();
    document.getElementById('previewAmount').textContent = `${receipt.amount.toFixed(2)} AED`;
    document.getElementById('previewPaymentMethod').textContent = receipt.paymentMethod.charAt(0).toUpperCase() + receipt.paymentMethod.slice(1).replace('_', ' ');
    document.getElementById('previewDescription').textContent = receipt.description;
}

function showAllReceipts() {
    const container = document.getElementById('dataContainer');
    container.innerHTML = `
        <div class="receipts-list-page">
            <div class="page-header">
                <h2>📋 All Receipts</h2>
                <button onclick="loadSheet('receiptMaker', 'Receipt Maker')" class="btn-primary">
                    <i class="fas fa-plus"></i> Create New Receipt
                </button>
            </div>
            
            <div class="receipts-stats">
                <div class="stat-card">
                    <div class="stat-icon" style="background: #27ae60;">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${receipts.length}</h3>
                        <p>Total Receipts</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background: #3498db;">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-info">
                        <h3>${calculateTotalAmount()} AED</h3>
                        <p>Total Amount</p>
                    </div>
                </div>
            </div>
            
            <div class="receipts-table-container">
                <table class="receipts-table">
                    <thead>
                        <tr>
                            <th>Receipt #</th>
                            <th>Date</th>
                            <th>Client</th>
                            <th>Amount (AED)</th>
                            <th>Payment Method</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderReceiptsTable()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderReceiptsTable() {
    if (receipts.length === 0) {
        return `<tr><td colspan="6" class="no-data">No receipts found. <a href="#" onclick="loadSheet('receiptMaker', 'Receipt Maker')">Create your first receipt</a></td></tr>`;
    }
    
    return receipts.map(receipt => `
        <tr>
            <td><strong>${receipt.receiptNumber}</strong></td>
            <td>${new Date(receipt.date).toLocaleDateString()}</td>
            <td>${receipt.client}</td>
            <td class="amount">${receipt.amount.toFixed(2)} AED</td>
            <td><span class="payment-badge ${receipt.paymentMethod}">${receipt.paymentMethod.charAt(0).toUpperCase() + receipt.paymentMethod.slice(1).replace('_', ' ')}</span></td>
            <td class="actions">
                <button onclick="viewReceipt('${receipt.id}')" class="btn-icon" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="printReceiptById('${receipt.id}')" class="btn-icon" title="Print">
                    <i class="fas fa-print"></i>
                </button>
                <button onclick="deleteReceipt('${receipt.id}')" class="btn-icon" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function calculateTotalAmount() {
    return receipts.reduce((total, receipt) => total + receipt.amount, 0).toFixed(2);
}

function viewReceipt(id) {
    const receipt = receipts.find(r => r.id === id);
    if (receipt) {
        const container = document.getElementById('dataContainer');
        container.innerHTML = `
            <div class="receipt-detail-page">
                <div class="page-header">
                    <h2>🧾 Receipt Details</h2>
                    <div class="header-actions">
                        <button onclick="showAllReceipts()" class="btn-secondary">
                            <i class="fas fa-arrow-left"></i> Back to List
                        </button>
                        <button onclick="printReceiptById('${receipt.id}')" class="btn-primary">
                            <i class="fas fa-print"></i> Print Receipt
                        </button>
                    </div>
                </div>
                
                <div class="receipt-detail-container">
                    <div class="receipt-template printable detailed">
                        <div class="receipt-header">
                            <h3>${receipt.company}</h3>
                            <p>${receipt.address}</p>
                            <h2>OFFICIAL RECEIPT</h2>
                        </div>
                        
                        <div class="receipt-body">
                            <div class="receipt-details">
                                <div class="detail-row">
                                    <span class="label">Receipt #:</span>
                                    <span>${receipt.receiptNumber}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Date:</span>
                                    <span>${new Date(receipt.date).toLocaleDateString()}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Client:</span>
                                    <span>${receipt.client}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Address:</span>
                                    <span>${receipt.clientAddress}</span>
                                </div>
                            </div>
                            
                            <div class="amount-section">
                                <div class="amount-row large">
                                    <span class="label">Amount Received:</span>
                                    <span class="amount">${receipt.amount.toFixed(2)} AED</span>
                                </div>
                                <div class="amount-row">
                                    <span class="label">Payment Method:</span>
                                    <span>${receipt.paymentMethod.charAt(0).toUpperCase() + receipt.paymentMethod.slice(1).replace('_', ' ')}</span>
                                </div>
                            </div>
                            
                            <div class="description-section">
                                <p><strong>Description:</strong></p>
                                <p>${receipt.description}</p>
                            </div>
                        </div>
                        
                        <div class="receipt-footer">
                            <div class="signature-section">
                                <div class="signature-line"></div>
                                <p>Authorized Signature</p>
                            </div>
                            <p class="thank-you">Thank you for your business!</p>
                            <p class="print-date">Printed on: ${new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function printReceipt() {
    const receiptElement = document.getElementById('receiptPreview');
    if (receiptElement) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Receipt</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .receipt-template { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
                    .receipt-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .receipt-header h3 { margin: 0; font-size: 24px; }
                    .receipt-header h2 { margin: 10px 0; font-size: 28px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .amount-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .amount-row.large { font-size: 18px; font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
                    .description-section { margin: 20px 0; padding: 15px; background: #f9f9f9; }
                    .signature-line { border-top: 1px solid #000; width: 200px; margin: 40px 0 10px 0; }
                    .thank-you { text-align: center; font-style: italic; margin-top: 20px; }
                    @media print { body { margin: 0; } }
                </style>
            </head>
            <body>
                ${receiptElement.innerHTML}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

function printReceiptById(id) {
    const receipt = receipts.find(r => r.id === id);
    if (receipt) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt ${receipt.receiptNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .receipt-template { border: 2px solid #000; padding: 20px; max-width: 600px; margin: 0 auto; }
                    .receipt-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                    .receipt-header h3 { margin: 0; font-size: 24px; }
                    .receipt-header h2 { margin: 10px 0; font-size: 28px; }
                    .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .amount-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                    .amount-row.large { font-size: 18px; font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
                    .description-section { margin: 20px 0; padding: 15px; background: #f9f9f9; }
                    .signature-line { border-top: 1px solid #000; width: 200px; margin: 40px 0 10px 0; }
                    .thank-you { text-align: center; font-style: italic; margin-top: 20px; }
                    .print-date { text-align: center; font-size: 12px; color: #666; }
                    @media print { 
                        body { margin: 0; }
                        .print-date { display: block; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-template">
                    <div class="receipt-header">
                        <h3>${receipt.company}</h3>
                        <p>${receipt.address}</p>
                        <h2>OFFICIAL RECEIPT</h2>
                    </div>
                    
                    <div class="receipt-body">
                        <div class="receipt-details">
                            <div class="detail-row">
                                <span class="label">Receipt #:</span>
                                <span>${receipt.receiptNumber}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Date:</span>
                                <span>${new Date(receipt.date).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Client:</span>
                                <span>${receipt.client}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Address:</span>
                                <span>${receipt.clientAddress}</span>
                            </div>
                        </div>
                        
                        <div class="amount-section">
                            <div class="amount-row large">
                                <span class="label">Amount Received:</span>
                                <span class="amount">${receipt.amount.toFixed(2)} AED</span>
                            </div>
                            <div class="amount-row">
                                <span class="label">Payment Method:</span>
                                <span>${receipt.paymentMethod.charAt(0).toUpperCase() + receipt.paymentMethod.slice(1).replace('_', ' ')}</span>
                            </div>
                        </div>
                        
                        <div class="description-section">
                            <p><strong>Description:</strong></p>
                            <p>${receipt.description}</p>
                        </div>
                    </div>
                    
                    <div class="receipt-footer">
                        <div class="signature-section">
                            <div class="signature-line"></div>
                            <p>Authorized Signature</p>
                        </div>
                        <p class="thank-you">Thank you for your business!</p>
                        <p class="print-date">Printed on: ${new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

function clearReceiptForm() {
    document.getElementById('receiptForm').reset();
    document.getElementById('receiptNumber').value = `RC-${Date.now().toString().slice(-6)}`;
    document.getElementById('receiptDate').value = new Date().toISOString().split('T')[0];
    
    // Reset preview
    updateReceiptPreview({
        company: 'Al Shirawi Group',
        address: 'Dubai, UAE',
        client: 'Client Name',
        clientAddress: 'Client address',
        receiptNumber: `RC-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        paymentMethod: 'cash',
        description: 'Payment description'
    });
}

async function deleteReceipt(id) {
    if (confirm('Are you sure you want to delete this receipt?')) {
        receipts = receipts.filter(r => r.id !== id);
        await saveData();
        showAllReceipts();
        showNotification('Receipt deleted successfully', 'success');
    }
}

function downloadReceiptPDF() {
    showNotification('PDF download would be implemented with a library like jsPDF', 'info');
}

// =================================================================
// 6. UTILITY FUNCTIONS
// =================================================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDateTime(date, time) {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCurrentMonth() {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getTodayRemindersCount() {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(s => s.date === today && !s.completed).length;
}

function getOverdueCount() {
    const today = new Date().toISOString().split('T')[0];
    return schedules.filter(s => s.date < today && !s.completed).length;
}

function getCompletedCount() {
    return schedules.filter(s => s.completed).length;
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function typeWriter() {
    const textElement = document.getElementById('typewriterText');
    if (!textElement) return;

    const textToType = "DocControl Pro - Professional Toolkit";
    let charIndex = 0;
    
    textElement.textContent = ''; 

    function type() {
        if (charIndex < textToType.length) {
            textElement.textContent += textToType.charAt(charIndex);
            charIndex++;
            setTimeout(type, 100);
        }
    }
    type();
}

// Add other necessary functions for schedules, documents, etc.
function renderSchedulesPage() {
    return `
        <div class="schedules-page">
            <div class="page-header">
                <h2>🗓️ Schedules & Reminders</h2>
                <button onclick="openScheduleModal()" class="btn-primary">
                    <i class="fas fa-plus"></i> Add Schedule
                </button>
            </div>
            <div class="empty-state">
                <i class="fas fa-calendar-alt"></i>
                <h3>Schedule System</h3>
                <p>Schedule management will be implemented here</p>
            </div>
        </div>
    `;
}

function renderDocumentLibrary() {
    return `
        <div class="document-library">
            <div class="page-header">
                <h2>📁 Document Library</h2>
                <button onclick="showUploadDocumentForm()" class="btn-primary">
                    <i class="fas fa-upload"></i> Upload Document
                </button>
            </div>
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Document Library</h3>
                <p>Document management will be implemented here</p>
            </div>
        </div>
    `;
}

function renderSettings() {
    return `
        <div class="settings-page">
            <div class="page-header">
                <h2>⚙️ Settings & Backup</h2>
            </div>
            <div class="empty-state">
                <i class="fas fa-cogs"></i>
                <h3>Settings</h3>
                <p>System settings and backup options</p>
            </div>
        </div>
    `;
}

function performGlobalSearch(searchTerm) {
    showNotification(`Search for: ${searchTerm}`, 'info');
}

function checkReminders() {
    // Reminder checking logic
}

function openScheduleModal() {
    showNotification('Schedule modal would open here', 'info');
}

function closeScheduleModal() {
    // Close schedule modal
}

function showUploadDocumentForm() {
    showNotification('Document upload form would appear here', 'info');
}

// Calendar functions
function renderMonthCalendar() {
    return `<div class="empty-state"><p>Calendar view will be implemented here</p></div>`;
}

function renderUpcomingReminders() {
    return `<p class="no-reminders">No upcoming reminders</p>`;
}
