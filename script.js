// =================================================================
// 1. CONFIGURATION & DATA (UPDATED)
// =================================================================

// *** CRITICAL: YOUR DEPLOYED GAS WEB APP URL ***
const GAS_WEB_APP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxAa1G9U6AAc-e25xCxFmdmgx9cNk-EXXyk6jixWQ-tFeR3A5RoEp10PMEuzgiW-u77/exec'; 
const TASK_SHEET = 'MY-DAILY-TASK'; // CORRECTED to match your GSheet tab name
const APPLICATION_SHEET = 'APPLICATIONS';
const RECEIPT_SHEET = 'RECEIPTS_MERGE';

// --- Auth Credentials ---
const CORRECT_USERNAME = "Adil";
const CORRECT_PASSWORD = "1234"; 


// Sample data (temporary, for display only)
let dailyWorkCombined = [
    { id: 1, Client: 'Sample Client', Status: 'Pending', Date: '2025-11-14' },
    { id: 2, Client: 'Example Co', Status: 'Completed', Date: '2025-11-13' },
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
        // SUCCESS: Hide login, show app
        loginContainer.style.display = 'none';
        appWrapper.style.display = 'flex'; // Sets the wrapper to show the app
        errorMsg.style.display = 'none';
        
        // Load the initial dashboard view (My Daily Task)
        loadSheet('addNewTask', 'My Daily Task'); 
    } else {
        // FAILURE: Show error message
        errorMsg.style.display = 'block';
        errorMsg.textContent = 'Invalid Username or Password. Please try again.';
        passwordInput.value = ''; // Clear password field
    }
}


// =================================================================
// 3. LOCAL STATUS UPDATE (Working Tick - Temporary)
// =================================================================
function toggleStatusLocal(itemId, currentStatus) {
    const index = dailyWorkCombined.findIndex(item => item.id === itemId);
    if (index > -1) {
        dailyWorkCombined[index].Status = (currentStatus === 'Completed' ? 'Pending' : 'Completed');
        loadSheet('addNewTask', 'My Daily Task'); 
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
                <button onclick="loadSheet('${loadNextId}', 'ADD NEW ${taskType.toUpperCase()}')" 
                        class="submit-btn" 
                        style="width: auto;">
                    Submit New ${taskType}
                </button>
            </div>
        </div>
    `;
}

/** Base handler for all form submissions */
async function submitFormBase(formId, targetSheet, successMessage, loadNextId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    
    // Add the target sheet name to the form data for the GAS script
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
        
        const data = await response.json(); 

        if (data.success) {
            
            // --- Local update for immediate feedback on the task dashboard ---
            if (formId === 'taskForm') {
                 // Mock adding a new item to the local list (since we aren't fetching the real list yet)
                 const newTask = {
                    id: dailyWorkCombined.length + 1, // Simple mock ID
                    Client: formData.get('Client Name'),
                    Status: 'Pending',
                    Date: formData.get('Date'),
                 };
                 dailyWorkCombined.unshift(newTask); // Add to the start
            }
            // --- End Local Update ---

            form.reset(); 
            showSuccessScreen(successMessage, targetSheet, loadNextId);
        } else {
            // Handle error messages returned by the GAS script
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

function renderApplicationForm() {
    return `
        <h2>NEW APPLICATION ENTRY</h2>
        <div class="form-container">
            <form id="applicationForm" onsubmit="event.preventDefault(); submitApplicationForm();">
                <div class="form-group">
                    <label for="applicantNo">Applicant No:</label>
                    <input type="text" id="applicantNo" name="Applicant No" required placeholder="e.g., APP-001">
                </div>
                
                <input type="hidden" name="Status" value="Pending">
                
                <button type="submit" class="submit-btn">Save Application</button>
            </form>
        </div>
    `;
}

function renderReceiptForm() {
    return `
        <h2>ADD NEW UNAPPLIED RECEIPT</h2>
        <div class="form-container">
            <form id="receiptForm" onsubmit="event.preventDefault(); submitReceiptForm();">
                
                <div class="form-group">
                    <label for="newCustomerName">Customer Name:</label>
                    <input type="text" id="newCustomerName" name="Customer Name" required placeholder="e.g., Acme Corp">
                </div>
                
                <div class="form-group">
                    <label for="newChqNo">CHQ No:</label>
                    <input type="text" id="newChqNo" name="CHQ No" required placeholder="e.g., 804567">
                </div>

                <div class="form-group">
                    <label for="newAmount">Amount:</label>
                    <input type="number" id="newAmount" name="Amount" required step="0.01" placeholder="e.g., 980.50">
                </div>
                
                <div class="form-group">
                    <label for="newResponsibility">Responsibility:</label>
                    <input type="text" id="newResponsibility" name="Responsibility" required placeholder="e.g., Sales Team / John Doe">
                </div>
                
                <div class="form-group">
                    <label for="newEmail">Contact Email:</label>
                    <input type="email" id="newEmail" name="Email" required placeholder="e.g., contact@customer.com">
                </div>
                
                <button type="submit" class="submit-btn">Save Receipt</button>
            </form>
        </div>
    `;
}


// =================================================================
// 6. DATA TABLE AND SWITCHING LOGIC
// =================================================================

function generateTableHTML(data, title, sheetId) { 
    
    if (sheetId === 'addNewTask') {
         // Filter and sort the data for better display (Pending tasks first)
         const sortedData = data.sort((a, b) => {
             if (a.Status === 'Pending' && b.Status !== 'Pending') return -1;
             if (a.Status !== 'Pending' && b.Status === 'Pending') return 1;
             return 0; 
         });
         
         let tableHTML = `<h2 style="margin-top: 40px;">MY DAILY TASK PENDING LIST</h2>`;

         if (data.length === 0) return tableHTML + `<p>No data available.</p>`;

         tableHTML += `<table class="data-table">
                          <thead><tr>
                          <th>Date</th>
                          <th>Client</th>
                          <th>Status</th>
                          <th>Action</th>
                          </tr></thead><tbody>`;
         
         sortedData.forEach(item => {
            const isCompleted = item.Status === 'Completed';
            tableHTML += `<tr>
                <td>${item.Date}</td>
                <td>${item.Client}</td>
                <td class="status-cell ${isCompleted ? 'status-complete-text' : 'status-pending-text'}">
                    ${item.Status.toUpperCase()}
                </td>
                <td>
                    ${isCompleted 
                        ? `<span class="completed-text">✅ Done</span>` 
                        : `<button class="action-btn check-btn" onclick="toggleStatusLocal(${item.id}, 'Pending')" title="Mark Complete">&#10003;</button>`}
                </td>
            </tr>`;
        });
        tableHTML += `</tbody></table>`;
        return tableHTML;
    }
    
    // Fallback for other views
    if (data.length === 0) return `<h2>${title}</h2><p>No data available.</p>`;
    return `<h2>${title}</h2><p>Table view for ${sheetId} is not yet implemented. Use the form.</p>`;
}

function loadSheet(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    const mainHeader = document.getElementById('mainTitleHeader'); 
    
    if (mainHeader) mainHeader.style.display = 'none';

    // Reset Nav Links
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');

    // Load Forms
    if (sheetId === 'addNewTask') {
        // RENDER BOTH THE FORM AND THE TASK LIST TABLE
        container.innerHTML = renderTaskForm() + generateTableHTML(dailyWorkCombined, 'My Daily Task', sheetId);
    } else if (sheetId === 'appRequired') {
        container.innerHTML = renderApplicationForm();
    } else if (sheetId === 'unappliedReceipts') {
        container.innerHTML = renderReceiptForm();
    }
    // Load Views 
    else if (sheetId === 'stationeryDetail') {
        container.innerHTML = generateTableHTML(stationeryDetailData, sheetName, sheetId);
    } 
    // Load Default/Fallback Views
    else {
        container.innerHTML = generateTableHTML(dailyWorkCombined, sheetName, 'addNewTask'); // Show task list as default view
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
        
        // --- NEW: Create the icon element and append it ---
        const icon = document.createElement('i');
        icon.className = sheet.icon + ' nav-icon'; 
        
        link.appendChild(icon); // Add the icon before the text
        
        link.appendChild(document.createTextNode(sheet.name)); // Add the sheet name text
        // --- END NEW ---

        link.addEventListener('click', (e) => {
            e.preventDefault(); 
            loadSheet(sheet.id, sheet.name);
        });
        listItem.appendChild(link);
        sheetList.appendChild(listItem);
    });
    
    const mainHeader = document.getElementById('mainTitleHeader');
    if (mainHeader) {
        // Start login system by showing the login container
        const loginContainer = document.getElementById('login-container');
        if (loginContainer) loginContainer.style.display = 'flex';
    }

    typeWriter(); 
});
