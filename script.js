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


// Sample data (temporary fallback only, used if GAS fetch fails)
// NOTE: This array is only used as a fallback if the live data fetch fails.
let dailyWorkCombined = [
    { Client: 'Sample Client (Local Fallback)', Status: 'Pending', Date: '2025-11-14' },
    { Client: 'Example Co (Local Fallback)', Status: 'Completed', Date: '2025-11-13' },
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
// NOTE: This function currently won't work correctly with live data 
// because we lack a unique ID from the sheet. This is a placeholder.
// =================================================================
function toggleStatusLocal(rowIndex, currentStatus) {
    alert("Warning: Marking complete is a placeholder. To make this permanent, we need to implement a GAS function to update the sheet row based on its index.");
    // In a final version, this should send an UPDATE request to GAS with the row index.
    
    // Fallback: If we assume the data array matches the current display...
    // const index = rowIndex; // We are passing the array index as ID for now
    // dailyWorkCombined[index].Status = (currentStatus === 'Completed' ? 'Pending' : 'Completed');
    // loadSheet('addNewTask', 'My Daily Task'); 
}


// =================================================================
// 4. CORE SUBMISSION HANDLERS
// =================================================================

/** Reusable success handler (UPDATED BUTTONS) */
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
        
        // Response should be JSON from GAS (must implement createJsonResponse in GAS)
        const responseText = await response.text();
        const data = JSON.parse(responseText);

        if (data.success) {
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
// 6. DATA TABLE AND SWITCHING LOGIC (UPDATED FOR LIVE DATA)
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
        
        // Must read response as text first, then parse as JSON to handle common GAS response issues
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (data.success && Array.isArray(data.data)) {
            return data.data; // Returns the array of objects from the sheet
        } else {
            console.error("GAS Fetch Error:", data.message || "Data not returned successfully.");
            return [];
        }
    } catch (error) {
        console.error("Network or Fetch Failed:", error);
        alert("Could not load live data. Displaying local fallback data.");
        // Use the local mock data as a fallback
        return dailyWorkCombined; 
    }
}


function generateTableHTML(data, title, sheetId) { 
    
    if (sheetId === 'addNewTask') {
         // Filter and sort the data for better display (Pending tasks first)
         const sortedData = data.sort((a, b) => {
             // Access Status property safely, handling null/undefined values
             const statusA = (a.Status || '').toString().toLowerCase();
             const statusB = (b.Status || '').toString().toLowerCase();

             if (statusA === 'pending' && statusB !== 'pending') return -1;
             if (statusA !== 'pending' && statusB === 'pending') return 1;
             return 0; 
         });
         
         let tableHTML = `<h2 style="margin-top: 40px;">MY DAILY TASK PENDING LIST</h2>`;

         if (data.length === 0) return tableHTML + `<p>No data available from sheet. Have you added headers (Date, Client Name, Status) in Row 1?</p>`;

         tableHTML += `<table class="data-table">
                          <thead><tr>
                          <th>Date</th>
                          <th>Client</th>
                          <th>Status</th>
                          <th>Action</th>
                          </tr></thead><tbody>`;
         
         sortedData.forEach((item, index) => {
            // Ensure status is treated as a string for comparison
            const itemStatus = (item.Status || '').toString().trim().toLowerCase();
            const isCompleted = itemStatus === 'completed';
            
            // NOTE: Using index + 2 as a mock row reference (row 1 is header)
            tableHTML += `<tr>
                <td>${item.Date || 'N/A'}</td>
                <td>${item['Client Name'] || 'N/A'}</td>
                <td class="status-cell ${isCompleted ? 'status-complete-text' : 'status-pending-text'}">
                    ${(item.Status || 'PENDING').toUpperCase()}
                </td>
                <td>
                    ${isCompleted 
                        ? `<span class="completed-text">✅ Done</span>` 
                        // The action button uses the row index + 2 (since sheet starts at row 1)
                        : `<button class="action-btn check-btn" onclick="toggleStatusLocal(${index}, 'Pending')" title="Mark Complete">&#10003;</button>`}
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

/** * NEW: Loads only the form view, used after a successful submission.
 */
function loadSheetFormOnly(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    // Ensure the navigation link is active
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    // Only load the form without the table below it
    if (sheetId === 'addNewTask') {
        container.innerHTML = renderTaskForm();
    } else if (sheetId === 'appRequired') {
        container.innerHTML = renderApplicationForm();
    } else if (sheetId === 'unappliedReceipts') {
        container.innerHTML = renderReceiptForm();
    }
}


// UPDATED: Now an async function that fetches live data before rendering
async function loadSheet(sheetId, sheetName) {
    const container = document.getElementById('dataContainer');
    const mainHeader = document.getElementById('mainTitleHeader'); 
    
    if (mainHeader) mainHeader.style.display = 'none';

    // Reset Nav Links
    document.querySelectorAll('.sidebar li a').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.getElementById(sheetId);
    if (activeLink) activeLink.classList.add('active');
    
    // Show Loading state while fetching data
    container.innerHTML = '<h2>Loading Data...</h2><p style="text-align:center;">Please wait while we fetch the latest information.</p>';


    // --- Core Logic: Fetch and Display ---
    if (sheetId === 'addNewTask') {
        // Fetch live task data using the doGet method via GAS
        const liveTaskData = await fetchSheetData(TASK_SHEET); 
        
        // RENDER BOTH THE FORM AND THE LIVE TASK LIST TABLE
        container.innerHTML = renderTaskForm() + generateTableHTML(liveTaskData, 'My Daily Task', sheetId);

    } else if (sheetId === 'appRequired') {
        container.innerHTML = renderApplicationForm();
    } else if (sheetId === 'unappliedReceipts') {
        container.innerHTML = renderReceiptForm();
    }
    // Load Views 
    else if (sheetId === 'stationeryDetail') {
        container.innerHTML = generateTableHTML(dailyWorkCombined, sheetName, sheetId);
    } 
    // Load Default/Fallback Views
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
