# AccrediVault — NAAC/NBA Accreditation Evidence Repository

**AccrediVault** is a manually operated web application prototype designed for colleges and universities to digitally manage NAAC (National Assessment and Accreditation Council) and NBA (National Board of Accreditation) evidence through a centralized repository, paperless approval workflow, digital signature simulation, and tamper-evident audit trail.

---

## 🌟 Key Features

1. **Role-Based Access Control**
   - **Faculty:** Upload accreditation evidence, view submission status, and resubmit rejected evidence.
   - **HOD:** Review department evidence and approve or reject submissions with remarks.
   - **Principal:** Give final approval, execute digital signature simulation, and view signed evidence.
   - **NAAC/NBA Coordinator:** View the repository, search and filter evidence, and monitor accreditation progress.
   - **Admin:** Manage users and system settings and view audit logs.

2. **Paperless Approval Workflow**
   - Sequential process: `Faculty Upload → HOD Review → Principal Review → Digital Signature Simulation → Approved`.
   - Approval notes and rejection reasons are recorded at each stage.

3. **Digital Signature Simulation**
   - Displays document details, signer information, role, timestamp, document ID, signature reference ID, and signature status.
   - Simulates a signing workflow and marks the document as digitally signed and approved.

4. **Tamper-Evident SHA-256 Audit Trail**
   - Uses a cryptographic hash chain to link audit events.
   - Includes audit integrity verification and a simulated tampering demonstration.

5. **Central Repository and Multi-Filter Search**
   - Search by document titles, IDs, and keywords.
   - Filter by department, NAAC/NBA criteria (I–VII), academic year, and approval status.

6. **Public Document and QR Code Verification**
   - Provides a verification ID and QR code for documents.
   - Includes a verification interface for viewing document status and available approval metadata.

---

## 🔑 Demo Credentials

| Role | Email | Password | User Name |
|---|---|---|---|
| Faculty | `faculty@demo.com` | `faculty123` | Prof. Rajesh Kumar |
| HOD | `hod@demo.com` | `hod123` | Dr. Sunita Rao |
| Principal | `principal@demo.com` | `principal123` | Dr. A. K. Sharma |
| Coordinator | `coordinator@demo.com` | `coordinator123` | Prof. Meena Reddy |
| Admin | `admin@demo.com` | `admin123` | System Administrator |

*These are demo credentials for the prototype. Do not use real passwords or sensitive information.*

---

## 🚀 How to Run the Application

### Prerequisites
- Node.js (v18 or later recommended)
- npm

### Install Dependencies

```bash
npm install
```

### Start the Application

Run the backend server and frontend client concurrently:

```bash
npm run dev
```

Alternatively, run them in separate terminal windows:

**Backend:**
```bash
npm run server
```

**Frontend:**
```bash
npm run client
```

Open the application at `http://localhost:3000`.

*These commands assume the scripts are configured in `package.json` as described.*

---

## 📁 Project Structure

```text
naac-nba-repository/
├── index.html
├── package.json
├── vite.config.js
├── server/
│   ├── index.js
│   ├── db.js
│   ├── accreditation.db
│   └── services/
│       └── auditService.js
└── src/
    ├── App.jsx
    ├── main.jsx
    ├── index.css
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── Navbar.jsx
    │   ├── Sidebar.jsx
    │   ├── QuickRoleSwitcher.jsx
    │   ├── DigitalSignatureModal.jsx
    │   └── DocumentDetailModal.jsx
    └── pages/
        ├── Login.jsx
        ├── Dashboard.jsx
        ├── Upload.jsx
        ├── Workflow.jsx
        ├── Repository.jsx
        ├── AuditTrail.jsx
        └── Verification.jsx
```

---

## 📋 Recommended Demonstration Flow

1. Sign in as Faculty using the demo credentials.
2. Upload evidence and observe the submission status.
3. Switch to HOD and review the evidence.
4. Approve the document and check the next workflow stage.
5. Sign in as Principal and complete the digital signature simulation.
6. Open the audit trail and run the integrity verification.
7. Search and filter documents in the evidence repository.
8. Open the QR document verification interface.

**Note:** Digital signatures, audit integrity, and QR verification should be described as simulations or implemented features according to what the application actually does. A simulated signature is not equivalent to a legally validated digital signature.
