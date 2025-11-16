// =================================================================
// 1. CONFIGURATION & DATA (UPDATED)
// =================================================================

// *** CRITICAL: YOUR DEPLOYED GAS WEB APP URL ***
const GAS_WEB_APP_ENDPOINT = 'https://script.google.com/macros/library/d/1w-TzFYgRZFbHLOWnnSCu7p9T6Xgdoda7d4A5jIhSuZI46e68dBV1HhPh/3'; 
const TASK_SHEET = 'MY-DAILY-TASK'; 
const APPLICATION_SHEET = 'APPLICATIONS';
const RECEIPT_SHEET = 'RECEIPTS_MERGE';

// --- Auth Credentials ---
const CORRECT_USERNAME = "Adil";
const CORRECT_PASSWORD = "1234"; 

// Sample data (temporary fallback only, used if GAS fetch fails)
let dailyWorkCombined = [
    { Client: 'Sample Client (Local Fallback)', Status: 'Pending', Date: '2025-11-14' },
    { Client: 'Example Co (Local Fallback)', Status: 'Completed', Date: '2025-11-13' },
];
// ... other unused data arrays ...


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
// 2. AUTHENTICATION LOGIC
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
// 3. CORE DELETION LOGIC (NEW)
// =================================================================

async function deleteRowLive(rowIndex) {
    const confirmDelete = confirm("Are you sure you want to PERMANENTLY delete this task? This cannot be undone.");
    
    if (!confirmDelete) return;

    // Show loading state for safety
    const container = document.getElementById('dataContainer');
    container.innerHTML = '<h2>Deleting...</h2><p style="text-align:center;">Processing permanent deletion from Google Sheet.</p>';


    try {
        const response = await fetch(GAS_WEB_APP_ENDPOINT, {
            method: 'POST',
            // Send the required parameters as JSON
            body: JSON.stringify({ 
                action: 'delete', 
                targetSheet: TASK_SHEET, 
                rowIndex: rowIndex 
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (data.success) {
            alert("Task deleted successfully!");
            // Reload the sheet to display the updated live data
            loadSheet('addNewTask', 'My Daily Task'); 
        } else {
            throw new Error(data.message || 'Deletion failed on server.');
        }
    } catch (error) {
        alert(`Error deleting data: ${error.message}`);
        console.error('Deletion Error:', error);
        loadSheet('addNewTask', 'My Daily Task'); // Reload in case of error
    }
}


// =================================================================
// 4. CORE SUBMISSION HANDLERS
// =================================================================

/** Reusable success handler */
function showSuccessScreen(taskType, targetSheet, loadNextId) {
    const container = document.getElementById('dataContainer');
    container.innerHTML = `
        <div class="form-container" style="text-align: center;">
            <h2>✅ ${taskType} Submitted Successfully!</h2>
            <p>Data saved to Google Sheet tab: <b>${targetSheet}</b></p>
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

/** Base handler for all form submissions */
async function submitFormBase(formId, targetSheet, successMessage, loadNextId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    
    formData.append('targetSheet', targetSheet); 
    
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Saving...';
    submitBtn.disabled = true;

    try {
        const response = await fetch(GAS_WEB_APP_ENDPOINT, {
            method: 'POST',
            body: formData,
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Response should be JSON from GAS
        const responseText = await response.text();
        const data = JSON.parse(responseText);

        if (data.success) {
            form.reset(); 
            showSuccessScreen(successMessage, targetSheet, loadNextId);
        } else {
            throw new Error(data.message || 'Submission failed on server.');
        }

    } catch (error) {
        alert(`Error saving data. Check GAS deployment. Message: ${error.message}`);
        console.error('Submission Error:', error);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
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
// ... other renderForm functions (omitted for brevity, they are unchanged) ...


// =================================================================
// 6. DATA TABLE AND SWITCHING LOGIC (LIVE FETCHING)
// =================================================================

/**
 * Fetches data from the Google Sheet via the GAS Web App's doGet method.
 */
async function fetchSheetData(sheetName) {
    const url = `${GAS_WEB_APP_ENDPOINT}?sheet=${sheetName}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (data.success && Array.isArray(data.data)) {
            return data.data; 
        } else {
            console.error("GAS Fetch Error:", data.message || "Data not returned successfully.");
            return [];
        }
    } catch (error) {
        console.error("Network or Fetch Failed:", error);
        alert("Could not load live data. Displaying local fallback data.");
        return dailyWorkCombined; 
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

         if (data.length === 0) return tableHTML + `<p>No data available from sheet.</p>`;

         tableHTML += `<table class="data-table">
                          <thead><tr>
                          <th>Date</th>
                          <th>Client</th>
                          <th>Status</th>
                          <th>Delete</th>
                          </tr></thead><tbody>`;
         
         sortedData.forEach(item => {
            const itemStatus = (item.Status || '').toString().trim().toLowerCase();
            const isCompleted = itemStatus === 'completed';
            
            tableHTML += `<tr>
                <td>${item.Date || 'N/A'}</td>
                <td>${item['Client Name'] || 'N/A'}</td>
                <td class="status-cell ${isCompleted ? 'status-complete-text' : 'status-pending-text'}">
                    ${(item.Status || 'PENDING').toUpperCase()}
                </td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteRowLive(${item.rowIndex})" title="Permanently Delete Task">🗑️</button>
                </td>
            </tr>`;
        });
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }
    
    if (data.length === 0) return `<h2>${title}</h2><p>No data available.</p>`;
    return `<h2>${title}</h2><p>Table view for ${sheetId} is not yet implemented. Use the form.</p>`;
}

/** Loads only the form view, used after a successful submission. */
function loadSheetFormOnly(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    if (sheetId === 'addNewTask') {
        container.innerHTML = renderTaskForm();
    } else if (sheetId === 'appRequired') {
        container.innerHTML = renderApplicationForm();
    } 
    // ... other form loading logic ...
}


// UPDATED: Now an async function that fetches live data before rendering
async function loadSheet(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    const mainHeader = document.getElementById('mainTitleHeader'); 
    
    if (mainHeader) mainHeader.style.display = 'none';

    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    container.innerHTML = '<h2>Loading Data...</h2><p style="text-align:center;">Please wait while we fetch the latest information.</p>';

    // --- Core Logic: Fetch and Display ---
    if (sheetId === 'addNewTask') {
        const liveTaskData = await fetchSheetData(TASK_SHEET); 
        
        container.innerHTML = renderTaskForm() + generateTableHTML(liveTaskData, 'My Daily Task', sheetId);

    } 
    // ... other sheet loading logic (omitted for brevity) ...
    
    else {
        container.innerHTML = generateTableHTML(dailyWorkCombined, sheetName, 'addNewTask'); 
    }
}


// =================================================================
// 7. TYPING ANIMATION AND INITIALIZATION
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
