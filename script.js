// =================================================================
// 1. CONFIGURATION & DATA (RESTORED STABLE DEFAULTS)
// =================================================================

// *** NOTE: GAS API URL IS NO LONGER USED, BUT KEPT FOR REFERENCE ***
const GAS_WEB_APP_ENDPOINT = 'YOUR_SINGLE_GAS_WEB_APP_URL_HERE'; 
const TASK_SHEET = 'MY-DAILY-TASK'; 
const APPLICATION_SHEET = 'APPLICATIONS';
const RECEIPT_SHEET = 'RECEIPTS_MERGE';

// --- Auth Credentials ---
const CORRECT_USERNAME = "Adil";
const CORRECT_PASSWORD = "1234"; 


// Sample data (ONLY for local display and functionality, submissions are now disabled)
let dailyWorkCombined = [
    { Client: 'Website Task 1 (Local)', Status: 'Pending', Date: '2025-11-16' },
    { Client: 'Website Task 2 (Local)', Status: 'Completed', Date: '2025-11-15' },
    { Client: 'Check Sidebar Links', Status: 'Pending', Date: '2025-11-16' },
];

const unappliedReceiptsData = [ /* ... */ ]; 
const stationeryDetailData = [ /* ... */ ];
const personalData = [ /* ... */ ];

// --- Navigation Structure ---
const sheets = [
    { name: "My Daily Task", id: "addNewTask", icon: "fas fa-list-check" },         
    { name: "Application Required", id: "appRequired", icon: "fas fa-file-invoice" },  
    { name: "Unapplied Receipts", id: "unappliedReceipts", icon: "fas fa-money-bill-transfer" }, 
    
    // Remaining old menu items
    { name: "STATIONERY DETAIL", id: "stationeryDetail", icon: "fas fa-pencil-ruler" },
    { name: "RAJNI RUKSANA CHQ's", id: "rajniRuksanaChqs", icon: "fas fa-file-contract" },
    { name: "MSQ RECEIPT'S", id: "msqReceipts", icon: "fas fa-receipt" },
    { name: "CHQ TO BE COLLECT", id: "chqToCollect", icon: "fas fa-calendar-check" },
    { name: "PERSONAL DATA", id: "personalData", icon: "fas fa-user-tie" }
];


// =================================================================
// 2. AUTHENTICATION LOGIC (UNCHANGED)
// =================================================================

function showCredentials(event) {
    event.preventDefault(); 
    const username = CORRECT_USERNAME;
    const password = CORRECT_PASSWORD;
    alert(
        "🔓 Control Panel Access Reminder:\n\n" +
        "Username: " + username + "\n" +
        "Password: " + password + "\n\n" +
        "If you need to change these credentials, you must edit the 'script.js' file directly."
    );
}


function checkLogin() {
    const usernameInput = document.getElementById('username-input').value;
    const passwordInput = document.getElementById('password-input').value;
    const errorMsg = document.getElementById('login-error');
    const appWrapper = document.getElementById('app-wrapper');
    const loginContainer = document.getElementById('login-container');

    if (usernameInput === CORRECT_USERNAME && passwordInput === CORRECT_PASSWORD) {
        loginContainer.style.display = 'none';
        appWrapper.style.display = 'flex'; 
        errorMsg.style.display = 'none';
        loadSheet('addNewTask', 'My Daily Task'); 
    } else {
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Invalid Username or Password. Please try again.';
        passwordInput.value = ''; 
    }
}


// =================================================================
// 3. LOCAL STATUS UPDATE (Restored Local Update)
// =================================================================

function toggleStatusLocal(rowIndex, currentStatus) {
    // This updates the local array instantly.
    const index = rowIndex; 
    dailyWorkCombined[index].Status = (currentStatus === 'Completed' ? 'Pending' : 'Completed');
    loadSheet('addNewTask', 'My Daily Task'); 
}


// =================================================================
// 4. CORE SUBMISSION HANDLERS (REMOVED FETCH/API CALLS)
// =================================================================

/** Reusable success handler */
function showSuccessScreen(taskType, targetSheet, loadNextId) {
    const container = document.getElementById('dataContainer');
    container.innerHTML = `
        <div class="form-container" style="text-align: center;">
            <h2>⚠️ Submission is Local Only</h2>
            <p>The form data was added to the website's local dashboard array but was NOT saved to the Google Sheet API.</p>
            <div style="display: flex; justify-content: center; gap: 15px; margin-top: 20px;">
                <button onclick="loadSheet('addNewTask', 'My Daily Task')" 
                        class="submit-btn" 
                        style="width: auto; background-color: #3498db;">
                    View Dashboard
                </button>
                <button onclick="loadSheetFormOnly('${loadNextId}', 'ADD NEW ${taskType.toUpperCase()}')" 
                        class="submit-btn" 
                        style="width: auto;">
                    Submit New Task
                </button>
            </div>
        </div>
    `;
}

/** Base handler: Now ONLY saves to the local array. */
function submitFormBase(formId, targetSheet, successMessage, loadNextId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    
    // --- LOCAL SUBMISSION ONLY ---
    if (formId === 'taskForm') {
        // Find the index of the item to ensure we get the correct data
         const newTask = {
            Client: formData.get('Client Name'),
            Status: 'Pending',
            Date: formData.get('Date'),
         };
         dailyWorkCombined.unshift(newTask); 
    }
    
    form.reset(); 
    showSuccessScreen(successMessage, targetSheet, loadNextId);
}

// Specific Submission Calls for each form
function submitTaskForm() {
    submitFormBase('taskForm', TASK_SHEET, 'Task', 'addNewTask');
}

function submitApplicationForm() {
    submitFormBase('applicationForm', APPLICATION_SHEET, 'Application', 'appRequired');
}

function submitReceiptForm() {
    submitFormBase('receiptForm', RECEIPT_SHEET, 'Receipt', 'unappliedReceipts');
}


// =================================================================
// 5. FORM RENDERING FUNCTIONS
// =================================================================
const getToday = () => new Date().toISOString().split('T')[0];

function renderTaskForm() {
    return `
        <h2>MY DAILY TASK ENTRY</h2>
        <div class="form-container">
            <form id="taskForm" onsubmit="event.preventDefault(); submitTaskForm();">
                <div class="form-group" style="display:none;">
                    <label for="newDate">Date (Auto):</label>
                    <input type="date" id="newDate" name="Date" value="${getToday()}" required>
                </div>
                <div class="form-group">
                    <label for="newClientName">Task/Client Name:</label>
                    <input type="text" id="newClientName" name="Client Name" required placeholder="e.g., Finalize design mockups">
                </div>
                <button type="submit" class="submit-btn">Save Task</button>
            </form>
        </div>
    `;
}
// ... other renderForm functions (omitted for brevity) ...


// =================================================================
// 6. DATA TABLE AND SWITCHING LOGIC (STABLE LOCAL RENDERING)
// =================================================================

function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toISOString().split('T')[0];
    } catch (e) {
        return 'N/A';
    }
}

function generateTableHTML(data, title, sheetId) { 
    
    if (sheetId === 'addNewTask') {
         const sortedData = data.sort((a, b) => {
             const statusA = (a.Status || '').toString().toLowerCase();
             const statusB = (b.Status || '').toString().toLowerCase();

             if (statusA === 'pending' && statusB !== 'pending') return -1;
             if (statusA !== 'pending' && statusB === 'pending') return 1;
             return 0; 
         });
         
         let tableHTML = `<h2 style="margin-top: 40px;">MY DAILY TASK PENDING LIST</h2>`;

         if (data.length === 0) return tableHTML + `<p>No local data available.</p>`;

         tableHTML += `<table class="data-table">
                          <thead><tr>
                          <th>Date</th>
                          <th>Client Name</th> 
                          <th>Status</th>
                          <th>Action</th>
                          </tr></thead><tbody>`;
         
         sortedData.forEach((item, index) => {
            const itemStatus = (item.Status || '').toString().trim().toLowerCase();
            const isCompleted = itemStatus === 'completed';
            
            tableHTML += `<tr>
                <td>${formatDate(item.Date)}</td>
                <td>${item.Client || 'N/A'}</td>
                <td class="status-cell ${isCompleted ? 'status-complete-text' : 'status-pending-text'}">
                    ${(item.Status || 'PENDING').toUpperCase()}
                </td>
                <td>
                    ${isCompleted
                        ? `<span class="completed-text">✅ Done</span>` 
                        : `<button class="action-btn check-btn" onclick="toggleStatusLocal(${index}, 'Pending')" title="Mark Complete">&#10003;</button>`
                    }
                </td>
            </tr>`;
        });
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }
    
    if (data.length === 0) return `<h2>${title}</h2><p>No data available.</p>`;
    return `<h2>${title}</h2><p>Table view for ${sheetId} is not yet implemented. Using local data.</p>`;
}

/** Loads only the form view. */
function loadSheetFormOnly(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    if (sheetId === 'addNewTask') {
        container.innerHTML = renderTaskForm();
    } 
    // ... other form loading logic ...
}


// Loads local data instantly, no API call
function loadSheet(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    const mainHeader = document.getElementById('mainTitleHeader'); 
    
    if (mainHeader) mainHeader.style.display = 'none';

    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    // --- Core Logic: Render Form and Local Data ---
    if (sheetId === 'addNewTask') {
        // Renders the form + the local dailyWorkCombined array instantly
        container.innerHTML = renderTaskForm() + generateTableHTML(dailyWorkCombined, 'My Daily Task', sheetId);

    } 
    
    else {
        container.innerHTML = generateTableHTML(dailyWorkCombined, sheetName, 'addNewTask'); 
    }
}


// =================================================================
// 7. TYPING ANIMATION AND INITIALIZATION (UNCHANGED)
// =================================================================
const textElement = document.getElementById('typewriterText');
const textToType = "Welcome to the AD Data Manager";
const typingSpeed = 100; 
const pauseTime = 5000; 

let charIndex = 0;

function typeWriter() {
    if (!textElement) return; 
    if (charIndex < textToType.length) {
        textElement.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeWriter, typingSpeed);
    } else {
        setTimeout(startDeleting, pauseTime);
    }
}
function startDeleting() {
    if (charIndex > 0) {
        textElement.textContent = textToType.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(startDeleting, typingSpeed / 2); 
    } else {
        setTimeout(typeWriter, 500); 
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const sheetList = document.getElementById('sheetList');
    sheets.forEach(sheet => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = "#"; 
        link.id = sheet.id;
        
        const icon = document.createElement('i');
        icon.className = sheet.icon + ' nav-icon'; 
        
        link.appendChild(icon); 
        link.appendChild(document.createTextNode(sheet.name)); 

        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadSheet(sheet.id, sheet.name);
        });
        listItem.appendChild(link);
        sheetList.appendChild(listItem);
    });
    
    const mainHeader = document.getElementById('mainTitleHeader');
    if (mainHeader) {
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) loginContainer.style.display = 'flex';
    }

    typeWriter(); 
});
