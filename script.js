// =================================================================
// ENHANCED PORTFOLIO & CONTROL PANEL JAVASCRIPT - FIXED VERSION
// =================================================================

// Global Variables
const PORTFOLIO_CONTAINER = document.getElementById('portfolio-container');
const CONTROL_PANEL_APP = document.getElementById('control-panel-app');
const LOGIN_MODAL = document.getElementById("loginModal");
const LOADING_SCREEN = document.getElementById("loadingScreen");
const BACK_TO_TOP_BTN = document.getElementById("backToTop");
const THEME_TOGGLE = document.getElementById("themeToggle");

let OPEN_LOGIN_BTN;
let CLOSE_LOGIN_BTN;

const CORRECT_USERNAME = 'admin';
const CORRECT_PASSWORD = 'password123'; 

let isLoggedIn = false;
let currentTheme = 'light';

// Navigation
const sheets = [
    { name: "Dashboard", id: "dashboard", icon: "fas fa-tachometer-alt" },
    { name: "To-Do List", id: "todoList", icon: "fas fa-check-double" },
    { name: "Schedules & Reminders", id: "schedules", icon: "fas fa-calendar-alt" },
    { name: "Document Library", id: "documentLibrary", icon: "fas fa-folder-open" },
    { name: "Settings & Backup", id: "settings", icon: "fas fa-cogs" }
];

// Local data stores
let schedules = [];
let todoItems = [];
let documents = [];

// Connecting Dots Animation Variables
let dots = [];
let canvas, ctx;
let mouseX = 0, mouseY = 0;
let isMouseInHeader = false;

// =================================================================
// 1. INITIALIZATION - FIXED VERSION
// =================================================================

document.addEventListener('DOMContentLoaded', function() {
    // First, hide the loading screen immediately
    hideLoadingScreen();
    
    // Then initialize everything else
    initializePortfolio();
    setupLoginListeners();
    initializeTheme();
    
    isLoggedIn = localStorage.getItem('docControl_loggedIn') === 'true';
    if (isLoggedIn) {
        switchToControlPanel();
    }
    
    initializeNavigation();
    initializeSearch();
});

function initializePortfolio() {
    initializePortfolioJS();
    initializeScrollAnimations();
    initializeSkillBars();
    initializeConnectingDots();
}

function hideLoadingScreen() {
    if (LOADING_SCREEN) {
        LOADING_SCREEN.style.display = 'none';
    }
}

function initializeTheme() {
    const savedTheme = localStorage.getItem('portfolio_theme') || 'light';
    setTheme(savedTheme);
    
    if (THEME_TOGGLE) {
        THEME_TOGGLE.addEventListener('click', toggleTheme);
    }
}

function setTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio_theme', theme);
    
    // Update theme toggle icon
    if (THEME_TOGGLE) {
        const icon = THEME_TOGGLE.querySelector('i');
        if (icon) {
            if (theme === 'dark') {
                icon.className = 'fas fa-sun';
            } else {
                icon.className = 'fas fa-moon';
            }
        }
    }
}

function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    showNotification(`Switched to ${newTheme} theme`, 'info');
}

// Connecting Dots Animation
function initializeConnectingDots() {
    const container = document.getElementById('connectingDots');
    if (!container) return;

    // Create canvas
    canvas = document.createElement('canvas');
    container.appendChild(canvas);
    ctx = canvas.getContext('2d');

    // Set canvas size
    function setCanvasSize() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Create dots
    createDots();

    // Mouse events
    container.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
        isMouseInHeader = true;
    });

    container.addEventListener('mouseleave', () => {
        isMouseInHeader = false;
    });

    // Start animation
    animateDots();
}

function createDots() {
    dots = [];
    const dotCount = 400;
    
    for (let i = 0; i < dotCount; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            originalRadius: 0,
            color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.3})`,
            pulse: Math.random() * Math.PI * 2
        });
        
        dots[i].originalRadius = dots[i].radius;
    }
}

function animateDots() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw dots
    dots.forEach(dot => {
        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;
        
        // Bounce off edges
        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;
        
        // Pulsing effect
        dot.pulse += 0.05;
        dot.radius = dot.originalRadius + Math.sin(dot.pulse) * 0.5;
        
        // Mouse interaction
        if (isMouseInHeader) {
            const dx = dot.x - mouseX;
            const dy = dot.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                dot.vx += (dx / distance) * force * 0.1;
                dot.vy += (dy / distance) * force * 0.1;
                
                // Limit speed
                const speed = Math.sqrt(dot.vx * dot.vx + dot.vy * dot.vy);
                if (speed > 2) {
                    dot.vx = (dot.vx / speed) * 2;
                    dot.vy = (dot.vy / speed) * 2;
                }
            }
        }
        
        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();
    });
    
    // Draw connections
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
            const dx = dots[i].x - dots[j].x;
            const dy = dots[i].y - dots[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const opacity = 1 - (distance / 100);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.3})`;
                
                ctx.beginPath();
                ctx.moveTo(dots[i].x, dots[i].y);
                ctx.lineTo(dots[j].x, dots[j].y);
                ctx.stroke();
            }
        }
    }
    
    requestAnimationFrame(animateDots);
}

function initializeScrollAnimations() {
    // Back to top button
    if (BACK_TO_TOP_BTN) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                BACK_TO_TOP_BTN.style.display = 'flex';
            } else {
                BACK_TO_TOP_BTN.style.display = 'none';
            }
        });
        
        BACK_TO_TOP_BTN.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

function initializeSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach(bar => {
        const level = bar.getAttribute('data-level');
        setTimeout(() => {
            bar.style.width = level + '%';
        }, 500);
    });
}

// =================================================================
// 2. PORTFOLIO FUNCTIONALITY
// =================================================================

function initializePortfolioJS() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
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

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            showNotification(`Thank you, ${name}! Your message has been sent successfully.`, 'success');
            contactForm.reset();
        });
    }

    // Navbar background on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = currentTheme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(44, 62, 80, 0.95)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = currentTheme === 'light' ? 'white' : 'var(--primary)';
                navbar.style.backdropFilter = 'none';
            }
        }
    });

    // Animate elements on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.timeline-item, .skill-category, .achievement-card, .education-item');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementTop < windowHeight - 100) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    const elementsToAnimate = document.querySelectorAll('.timeline-item, .skill-category, .achievement-card, .education-item');
    elementsToAnimate.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    animateOnScroll();
    window.addEventListener('scroll', animateOnScroll);

    // Update footer year
    const year = new Date().getFullYear();
    const yearElement = document.querySelector('#footer .footer-bottom p:first-child');
    if (yearElement) {
        yearElement.innerHTML = `&copy; ${year} Adil Zaman. All Rights Reserved.`;
    }
}

// =================================================================
// 3. LOGIN & CONTROL PANEL
// =================================================================

function setupLoginListeners() {
    OPEN_LOGIN_BTN = document.getElementById("openLoginBtn");
    CLOSE_LOGIN_BTN = document.getElementById("closeLoginBtn");
    
    if (OPEN_LOGIN_BTN) {
        OPEN_LOGIN_BTN.onclick = openLoginModal;
    }

    if (CLOSE_LOGIN_BTN) {
        CLOSE_LOGIN_BTN.onclick = closeLoginModal;
    }

    window.onclick = function(event) {
        if (event.target == LOGIN_MODAL) {
            closeLoginModal();
        }
    }

    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function switchToPortfolio() {
    if (PORTFOLIO_CONTAINER) PORTFOLIO_CONTAINER.style.display = 'block';
    if (CONTROL_PANEL_APP) CONTROL_PANEL_APP.style.display = 'none';
    localStorage.removeItem('docControl_loggedIn');
    isLoggedIn = false;
}

function switchToControlPanel() {
    if (PORTFOLIO_CONTAINER) PORTFOLIO_CONTAINER.style.display = 'none';
    if (CONTROL_PANEL_APP) CONTROL_PANEL_APP.style.display = 'block';
    
    loadFromLocalStorage();
    initializeNavigation();
    loadSheet('dashboard', 'Dashboard');
    typeWriter(); 
    localStorage.setItem('docControl_loggedIn', 'true');
    isLoggedIn = true;
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
// 4. CONTROL PANEL FUNCTIONS
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
            loadSheet(sheet.id, sheet.name);
        });
        
        listItem.appendChild(link);
        sheetList.appendChild(listItem);
    });
    
    // Add logout button listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
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

    // Remove active class from all links
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current link
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    // Simple content for demonstration
    switch(sheetId) {
        case 'dashboard':
            container.innerHTML = `
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
                                <h3>5</h3>
                                <p>Pending Tasks</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #e74c3c;">
                                <i class="fas fa-calendar-times"></i>
                            </div>
                            <div class="stat-info">
                                <h3>2</h3>
                                <p>Today's Reminders</p>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #27ae60;">
                                <i class="fas fa-file-pdf"></i>
                            </div>
                            <div class="stat-info">
                                <h3>15</h3>
                                <p>Documents</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            break;
        default:
            container.innerHTML = `
                <div class="page-header">
                    <h2>${sheetName}</h2>
                </div>
                <div class="empty-state">
                    <i class="fas fa-cogs"></i>
                    <h3>Module Under Development</h3>
                    <p>This feature is coming soon!</p>
                </div>
            `;
    }
}

function performGlobalSearch(searchTerm) {
    const container = document.getElementById('dataContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="search-results">
            <h2>Search Results for "${searchTerm}"</h2>
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try different search terms</p>
            </div>
        </div>
    `;
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

// =================================================================
// 5. UTILITY FUNCTIONS
// =================================================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create new notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('docControl_schedules', JSON.stringify(schedules));
        localStorage.setItem('docControl_todos', JSON.stringify(todoItems));
        localStorage.setItem('docControl_documents', JSON.stringify(documents));
    } catch (e) {
        console.error('Error saving to localStorage:', e);
    }
}

function loadFromLocalStorage() {
    try {
        schedules = JSON.parse(localStorage.getItem('docControl_schedules') || '[]');
        todoItems = JSON.parse(localStorage.getItem('docControl_todos') || '[]');
        documents = JSON.parse(localStorage.getItem('docControl_documents') || '[]');
    } catch (e) {
        console.error('Error loading from localStorage:', e);
    }
}

// Make functions globally available
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.showNotification = showNotification;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
