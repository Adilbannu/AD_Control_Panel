# 📊 AD Control Panel Dashboard

## Task Management and Data Entry System

This is a live, secure web application designed for streamlined internal data management, task tracking, and specialized data submission (Tasks, Applications, Receipts). The application uses modern front-end practices and is entirely powered by Google Sheets, eliminating the need for a traditional server backend.

---

### Key Achievements

* **Secure Client-Side Login:** Implemented a JavaScript authentication layer to protect the application from public access.
* **Zero-Cost Backend (GAS):** Utilizes Google Apps Script (GAS) as a robust, free serverless endpoint for receiving and routing data.
* **Multi-Form Routing:** Uses a single GAS endpoint to efficiently save three different types of data (Tasks, Applications, Receipts) to their dedicated tabs within the Google Sheet.
* **Smooth UX:** Achieved non-redirecting (AJAX) form submissions, ensuring the user remains on the dashboard after saving data.
* **Professional UI:** Features a responsive layout, custom CSS icon animation, and a dynamic typing welcome screen.

---

### 💻 Technologies & Setup

| Category | Technology | Purpose in Project |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Structure, styling, and all dynamic behavior (animations, navigation). |
| **Data Layer** | Google Sheets | Acts as the simple, central database for all structured records. |
| **API** | Google Apps Script (GAS) | The serverless "backend" for handling all data routing (`doPost`) and retrieval (`doGet`). |
| **Hosting** | GitHub Pages | Free, fast, and reliable static site hosting. |

---

### 🌐 Live Deployment & Access

**Your Live Control Panel URL:**
[Link to your live GitHub Pages site here]

**Access Credentials (Case-Sensitive):**
* **Username:** `Adil`
* **Password:** `1234`

---

### 📝 Data Structure Configuration

The application is structured to write data to three distinct tabs in your linked Google Sheet:

| Form Name | JavaScript Target | Required Sheet Headers |
| :--- | :--- | :--- |
| **My Daily Task** | `DAILY_TASKS` | `Date`, `Client Name`, `Status` |
| **Application Required** | `APPLICATIONS` | `Applicant No`, `Status` |
| **Unapplied Receipts** | `RECEIPTS_MERGE` | `Customer Name`, `CHQ No`, `Amount`, `Responsibility`, `Email` |

---

### 🤝 Author

**Adil**
