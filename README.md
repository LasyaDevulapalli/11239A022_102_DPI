# AccrediVault — NAAC/NBA Accreditation Evidence Repository

**AccrediVault** is a complete, working, manually operated web application prototype designed for colleges and universities to digitally manage NAAC (National Assessment and Accreditation Council) and NBA (National Board of Accreditation) evidence through a centralized repository, paperless approval workflow, digital signature simulation, and tamper-evident audit trail.

---

## 🌟 Key Features

1. **Role-Based Access Control**:
   - **Faculty**: Upload accreditation evidence, view submission status, resubmit rejected evidence.
   - **HOD**: Review department evidence, approve or reject submissions with obligatory remarks.
   - **Principal**: Give final approval, execute digital signature simulation, view signed evidence.
   - **NAAC/NBA Coordinator**: View full repository, multi-filter & search evidence, monitor accreditation progress.
   - **Admin**: User & system management, view all documents & immutable audit logs.

2. **Paperless Approval Workflow**:
   - Sequential chain: `Faculty Upload → HOD Review → Principal Review → Digital Signature Simulation → Approved`.
   - Clear approval notes and rejection reasoning recorded at every stage.

3. **Digital Signature Simulation**:
   - Confirmation modal showing Document Name, Signer Name, Role, Timestamp, Document ID, Signature Reference ID, and Signature Status.
   - Applies PKI certificate simulation and seals document with `Digitally Signed / Approved` status.

4. **Tamper-Evident SHA-256 Audit Trail**:
   - Cryptographic hash chain linking every upload, approval, rejection, and digital signing event.
   - Built-in **Verify Audit Integrity** feature verifying the SHA-256 chain from genesis block to current head.
   - Includes a **Simulate Tamper Test** toggle to demonstrate tamper detection in action.

5. **Central Repository & Multi-Filter Search**:
   - Search across document titles, IDs, and keywords.
   - Filter by Department, NAAC/NBA Criteria (I to VII), Academic Year, and Approval Status.

6. **Public Document & QR Code Verification**:
   - Generates unique Verification ID & QR Code for every document.
   - Dedicated verification portal showing `✓ Document Verified`, approval timeline, and digital certificate metadata.

---

## 🔑 Demo Credentials

All roles are populated with realistic demo accounts:

| Role | Email | Password | User Name |
| :--- | :--- | :--- | :--- |
| **Faculty** | `faculty@demo.com` | `faculty123` | Prof. Rajesh Kumar |
| **HOD** | `hod@demo.com` | `hod123` | Dr. Sunita Rao |
| **Principal** | `principal@demo.com` | `principal123` | Dr. A. K. Sharma |
| **Coordinator** | `coordinator@demo.com` | `coordinator123` | Prof. Meena Reddy |
| **Admin** | `admin@demo.com` | `admin123` | System Administrator |

---

## 🚀 How to Run the Application

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server and Client
You can start both the Express backend server (`localhost:5000`) and the Vite client (`localhost:3000`) concurrently:

```bash
cmd.exe /c "npm run dev"
```

Or run them in separate terminal windows:

**Backend Server:**
```bash
cmd.exe /c "npm run server"
```

**Frontend Client:**
```bash
cmd.exe /c "npm run client"
```

Access the application in your browser at: **`http://localhost:3000`**

---

## 📁 Project Structure

```
naac-nba-repository/
├── index.html                   # HTML Entry Point & Tailwind CSS CDN
├── package.json                 # Node.js dependencies & scripts
├── vite.config.js               # Vite config with API proxy
├── server/
│   ├── index.js                 # Express server endpoints
│   ├── db.js                    # SQLite database init, schema & seeding
│   ├── accreditation.db         # SQLite database file
│   └── services/
│       └── auditService.js      # Cryptographic SHA-256 hash chain audit engine
└── src/
    ├── App.jsx                  # Main layout container & tab routing
    ├── main.jsx                 # React root entry point
    ├── index.css                # Custom CSS, glassmorphism & signature stamp styles
    ├── context/
    │   └── AuthContext.jsx      # Authentication & demo role state management
    ├── components/
    │   ├── Navbar.jsx           # Header with AccrediVault branding & user menu
    │   ├── Sidebar.jsx          # Role-filtered navigation sidebar
    │   ├── QuickRoleSwitcher.jsx # Demo role switcher toolbar
    │   ├── DigitalSignatureModal.jsx # Principal digital signature simulation modal
    │   └── DocumentDetailModal.jsx   # Document details drawer/modal
    └── pages/
        ├── Login.jsx            # Authentication page with demo credentials
        ├── Dashboard.jsx        # Analytics charts & executive metrics
        ├── Upload.jsx           # Faculty evidence upload form
        ├── Workflow.jsx         # Multi-level HOD & Principal review queue
        ├── Repository.jsx       # Central evidence repository with multi-filter
        ├── AuditTrail.jsx       # Tamper-evident hash chain & integrity verification
        └── Verification.jsx     # Public QR code & document verification portal
```

---

## 📋 Recommended Demonstration Flow (Manual Operation)

1. **Sign In as Faculty**: Login using `faculty@demo.com` / `faculty123`.
2. **Upload Evidence**: Click **Upload Evidence**, submit a new document (e.g., "Student Placement Report"). Note status becomes `Pending HOD Review`.
3. **Switch to HOD**: Click HOD profile on top role switcher or log in as `hod@demo.com` / `hod123`.
4. **Approve Document**: Open **Approval Workflow**, review the uploaded document and click **Approve**. Status changes to `Pending Principal Review`.
5. **Switch to Principal**: Log in as `principal@demo.com` / `principal123`.
6. **Apply Digital Signature**: Open **Approval Workflow**, click **Approve & Digitally Sign**. In the simulation modal, click **Apply Digital Signature**. Status becomes `Digitally Signed / Approved`.
7. **Verify Audit Trail**: Open **Audit Trail & Integrity**, click **Verify Audit Integrity** to see `✓ Audit Trail Integrity Verified`. Toggle **Simulate Tamper Test** to observe tamper detection.
8. **Filter Evidence Repository**: Open **Evidence Repository**, search or filter by Department, Criterion, Academic Year, or Status.
9. **QR Code Verification**: Open **QR Document Verification** or click **Verify** on any document to see the QR code and `✓ Document Verified` badge.
