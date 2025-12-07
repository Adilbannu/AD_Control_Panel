// ========================================================
// COMPLETE JAVASCRIPT FOR BANNU ACADEMY PLATFORM
// ========================================================

// Global Variables
let currentUser = null;
let isLoggedIn = false;
let currentPage = 'home';
let notifications = [];
let courses = [];
let meetings = [];
let assignments = [];
let quizzes = [];
let chatMessages = [];
let certificates = [];
let attendanceRecords = [];
let zoomIntegration = null;

// DOM Elements
const elements = {
    // Navigation
    navMenu: null,
    mobileMenuBtn: null,
    themeToggle: null,
    userMenuBtn: null,
    
    // Modals
    loginModal: null,
    closeLoginModal: null,
    
    // Sections
    sections: {},
    
    // Forms
    loginForm: null,
    
    // Containers
    coursesList: null,
    meetingsContainer: null,
    assignmentsList: null,
    quizzesList: null,
    certificatesList: null,
    attendanceTable: null,
    notificationsList: null,
    
    // Chat Elements
    chatList: null,
    chatMessages: null,
    messageInput: null,
    sendMessageBtn: null,
    currentChatName: null,
    
    // Buttons
    addCourseBtn: null,
    refreshMeetingsBtn: null,
    createMeetingBtn: null,
    createAssignmentBtn: null,
    createQuizBtn: null,
    generateCertificateBtn: null,
    markAttendanceBtn: null,
    markAllReadBtn: null,
    
    // Filters
    assignmentFilter: null,
    attendanceFilter: null,
    courseFilter: null
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    initializeTheme();
    checkAuthStatus();
    loadData();
    showToast('Welcome to Bannu Digital Skills Academy!', 'info');
    
    // Hide page loader after 1 second
    setTimeout(() => {
        document.getElementById('pageLoader').classList.add('hidden');
    }, 1000);
});

// Initialize DOM Elements
function initializeElements() {
    // Navigation
    elements.navMenu = document.getElementById('navMenu');
    elements.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    elements.themeToggle = document.getElementById('themeToggle');
    elements.userMenuBtn = document.getElementById('userMenuBtn');
    
    // Modals
    elements.loginModal = document.getElementById('loginModal');
    elements.closeLoginModal = document.getElementById('closeLoginModal');
    
    // Forms
    elements.loginForm = document.getElementById('loginForm');
    
    // Sections
    elements.sections = {
        home: document.getElementById('home'),
        courses: document.getElementById('courses'),
        zoom: document.getElementById('zoom'),
        assignments: document.getElementById('assignments'),
        quizzes: document.getElementById('quizzes'),
        chat: document.getElementById('chat'),
        certificates: document.getElementById('certificates'),
        attendance: document.getElementById('attendance'),
        notifications: document.getElementById('notifications')
    };
    
    // Containers
    elements.coursesList = document.getElementById('coursesList');
    elements.meetingsContainer = document.getElementById('meetingsContainer');
    elements.assignmentsList = document.getElementById('assignmentsList');
    elements.quizzesList = document.getElementById('quizzesList');
    elements.certificatesList = document.getElementById('certificatesList');
    elements.attendanceTable = document.getElementById('attendanceTable');
    elements.notificationsList = document.getElementById('notificationsList');
    
    // Chat Elements
    elements.chatList = document.getElementById('chatList');
    elements.chatMessages = document.getElementById('chatMessages');
    elements.messageInput = document.getElementById('messageInput');
    elements.sendMessageBtn = document.getElementById('sendMessageBtn');
    elements.currentChatName = document.getElementById('currentChatName');
    
    // Buttons
    elements.addCourseBtn = document.getElementById('addCourseBtn');
    elements.refreshMeetingsBtn = document.getElementById('refreshMeetingsBtn');
    elements.createMeetingBtn = document.getElementById('createMeetingBtn');
    elements.createAssignmentBtn = document.getElementById('createAssignmentBtn');
    elements.createQuizBtn = document.getElementById('createQuizBtn');
    elements.generateCertificateBtn = document.getElementById('generateCertificateBtn');
    elements.markAttendanceBtn = document.getElementById('markAttendanceBtn');
    elements.markAllReadBtn = document.getElementById('markAllReadBtn');
    
    // Filters
    elements.assignmentFilter = document.getElementById('assignmentFilter');
    elements.attendanceFilter = document.getElementById('attendanceFilter');
    elements.courseFilter = document.getElementById('courseFilter');
}

// Initialize Event Listeners
function initializeEventListeners() {
    // Mobile Menu Toggle
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    
    // Theme Toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // User Menu
    elements.userMenuBtn.addEventListener('click', toggleUserMenu);
    
    // Navigation Links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('href').substring(1);
            navigateTo(page);
            
            // Close mobile menu if open
            elements.navMenu.classList.remove('show');
        });
    });
    
    // Modal Close
    elements.closeLoginModal.addEventListener('click', () => {
        elements.loginModal.classList.remove('show');
    });
    
    // Login Form
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Buttons
    if (elements.addCourseBtn) {
        elements.addCourseBtn.addEventListener('click', showAddCourseModal);
    }
    
    if (elements.refreshMeetingsBtn) {
        elements.refreshMeetingsBtn.addEventListener('click', refreshMeetings);
    }
    
    if (elements.createMeetingBtn) {
        elements.createMeetingBtn.addEventListener('click', showCreateMeetingModal);
    }
    
    if (elements.createAssignmentBtn) {
        elements.createAssignmentBtn.addEventListener('click', showCreateAssignmentModal);
    }
    
    if (elements.createQuizBtn) {
        elements.createQuizBtn.addEventListener('click', showCreateQuizModal);
    }
    
    if (elements.generateCertificateBtn) {
        elements.generateCertificateBtn.addEventListener('click', showGenerateCertificateModal);
    }
    
    if (elements.markAttendanceBtn) {
        elements.markAttendanceBtn.addEventListener('click', showMarkAttendanceModal);
    }
    
    if (elements.markAllReadBtn) {
        elements.markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    }
    
    // Filters
    if (elements.assignmentFilter) {
        elements.assignmentFilter.addEventListener('change', filterAssignments);
    }
    
    if (elements.attendanceFilter) {
        elements.attendanceFilter.addEventListener('change', filterAttendance);
    }
    
    // Chat
    if (elements.sendMessageBtn) {
        elements.sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    if (elements.messageInput) {
        elements.messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

// Initialize Theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('bannu-theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

// Toggle Mobile Menu
function toggleMobileMenu() {
    elements.navMenu.classList.toggle('show');
}

// Toggle Theme
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('bannu-theme', newTheme);
    updateThemeIcon(newTheme);
    
    showToast(`Switched to ${newTheme} theme`, 'info');
}

// Update Theme Icon
function updateThemeIcon(theme) {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Toggle User Menu
function toggleUserMenu() {
    if (!isLoggedIn) {
        showLoginModal();
    } else {
        // Show user dropdown
        showUserDropdown();
    }
}

// Show Login Modal
function showLoginModal() {
    elements.loginModal.classList.add('show');
}

// Navigate to Page
function navigateTo(page) {
    // Hide all sections
    Object.values(elements.sections).forEach(section => {
        if (section) section.classList.add('hidden');
    });
    
    // Show target section
    if (elements.sections[page]) {
        elements.sections[page].classList.remove('hidden');
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${page}`) {
            link.classList.add('active');
        }
    });
    
    currentPage = page;
    
    // Load data for the page
    switch(page) {
        case 'courses':
            loadCourses();
            break;
        case 'zoom':
            loadMeetings();
            break;
        case 'assignments':
            loadAssignments();
            break;
        case 'quizzes':
            loadQuizzes();
            break;
        case 'chat':
            loadChat();
            break;
        case 'certificates':
            loadCertificates();
            break;
        case 'attendance':
            loadAttendance();
            break;
        case 'notifications':
            loadNotifications();
            break;
    }
}

// Check Authentication Status
function checkAuthStatus() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            isLoggedIn = true;
            updateUserMenu();
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    }
}

// Update User Menu
function updateUserMenu() {
    if (isLoggedIn && currentUser) {
        elements.userMenuBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>${currentUser.name.split(' ')[0]}</span>
        `;
    } else {
        elements.userMenuBtn.innerHTML = `
            <i class="fas fa-user"></i>
            <span>Login</span>
        `;
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    // Mock login - In real app, this would be an API call
    const mockUsers = [
        { id: 1, email: 'student@example.com', password: 'student123', name: 'Student User', role: 'student' },
        { id: 2, email: 'teacher@example.com', password: 'teacher123', name: 'Adil Zaman', role: 'teacher' },
        { id: 3, email: 'admin@example.com', password: 'admin123', name: 'Admin User', role: 'admin' }
    ];
    
    const user = mockUsers.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        isLoggedIn = true;
        
        // Save to localStorage
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        }
        
        // Update UI
        updateUserMenu();
        elements.loginModal.classList.remove('show');
        elements.loginForm.reset();
        
        showToast(`Welcome back, ${user.name}!`, 'success');
        
        // Load user-specific data
        loadData();
    } else {
        showToast('Invalid email or password', 'error');
    }
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('currentUser');
        currentUser = null;
        isLoggedIn = false;
        updateUserMenu();
        showToast('Successfully logged out', 'info');
    }
}

// Show Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="toast-icon ${icons[type]}"></i>
        <div class="toast-message">${message}</div>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Add close event
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

// Load Data
function loadData() {
    // Load from localStorage or initialize
    courses = JSON.parse(localStorage.getItem('courses')) || getDefaultCourses();
    meetings = JSON.parse(localStorage.getItem('meetings')) || [];
    assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    quizzes = JSON.parse(localStorage.getItem('quizzes')) || [];
    chatMessages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    certificates = JSON.parse(localStorage.getItem('certificates')) || [];
    attendanceRecords = JSON.parse(localStorage.getItem('attendance')) || [];
    notifications = JSON.parse(localStorage.getItem('notifications')) || getDefaultNotifications();
    
    // Save to localStorage
    saveData();
    
    // Update UI based on current page
    if (currentPage === 'home') {
        updateHomeStats();
    }
}

// Save Data
function saveData() {
    localStorage.setItem('courses', JSON.stringify(courses));
    localStorage.setItem('meetings', JSON.stringify(meetings));
    localStorage.setItem('assignments', JSON.stringify(assignments));
    localStorage.setItem('quizzes', JSON.stringify(quizzes));
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    localStorage.setItem('certificates', JSON.stringify(certificates));
    localStorage.setItem('attendance', JSON.stringify(attendanceRecords));
    localStorage.setItem('notifications', JSON.stringify(notifications));
}

// Get Default Courses
function getDefaultCourses() {
    return [
        {
            id: 1,
            name: 'Digital Office Assistant',
            description: 'Learn Microsoft Office, Email, Internet, and basic computer skills',
            duration: '3 Months',
            instructor: 'Adil Zaman',
            students: 45,
            status: 'active'
        },
        {
            id: 2,
            name: 'Document Management Pro',
            description: 'Advanced document control systems and procedures',
            duration: '1 Month',
            instructor: 'Adil Zaman',
            students: 28,
            status: 'active'
        },
        {
            id: 3,
            name: 'Freelance Skills Bootcamp',
            description: 'Learn to earn online through freelancing platforms',
            duration: '2 Months',
            instructor: 'Adil Zaman',
            students: 32,
            status: 'active'
        }
    ];
}

// Get Default Notifications
function getDefaultNotifications() {
    return [
        {
            id: 1,
            title: 'Welcome to Bannu Academy',
            message: 'Start your learning journey with our free courses',
            type: 'info',
            read: false,
            timestamp: new Date().toISOString()
        },
        {
            id: 2,
            title: 'New Course Available',
            message: 'Digital Office Assistant course is now open for enrollment',
            type: 'success',
            read: false,
            timestamp: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 3,
            title: 'Live Session Reminder',
            message: 'Join Zoom meeting today at 6:00 PM',
            type: 'warning',
            read: true,
            timestamp: new Date(Date.now() - 43200000).toISOString()
        }
    ];
}

// Update Home Stats
function updateHomeStats() {
    document.getElementById('totalStudents').textContent = '500+';
    document.getElementById('coursesCount').textContent = courses.length;
    document.getElementById('liveSessions').textContent = '48';
    document.getElementById('jobPlacement').textContent = '85%';
}

// ========================================
// COURSES MANAGEMENT
// ========================================

function loadCourses() {
    if (!elements.coursesList) return;
    
    elements.coursesList.innerHTML = '';
    
    if (courses.length === 0) {
        elements.coursesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-book-open"></i>
                <h3>No Courses Available</h3>
                <p>Add your first course to get started</p>
                <button class="btn btn-primary mt-2" onclick="showAddCourseModal()">
                    <i class="fas fa-plus"></i> Add Course
                </button>
            </div>
        `;
        return;
    }
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card';
        courseCard.innerHTML = `
            <div class="course-image" style="background-color: #${Math.floor(Math.random()*16777215).toString(16)};"></div>
            <div class="course-content">
                <h3 class="course-title">${course.name}</h3>
                <p class="course-description">${course.description}</p>
                <div class="course-meta">
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-user-graduate"></i> ${course.students} Students</span>
                </div>
                <div class="mt-3">
                    <button class="btn btn-sm btn-primary" onclick="viewCourse(${course.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editCourse(${course.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        elements.coursesList.appendChild(courseCard);
    });
}

function showAddCourseModal() {
    const modal = createModal('Add New Course', `
        <form id="addCourseForm">
            <div class="form-group">
                <label class="form-label">Course Name</label>
                <input type="text" class="form-control" id="courseName" required>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="courseDescription" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Duration</label>
                <input type="text" class="form-control" id="courseDuration" required>
            </div>
            <div class="form-group">
                <label class="form-label">Instructor</label>
                <input type="text" class="form-control" id="courseInstructor" required>
            </div>
        </form>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveCourse()">Save Course</button>
    `);
    
    modal.show();
}

function saveCourse() {
    const name = document.getElementById('courseName').value;
    const description = document.getElementById('courseDescription').value;
    const duration = document.getElementById('courseDuration').value;
    const instructor = document.getElementById('courseInstructor').value;
    
    if (!name || !description || !duration || !instructor) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    const newCourse = {
        id: Date.now(),
        name,
        description,
        duration,
        instructor,
        students: 0,
        status: 'active',
        created_at: new Date().toISOString()
    };
    
    courses.push(newCourse);
    saveData();
    loadCourses();
    closeModal();
    showToast('Course added successfully', 'success');
}

function viewCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    
    createModal(course.name, `
        <div class="course-details">
            <p><strong>Description:</strong> ${course.description}</p>
            <p><strong>Duration:</strong> ${course.duration}</p>
            <p><strong>Instructor:</strong> ${course.instructor}</p>
            <p><strong>Students Enrolled:</strong> ${course.students}</p>
            <p><strong>Status:</strong> ${course.status}</p>
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        <button type="button" class="btn btn-primary" onclick="editCourse(${id})">Edit Course</button>
    `).show();
}

function editCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    
    const modal = createModal('Edit Course', `
        <form id="editCourseForm">
            <div class="form-group">
                <label class="form-label">Course Name</label>
                <input type="text" class="form-control" id="editCourseName" value="${course.name}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="editCourseDescription" rows="3" required>${course.description}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Duration</label>
                <input type="text" class="form-control" id="editCourseDuration" value="${course.duration}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Instructor</label>
                <input type="text" class="form-control" id="editCourseInstructor" value="${course.instructor}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-control" id="editCourseStatus">
                    <option value="active" ${course.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="inactive" ${course.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                    <option value="completed" ${course.status === 'completed' ? 'selected' : ''}>Completed</option>
                </select>
            </div>
        </form>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="updateCourse(${id})">Update Course</button>
    `);
    
    modal.show();
}

function updateCourse(id) {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    
    course.name = document.getElementById('editCourseName').value;
    course.description = document.getElementById('editCourseDescription').value;
    course.duration = document.getElementById('editCourseDuration').value;
    course.instructor = document.getElementById('editCourseInstructor').value;
    course.status = document.getElementById('editCourseStatus').value;
    course.updated_at = new Date().toISOString();
    
    saveData();
    loadCourses();
    closeModal();
    showToast('Course updated successfully', 'success');
}

function deleteCourse(id) {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    courses = courses.filter(c => c.id !== id);
    saveData();
    loadCourses();
    showToast('Course deleted successfully', 'success');
}

// ========================================
// ZOOM MEETINGS
// ========================================

function loadMeetings() {
    if (!elements.meetingsContainer) return;
    
    elements.meetingsContainer.innerHTML = '';
    
    if (meetings.length === 0) {
        elements.meetingsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-video-slash"></i>
                <h3>No Meetings Scheduled</h3>
                <p>Create your first meeting to get started</p>
                <button class="btn btn-primary mt-2" onclick="showCreateMeetingModal()">
                    <i class="fas fa-plus"></i> Create Meeting
                </button>
            </div>
        `;
        return;
    }
    
    meetings.forEach(meeting => {
        const meetingTime = new Date(meeting.dateTime);
        const now = new Date();
        const isLive = meetingTime <= now && new Date(meetingTime.getTime() + meeting.duration * 60000) > now;
        const isUpcoming = meetingTime > now;
        
        const meetingCard = document.createElement('div');
        meetingCard.className = `meeting-card ${isLive ? 'live' : ''}`;
        meetingCard.innerHTML = `
            <div class="meeting-header">
                <h4>${meeting.topic}</h4>
                <span class="meeting-status ${isLive ? 'live' : 'upcoming'}">
                    ${isLive ? 'LIVE NOW' : 'UPCOMING'}
                </span>
            </div>
            <div class="meeting-body">
                <div class="meeting-info">
                    <div class="info-item">
                        <i class="fas fa-calendar"></i>
                        <span>${meetingTime.toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-clock"></i>
                        <span>${meetingTime.toLocaleTimeString()}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-hourglass-half"></i>
                        <span>${meeting.duration} minutes</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-key"></i>
                        <span>Password: ${meeting.password}</span>
                    </div>
                </div>
                <div class="meeting-actions mt-2">
                    <button class="btn btn-sm btn-primary" onclick="joinMeeting(${meeting.id})">
                        <i class="fas fa-video"></i> Join Meeting
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="copyMeetingLink('${meeting.joinUrl}')">
                        <i class="fas fa-copy"></i> Copy Link
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMeeting(${meeting.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        elements.meetingsContainer.appendChild(meetingCard);
    });
}

function showCreateMeetingModal() {
    const modal = createModal('Create Zoom Meeting', `
        <form id="createMeetingForm">
            <div class="form-group">
                <label class="form-label">Meeting Topic</label>
                <input type="text" class="form-control" id="meetingTopic" required>
            </div>
            <div class="form-group">
                <label class="form-label">Date & Time</label>
                <input type="datetime-local" class="form-control" id="meetingDateTime" required>
            </div>
            <div class="form-group">
                <label class="form-label">Duration (minutes)</label>
                <input type="number" class="form-control" id="meetingDuration" value="60" min="15" max="240" required>
            </div>
            <div class="form-group">
                <label class="form-label">Password</label>
                <input type="text" class="form-control" id="meetingPassword" placeholder="Auto-generate if empty">
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="meetingDescription" rows="3"></textarea>
            </div>
        </form>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="createMeeting()">Create Meeting</button>
    `);
    
    // Set minimum datetime to now
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('meetingDateTime').min = localDateTime;
    
    modal.show();
}

function createMeeting() {
    const topic = document.getElementById('meetingTopic').value;
    const dateTime = document.getElementById('meetingDateTime').value;
    const duration = document.getElementById('meetingDuration').value;
    const password = document.getElementById('meetingPassword').value || generatePassword();
    const description = document.getElementById('meetingDescription').value;
    
    if (!topic || !dateTime || !duration) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const newMeeting = {
        id: Date.now(),
        topic,
        dateTime: new Date(dateTime).toISOString(),
        duration: parseInt(duration),
        password,
        description,
        joinUrl: `https://zoom.us/j/${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        attendees: []
    };
    
    meetings.push(newMeeting);
    saveData();
    loadMeetings();
    closeModal();
    showToast('Meeting created successfully', 'success');
    
    // Add notification
    addNotification('Meeting Scheduled', `New meeting "${topic}" scheduled for ${new Date(dateTime).toLocaleString()}`, 'info');
}

function joinMeeting(id) {
    const meeting = meetings.find(m => m.id === id);
    if (!meeting) return;
    
    // Track attendance
    if (currentUser) {
        meeting.attendees.push({
            userId: currentUser.id,
            name: currentUser.name,
            joinTime: new Date().toISOString()
        });
        saveData();
    }
    
    // Open Zoom link (simulated)
    window.open(meeting.joinUrl, '_blank');
    showToast('Joining meeting...', 'info');
}

function copyMeetingLink(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('Meeting link copied to clipboard', 'success');
    });
}

function deleteMeeting(id) {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    meetings = meetings.filter(m => m.id !== id);
    saveData();
    loadMeetings();
    showToast('Meeting deleted successfully', 'success');
}

function refreshMeetings() {
    loadMeetings();
    showToast('Meetings refreshed', 'info');
}

function generatePassword() {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
}

// ========================================
// ASSIGNMENTS
// ========================================

function loadAssignments() {
    if (!elements.assignmentsList) return;
    
    elements.assignmentsList.innerHTML = '';
    
    if (assignments.length === 0) {
        elements.assignmentsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No Assignments</h3>
                <p>Create your first assignment</p>
                <button class="btn btn-primary mt-2" onclick="showCreateAssignmentModal()">
                    <i class="fas fa-plus"></i> Create Assignment
                </button>
            </div>
        `;
        return;
    }
    
    assignments.forEach(assignment => {
        const dueDate = new Date(assignment.dueDate);
        const now = new Date();
        const isOverdue = dueDate < now && !assignment.submitted;
        
        const assignmentCard = document.createElement('div');
        assignmentCard.className = 'assignment-card';
        assignmentCard.innerHTML = `
            <h4>${assignment.title}</h4>
            <p>${assignment.description}</p>
            <div class="mt-2">
                <span class="assignment-due">
                    <i class="fas fa-calendar-times"></i>
                    Due: ${dueDate.toLocaleDateString()}
                    ${isOverdue ? ' (Overdue)' : ''}
                </span>
                ${assignment.submitted ? `
                    <span class="assignment-submitted ml-3">
                        <i class="fas fa-check-circle"></i> Submitted
                    </span>
                ` : ''}
            </div>
            <div class="assignment-actions mt-3">
                ${!assignment.submitted ? `
                    <button class="btn btn-sm btn-primary" onclick="submitAssignment(${assignment.id})">
                        <i class="fas fa-upload"></i> Submit
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-secondary" onclick="viewAssignment(${assignment.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                ${currentUser?.role === 'teacher' || currentUser?.role === 'admin' ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteAssignment(${assignment.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        `;
        elements.assignmentsList.appendChild(assignmentCard);
    });
}

function showCreateAssignmentModal() {
    if (!isLoggedIn || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showToast('Only teachers and admins can create assignments', 'error');
        return;
    }
    
    const modal = createModal('Create Assignment', `
        <form id="createAssignmentForm">
            <div class="form-group">
                <label class="form-label">Title</label>
                <input type="text" class="form-control" id="assignmentTitle" required>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="assignmentDescription" rows="3" required></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Due Date</label>
                <input type="datetime-local" class="form-control" id="assignmentDueDate" required>
            </div>
            <div class="form-group">
                <label class="form-label">Course</label>
                <select class="form-control" id="assignmentCourse">
                    ${courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Maximum Marks</label>
                <input type="number" class="form-control" id="assignmentMarks" value="100" min="1" max="1000">
            </div>
        </form>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveAssignment()">Create Assignment</button>
    `);
    
    // Set minimum datetime to now
    const now = new Date();
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('assignmentDueDate').min = localDateTime;
    
    modal.show();
}

function saveAssignment() {
    const title = document.getElementById('assignmentTitle').value;
    const description = document.getElementById('assignmentDescription').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    const courseId = document.getElementById('assignmentCourse').value;
    const marks = document.getElementById('assignmentMarks').value;
    
    if (!title || !description || !dueDate) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    const course = courses.find(c => c.id === parseInt(courseId));
    
    const newAssignment = {
        id: Date.now(),
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        courseId: parseInt(courseId),
        courseName: course ? course.name : 'Unknown Course',
        marks: parseInt(marks) || 100,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        submissions: []
    };
    
    assignments.push(newAssignment);
    saveData();
    loadAssignments();
    closeModal();
    showToast('Assignment created successfully', 'success');
    
    // Add notification for students
    addNotification('New Assignment', `New assignment "${title}" has been posted`, 'info');
}

function submitAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;
    
    const modal = createModal('Submit Assignment', `
        <form id="submitAssignmentForm">
            <div class="form-group">
                <label class="form-label">Submission Notes</label>
                <textarea class="form-control" id="submissionNotes" rows="3" placeholder="Add any notes about your submission..."></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Upload Files</label>
                <div class="file-upload" onclick="document.getElementById('fileInput').click()">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p>Click to upload files</p>
                    <input type="file" id="fileInput" multiple style="display: none;">
                </div>
                <div id="fileList" class="mt-2"></div>
            </div>
        </form>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveSubmission(${id})">Submit Assignment</button>
    `);
    
    modal.show();
}

function saveSubmission(assignmentId) {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    
    const notes = document.getElementById('submissionNotes').value;
    const files = []; // In real app, this would handle file uploads
    
    const submission = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        notes,
        files,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        grade: null,
        feedback: null
    };
    
    assignment.submissions.push(submission);
    assignment.submitted = true;
    saveData();
    loadAssignments();
    closeModal();
    showToast('Assignment submitted successfully', 'success');
}

function viewAssignment(id) {
    const assignment = assignments.find(a => a.id === id);
    if (!assignment) return;
    
    const dueDate = new Date(assignment.dueDate);
    const submissions = assignment.submissions || [];
    const userSubmission = submissions.find(s => s.studentId === currentUser?.id);
    
    let content = `
        <div class="assignment-details">
            <p><strong>Title:</strong> ${assignment.title}</p>
            <p><strong>Description:</strong> ${assignment.description}</p>
            <p><strong>Course:</strong> ${assignment.courseName}</p>
            <p><strong>Due Date:</strong> ${dueDate.toLocaleString()}</p>
            <p><strong>Maximum Marks:</strong> ${assignment.marks}</p>
            <p><strong>Created:</strong> ${new Date(assignment.createdAt).toLocaleDateString()}</p>
    `;
    
    if (userSubmission) {
        content += `
            <div class="mt-3">
                <h5>Your Submission</h5>
                <p><strong>Submitted:</strong> ${new Date(userSubmission.submittedAt).toLocaleString()}</p>
                <p><strong>Notes:</strong> ${userSubmission.notes || 'None'}</p>
                <p><strong>Status:</strong> ${userSubmission.status}</p>
                ${userSubmission.grade ? `<p><strong>Grade:</strong> ${userSubmission.grade}/${assignment.marks}</p>` : ''}
                ${userSubmission.feedback ? `<p><strong>Feedback:</strong> ${userSubmission.feedback}</p>` : ''}
            </div>
        `;
    }
    
    content += `</div>`;
    
    createModal(assignment.title, content, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        ${!userSubmission ? `<button type="button" class="btn btn-primary" onclick="submitAssignment(${id})">Submit Assignment</button>` : ''}
    `).show();
}

function deleteAssignment(id) {
    if (!confirm('Are you sure you want to delete this assignment?')) return;
    
    assignments = assignments.filter(a => a.id !== id);
    saveData();
    loadAssignments();
    showToast('Assignment deleted successfully', 'success');
}

function filterAssignments() {
    const filter = elements.assignmentFilter.value;
    loadAssignments(); // In real app, this would filter the assignments
}

// ========================================
// QUIZZES
// ========================================

function loadQuizzes() {
    if (!elements.quizzesList) return;
    
    elements.quizzesList.innerHTML = '';
    
    if (quizzes.length === 0) {
        elements.quizzesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <h3>No Quizzes Available</h3>
                <p>Create your first quiz</p>
                <button class="btn btn-primary mt-2" onclick="showCreateQuizModal()">
                    <i class="fas fa-plus"></i> Create Quiz
                </button>
            </div>
        `;
        return;
    }
    
    quizzes.forEach(quiz => {
        const quizCard = document.createElement('div');
        quizCard.className = 'quiz-card';
        quizCard.innerHTML = `
            <h4>${quiz.title}</h4>
            <p>${quiz.description}</p>
            <div class="mt-2">
                <span class="quiz-questions">
                    <i class="fas fa-list-ol"></i>
                    ${quiz.questions?.length || 0} Questions
                </span>
                <span class="ml-3">
                    <i class="fas fa-clock"></i>
                    ${quiz.duration || 'No'} time limit
                </span>
            </div>
            <div class="quiz-actions mt-3">
                <button class="btn btn-sm btn-primary" onclick="takeQuiz(${quiz.id})">
                    <i class="fas fa-play"></i> Take Quiz
                </button>
                <button class="btn btn-sm btn-secondary" onclick="viewQuiz(${quiz.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                ${currentUser?.role === 'teacher' || currentUser?.role === 'admin' ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteQuiz(${quiz.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
            </div>
        `;
        elements.quizzesList.appendChild(quizCard);
    });
}

function showCreateQuizModal() {
    if (!isLoggedIn || (currentUser.role !== 'teacher' && currentUser.role !== 'admin')) {
        showToast('Only teachers and admins can create quizzes', 'error');
        return;
    }
    
    const modal = createModal('Create Quiz', `
        <form id="createQuizForm">
            <div class="form-group">
                <label class="form-label">Quiz Title</label>
                <input type="text" class="form-control" id="quizTitle" required>
            </div>
            <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="quizDescription" rows="2"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Duration (minutes)</label>
                <input type="number" class="form-control" id="quizDuration" min="1" max="180" placeholder="Optional">
            </div>
            <div class="form-group">
                <label class="form-label">Course</label>
                <select class="form-control" id="quizCourse">
                    ${courses.map(course => `<option value="${course.id}">${course.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Maximum Attempts</label>
                <input type="number" class="form-control" id="quizAttempts" value="1" min="1" max="10">
            </div>
        </form>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveQuiz()">Create Quiz</button>
    `);
    
    modal.show();
}

function saveQuiz() {
    const title = document.getElementById('quizTitle').value;
    const description = document.getElementById('quizDescription').value;
    const duration = document.getElementById('quizDuration').value;
    const courseId = document.getElementById('quizCourse').value;
    const attempts = document.getElementById('quizAttempts').value;
    
    if (!title) {
        showToast('Please enter a quiz title', 'error');
        return;
    }
    
    const course = courses.find(c => c.id === parseInt(courseId));
    
    const newQuiz = {
        id: Date.now(),
        title,
        description,
        duration: duration ? parseInt(duration) : null,
        courseId: parseInt(courseId),
        courseName: course ? course.name : 'Unknown Course',
        maxAttempts: parseInt(attempts) || 1,
        createdBy: currentUser.id,
        createdAt: new Date().toISOString(),
        questions: [],
        submissions: []
    };
    
    quizzes.push(newQuiz);
    saveData();
    loadQuizzes();
    closeModal();
    showToast('Quiz created successfully', 'success');
    
    // Prompt to add questions
    if (confirm('Would you like to add questions to this quiz now?')) {
        addQuestionsToQuiz(newQuiz.id);
    }
}

function addQuestionsToQuiz(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const modal = createModal(`Add Questions to "${quiz.title}"`, `
        <div id="questionsContainer">
            <div class="question-item mb-3">
                <div class="form-group">
                    <label class="form-label">Question 1</label>
                    <input type="text" class="form-control question-text" placeholder="Enter question">
                </div>
                <div class="form-group">
                    <label class="form-label">Options (comma-separated)</label>
                    <input type="text" class="form-control question-options" placeholder="Option A, Option B, Option C, Option D">
                </div>
                <div class="form-group">
                    <label class="form-label">Correct Answer</label>
                    <input type="text" class="form-control question-answer" placeholder="Enter correct answer">
                </div>
                <div class="form-group">
                    <label class="form-label">Marks</label>
                    <input type="number" class="form-control question-marks" value="1" min="1">
                </div>
            </div>
        </div>
        <button type="button" class="btn btn-secondary" onclick="addQuestionField()">
            <i class="fas fa-plus"></i> Add Another Question
        </button>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="saveQuestions(${quizId})">Save Questions</button>
    `);
    
    modal.show();
}

function addQuestionField() {
    const container = document.getElementById('questionsContainer');
    const questionCount = container.children.length + 1;
    
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-item mb-3';
    questionDiv.innerHTML = `
        <div class="form-group">
            <label class="form-label">Question ${questionCount}</label>
            <input type="text" class="form-control question-text" placeholder="Enter question">
        </div>
        <div class="form-group">
            <label class="form-label">Options (comma-separated)</label>
            <input type="text" class="form-control question-options" placeholder="Option A, Option B, Option C, Option D">
        </div>
        <div class="form-group">
            <label class="form-label">Correct Answer</label>
            <input type="text" class="form-control question-answer" placeholder="Enter correct answer">
        </div>
        <div class="form-group">
            <label class="form-label">Marks</label>
            <input type="number" class="form-control question-marks" value="1" min="1">
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i> Remove
        </button>
    `;
    
    container.appendChild(questionDiv);
}

function saveQuestions(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const questionItems = document.querySelectorAll('.question-item');
    const questions = [];
    
    questionItems.forEach((item, index) => {
        const text = item.querySelector('.question-text').value;
        const options = item.querySelector('.question-options').value;
        const answer = item.querySelector('.question-answer').value;
        const marks = item.querySelector('.question-marks').value;
        
        if (text && options && answer) {
            questions.push({
                id: index + 1,
                text,
                options: options.split(',').map(opt => opt.trim()),
                correctAnswer: answer.trim(),
                marks: parseInt(marks) || 1
            });
        }
    });
    
    quiz.questions = questions;
    saveData();
    closeModal();
    showToast(`${questions.length} questions added to quiz`, 'success');
}

function takeQuiz(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    // Check if user has attempts remaining
    const userAttempts = quiz.submissions?.filter(s => s.studentId === currentUser?.id).length || 0;
    if (userAttempts >= quiz.maxAttempts) {
        showToast(`You have used all ${quiz.maxAttempts} attempt(s) for this quiz`, 'error');
        return;
    }
    
    const modal = createModal(quiz.title, `
        <div id="quizContainer">
            <div class="quiz-instructions mb-3">
                <p>${quiz.description || 'No description provided.'}</p>
                ${quiz.duration ? `<p><strong>Time Limit:</strong> ${quiz.duration} minutes</p>` : ''}
                <p><strong>Questions:</strong> ${quiz.questions?.length || 0}</p>
                <p><strong>Your Attempts:</strong> ${userAttempts}/${quiz.maxAttempts}</p>
            </div>
            <div id="quizQuestions">
                ${quiz.questions?.map((q, index) => `
                    <div class="question-item mb-4">
                        <h5>Question ${index + 1}: ${q.text}</h5>
                        <div class="question-options">
                            ${q.options.map((opt, optIndex) => `
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="q${q.id}" id="q${q.id}o${optIndex}" value="${opt}">
                                    <label class="form-check-label" for="q${q.id}o${optIndex}">${opt}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('') || '<p>No questions available for this quiz.</p>'}
            </div>
        </div>
    `, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
        <button type="button" class="btn btn-primary" onclick="submitQuiz(${quizId})">Submit Quiz</button>
    `);
    
    // Start timer if duration is set
    if (quiz.duration) {
        let timeLeft = quiz.duration * 60; // Convert to seconds
        const timerElement = document.createElement('div');
        timerElement.className = 'alert alert-warning';
        timerElement.id = 'quizTimer';
        timerElement.innerHTML = `<i class="fas fa-clock"></i> Time remaining: <span id="timeDisplay">${formatTime(timeLeft)}</span>`;
        
        modal.content.querySelector('.quiz-instructions').appendChild(timerElement);
        
        const timer = setInterval(() => {
            timeLeft--;
            document.getElementById('timeDisplay').textContent = formatTime(timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(timer);
                showToast('Time is up! Submitting quiz...', 'warning');
                submitQuiz(quizId);
                closeModal();
            }
        }, 1000);
    }
    
    modal.show();
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function submitQuiz(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    let score = 0;
    const totalMarks = quiz.questions.reduce((sum, q) => sum + q.marks, 0);
    const answers = {};
    
    quiz.questions.forEach(q => {
        const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
        answers[q.id] = selected ? selected.value : null;
        
        if (selected && selected.value === q.correctAnswer) {
            score += q.marks;
        }
    });
    
    const submission = {
        studentId: currentUser.id,
        studentName: currentUser.name,
        answers,
        score,
        totalMarks,
        percentage: Math.round((score / totalMarks) * 100),
        submittedAt: new Date().toISOString()
    };
    
    if (!quiz.submissions) quiz.submissions = [];
    quiz.submissions.push(submission);
    saveData();
    
    closeModal();
    
    // Show results
    createModal('Quiz Results', `
        <div class="quiz-results text-center">
            <h4>${quiz.title}</h4>
            <div class="mt-4">
                <h1 class="${submission.percentage >= 70 ? 'text-success' : 'text-danger'}">${submission.percentage}%</h1>
                <p>Score: ${score}/${totalMarks}</p>
                <p>Submitted: ${new Date(submission.submittedAt).toLocaleString()}</p>
                ${submission.percentage >= 70 ? 
                    '<div class="alert alert-success mt-3"><i class="fas fa-trophy"></i> Congratulations! You passed!</div>' : 
                    '<div class="alert alert-warning mt-3"><i class="fas fa-exclamation-triangle"></i> You need to score 70% or higher to pass.</div>'
                }
            </div>
        </div>
    `, `
        <button type="button" class="btn btn-primary" onclick="closeModal()">Close</button>
    `).show();
}

function viewQuiz(quizId) {
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    let content = `
        <div class="quiz-details">
            <p><strong>Title:</strong> ${quiz.title}</p>
            <p><strong>Description:</strong> ${quiz.description || 'None'}</p>
            <p><strong>Course:</strong> ${quiz.courseName}</p>
            <p><strong>Duration:</strong> ${quiz.duration ? quiz.duration + ' minutes' : 'No limit'}</p>
            <p><strong>Maximum Attempts:</strong> ${quiz.maxAttempts}</p>
            <p><strong>Questions:</strong> ${quiz.questions?.length || 0}</p>
            <p><strong>Created:</strong> ${new Date(quiz.createdAt).toLocaleDateString()}</p>
    `;
    
    if (currentUser?.role === 'teacher' || currentUser?.role === 'admin') {
        content += `
            <div class="mt-3">
                <h5>Submissions (${quiz.submissions?.length || 0})</h5>
                ${quiz.submissions?.map(sub => `
                    <div class="card mb-2">
                        <div class="card-body">
                            <p><strong>${sub.studentName}</strong>: ${sub.score}/${sub.totalMarks} (${sub.percentage}%)</p>
                            <small>Submitted: ${new Date(sub.submittedAt).toLocaleString()}</small>
                        </div>
                    </div>
                `).join('') || '<p>No submissions yet.</p>'}
            </div>
        `;
    }
    
    content += `</div>`;
    
    createModal(quiz.title, content, `
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Close</button>
        ${(currentUser?.role === 'teacher' || currentUser?.role === 'admin') ? `
            <button type="button" class="btn btn-primary" onclick="editQuiz(${quizId})">Edit Quiz</button>
        ` : ''}
        ${quiz.questions?.length > 0 ? `
            <button type="button" class="btn btn-success" onclick="takeQuiz(${quizId})">Take Quiz</button>
        ` : ''}
    `).show();
}

function editQuiz(quizId) {
    // Similar to create quiz but with existing data
    showToast('Edit quiz functionality coming soon', 'info');
}

function deleteQuiz
