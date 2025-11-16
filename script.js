// =================================================================
// 1. CONFIGURATION & DATA (UPDATED)
// =================================================================

// *** CRITICAL: YOUR DEPLOYED GAS WEB APP URL ***
const GAS_WEB_APP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbyJn2Jfap7egvSAo4wyYxh0lDqbM-EU-cdBrPmA6UCFhUbrnfYXgnSoLK-QM5Y_SNGv/exec'; 
const TASK_SHEET = 'MY-DAILY-TASK'; 
const APPLICATION_SHEET = 'APPLICATIONS';
const RECEIPT_SHEET = 'RECEIPTS_MERGE';
;
// --- Auth Credentials ---
const CORRECT_USERNAME = "Lac.Adil";
const CORRECT_PASSWORD = "Bannu@123"; 


// Sample data (temporary fallback only, used if GAS fetch fails)
let dailyWorkCombined = [
    { Client: 'Sample Client (Local Fallback)', Status: 'Pending', Date: '2025-11-14' },
    { Client: 'Example Co (Local Fallback)', Status: 'Completed', Date: '2025-11-13' },
];

const unappliedReceiptsData = [ /* ... */ ]; 
const stationeryDetailData = [ /* ... */ ];
const personalData = [ /* ... */ ];;

// --- Navigation Structure (UNCHANGED) ---
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
// 3. CORE UPDATE LOGIC (NEW)
// =================================================================

/** * Marks a task as 'Completed' permanently in the Google Sheet.
 * @param {number} rowIndex The 1-based row index in the spreadsheet.
 */
async function markCompleteLive(rowIndex) {
    const confirmUpdate = confirm("Mark this task as COMPLETE?");
    
    if (!confirmUpdate) return;

    const container = document.getElementById('dataContainer');
    container.innerHTML = '<h2>Updating...</h2><p style="text-align:center;">Marking task as complete in Google Sheet.</p>';

    try {
        const response = await fetch(GAS_WEB_APP_ENDPOINT, {
            method: 'POST',
            body: JSON.stringify({ 
                action: 'updateStatus', 
                targetSheet: TASK_SHEET, 
                rowIndex: rowIndex,
                newStatus: 'Completed' // The new status value
            }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const responseText = await response.text();
        const data = JSON.parse(responseText);
        
        if (data.success) {
            alert("Task marked complete successfully!");
            // Reload the sheet to display the updated live data
            loadSheet('addNewTask', 'My Daily Task'); 
        } else {
            throw new Error(data.message || 'Update failed on server.');
        }
    } catch (error) {
        alert(`Error updating data: ${error.message}`);
        console.error('Update Error:', error);
        loadSheet('addNewTask', 'My Daily Task'); 
    }
}

// NOTE: The deleteRowLive function has been removed as per the user's request to switch to Mark Complete.


// =================================================================
// 4. CORE SUBMISSION HANDLERS (UNCHANGED)
// =================================================================
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

function submitTaskForm() {
    submitFormBase('taskForm', TASK_SHEET, 'Task', 'addNewTask');
}
// ... other submitForm functions (omitted for brevity) ...


// =================================================================
// 5. FORM RENDERING FUNCTIONS (UNCHANGED)
// =================================================================
const getToday = () => new Date().toISOString().split('T')[0];
// ... renderTaskForm and others (omitted for brevity) ...


// =================================================================
// 6. DATA TABLE AND SWITCHING LOGIC (UPDATED)
// =================================================================

/**
 * Converts ISO 8601 string (from GSheet) to a simple YYYY-MM-DD date.
 */
function formatDate(isoString) {
    if (!isoString) return 'N/A';
    try {
        // Creates a Date object, converts it to YYYY-MM-DD string
        return new Date(isoString).toISOString().split('T')[0];
    } catch (e) {
        return 'N/A';
    }
}

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
         });;
         
         let tableHTML = `<h2 style="margin-top: 40px;">MY DAILY TASK PENDING LIST</h2>`;

         if (data.length === 0) return tableHTML + `<p>No data available from sheet.</p>`;

         tableHTML += `<table class="data-table">
                          <thead><tr>
                          <th>Date</th>
                          <th>Client Name</th>
                          <th>Status</th>
                          <th>Action</th> </tr></thead><tbody>`;
         
         sortedData.forEach(item => {
            const itemStatus = (item.Status || '').toString().trim().toLowerCase();
            const isCompleted = itemStatus === 'completed';
            
            tableHTML += `<tr>
                <td>${formatDate(item.Date)}</td>
                <td>${item['Client Name'] || 'N/A'}</td>
                <td class="status-cell ${isCompleted ? 'status-complete-text' : 'status-pending-text'}">
                    ${(item.Status || 'PENDING').toUpperCase()}
                </td>
                <td>
                    ${isCompleted
                        ? `<span class="completed-text">✅ Done</span>` // Shows tick and text for completed
                        : `<button class="action-btn check-btn" onclick="markCompleteLive(${item.rowIndex})" title="Mark Complete">&#10003;</button>` // Mark Complete Button
                    }
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
    
    else {
        container.innerHTML = generateTableHTML(dailyWorkCombined, sheetName, 'addNewTask'); 
    }
}


// =================================================================
// 7. TYPING ANIMATION AND INITIALIZATION (UNCHANGED)
// =================================================================
// ... (Typing animation and DOMContentLoaded logic remains unchanged) ...
