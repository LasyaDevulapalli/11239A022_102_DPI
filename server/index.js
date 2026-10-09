import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDb, query, getOne, run, computeHash } from './db.js';
import { recordAuditEvent, verifyAuditIntegrity } from './services/auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.pdf';
    cb(null, `EVIDENCE-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ storage });

// Role Verification Middleware
const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    const roleHeader = req.headers['x-user-role'] || req.body.user_role;
    if (!roleHeader || !allowedRoles.includes(roleHeader)) {
      return res.status(403).json({
        error: `403 — Access Denied: Your role ('${roleHeader || 'Unauthenticated'}') is not authorized for this action.`
      });
    }
    next();
  };
};

// Initialize DB on server start
initDb().then(() => {
  console.log('Database initialized successfully.');
}).catch((err) => {
  console.error('Database initialization error:', err);
});

// --- PUBLIC & SHARED ROUTE: DEPARTMENTS & FORM OPTIONS ---
app.get('/api/departments', async (req, res) => {
  try {
    const depts = await query(`SELECT * FROM departments WHERE active = 1 ORDER BY name ASC`);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/upload/options', async (req, res) => {
  try {
    const depts = await query(`SELECT * FROM departments WHERE active = 1 ORDER BY name ASC`);
    const criteria = [
      'Criterion I: Curricular Aspects',
      'Criterion II: Teaching-Learning & Evaluation',
      'Criterion III: Research, Innovations & Extension',
      'Criterion IV: Infrastructure & Learning Resources',
      'Criterion V: Student Support & Progression',
      'Criterion VI: Governance, Leadership & Management',
      'Criterion VII: Institutional Values & Best Practices'
    ];
    const academicYears = ['2025-26', '2024-25', '2023-24'];
    const docTypes = [
      'Syllabus & Curriculum',
      'Workshop & Pedagogy Report',
      'Research Paper Publication',
      'Lab Audit & Maintenance',
      'Student Placement & Alumni',
      'Examination & Evaluation Log',
      'Environmental Audit'
    ];

    res.json({
      departments: depts,
      criteria,
      academicYears,
      docTypes
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUTH & USER ROUTES ---
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await query(`SELECT id, name, email, role, department, avatar FROM users`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await getOne(`SELECT * FROM users WHERE email = ?`, [email.toLowerCase().trim()]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Record Audit Login Event
    await recordAuditEvent({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'User Logged In',
      docId: 'SYS-AUTH',
      docTitle: 'Session Authentication',
      details: `User ${user.name} (${user.role}) logged in successfully.`
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DASHBOARD METRICS ROUTE ---
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const totalDocs = await getOne(`SELECT COUNT(*) as count FROM documents`);
    const pendingDocs = await getOne(`SELECT COUNT(*) as count FROM documents WHERE status LIKE 'Pending%'`);
    const approvedDocs = await getOne(`SELECT COUNT(*) as count FROM documents WHERE status = 'Digitally Signed / Approved'`);
    const rejectedDocs = await getOne(`SELECT COUNT(*) as count FROM documents WHERE status LIKE 'Rejected%'`);

    // Department Breakdown
    const deptStats = await query(`
      SELECT department, COUNT(*) as count
      FROM documents
      GROUP BY department
    `);

    // Status Breakdown
    const statusStats = await query(`
      SELECT status, COUNT(*) as count
      FROM documents
      GROUP BY status
    `);

    // Criteria Breakdown
    const criteriaStats = await query(`
      SELECT criterion, COUNT(*) as count
      FROM documents
      GROUP BY criterion
    `);

    // Recent Activity
    const recentActivities = await query(`
      SELECT * FROM audit_trail ORDER BY id DESC LIMIT 8
    `);

    res.json({
      total: totalDocs.count,
      pending: pendingDocs.count,
      approved: approvedDocs.count,
      rejected: rejectedDocs.count,
      accreditationProgress: Math.min(100, Math.round((approvedDocs.count / (totalDocs.count || 1)) * 100)),
      departmentStats: deptStats,
      statusStats: statusStats,
      criteriaStats: criteriaStats,
      recentActivities
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DOCUMENT REPOSITORY & SEARCH ROUTES ---
app.get('/api/documents', async (req, res) => {
  try {
    const { search, department, criterion, year, status } = req.query;

    let sql = `SELECT * FROM documents WHERE 1=1`;
    let params = [];

    if (search) {
      sql += ` AND (title LIKE ? OR description LIKE ? OR id LIKE ? OR verification_id LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (department && department !== 'All') {
      sql += ` AND department = ?`;
      params.push(department);
    }
    if (criterion && criterion !== 'All') {
      sql += ` AND criterion = ?`;
      params.push(criterion);
    }
    if (year && year !== 'All') {
      sql += ` AND academic_year = ?`;
      params.push(year);
    }
    if (status && status !== 'All') {
      sql += ` AND status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY uploaded_at DESC`;

    const documents = await query(sql, params);
    res.json(documents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/documents/:id', async (req, res) => {
  try {
    const doc = await getOne(`SELECT * FROM documents WHERE id = ? OR verification_id = ?`, [req.params.id, req.params.id]);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const auditLogs = await query(`SELECT * FROM audit_trail WHERE doc_id = ? ORDER BY id ASC`, [doc.id]);

    res.json({ document: doc, auditLogs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DOCUMENT UPLOAD ROUTE (FACULTY / ADMIN / COORDINATOR) ---
app.post('/api/documents', upload.single('file'), authorizeRole(['Faculty', 'Admin', 'NAAC/NBA Coordinator']), async (req, res) => {
  try {
    const {
      title,
      description,
      department,
      criterion,
      academic_year,
      doc_type,
      uploaded_by,
      uploaded_by_name
    } = req.body;

    const file = req.file;
    const count = await getOne(`SELECT COUNT(*) as total FROM documents`);
    const nextSeq = count.total + 1;
    const deptPrefix = (department || 'GEN').split(' ')[0].substring(0, 4).toUpperCase();
    const id = `DOC-2026-${deptPrefix}-${String(nextSeq).padStart(3, '0')}`;
    const verificationId = `VER-${Math.floor(1000 + Math.random() * 9000)}-${deptPrefix}-${String(nextSeq).padStart(3, '0')}`;

    const uploadedAt = new Date().toISOString();
    const fileName = file ? file.filename : `${id}.pdf`;
    const filePath = file ? `/uploads/${file.filename}` : `/uploads/${id}.pdf`;
    const fileSize = file ? file.size : 1048576;
    const initialStatus = 'Pending HOD Review';

    const documentHash = computeHash(`${id}:${title}:${uploadedAt}:${uploaded_by}`);

    await run(`
      INSERT INTO documents (
        id, verification_id, title, description, department, criterion, academic_year, doc_type,
        file_name, file_path, file_size, status, uploaded_by, uploaded_by_name, uploaded_at, document_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, verificationId, title, description, department, criterion, academic_year, doc_type,
      fileName, filePath, fileSize, initialStatus, uploaded_by, uploaded_by_name, uploadedAt, documentHash
    ]);

    // Record Audit Event
    await recordAuditEvent({
      userId: uploaded_by,
      userName: uploaded_by_name || 'Faculty Member',
      userRole: req.headers['x-user-role'] || 'Faculty',
      action: 'Document Uploaded',
      docId: id,
      docTitle: title,
      details: `New accreditation evidence uploaded for ${department} under ${criterion}. Status set to Pending HOD Review.`
    });

    const newDoc = await getOne(`SELECT * FROM documents WHERE id = ?`, [id]);
    res.status(201).json(newDoc);
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- WORKFLOW APPROVAL ROUTES (STRICT RBAC) ---

// 1. HOD Review (Approve or Reject) — HOD or Admin ONLY
app.post('/api/documents/:id/hod-approve', authorizeRole(['HOD', 'Admin']), async (req, res) => {
  try {
    const { action, remarks, user_id, user_name } = req.body;
    const doc = await getOne(`SELECT * FROM documents WHERE id = ?`, [req.params.id]);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const now = new Date().toISOString();
    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'Pending Principal Review' : 'Rejected by HOD';

    await run(`
      UPDATE documents
      SET status = ?, hod_approved_by = ?, hod_approved_at = ?, hod_remarks = ?
      WHERE id = ?
    `, [newStatus, user_name, now, remarks, req.params.id]);

    // Record Audit Event
    await recordAuditEvent({
      userId: user_id,
      userName: user_name,
      userRole: req.headers['x-user-role'] || 'HOD',
      action: isApproved ? 'HOD Approved' : 'HOD Rejected',
      docId: doc.id,
      docTitle: doc.title,
      details: isApproved
        ? `HOD approved evidence document. Forwarded to Principal for final approval. Remarks: ${remarks || 'Approved'}`
        : `HOD rejected evidence document. Reason: ${remarks}`
    });

    const updatedDoc = await getOne(`SELECT * FROM documents WHERE id = ?`, [req.params.id]);
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Principal Review (Approve or Reject) — Principal or Admin ONLY
app.post('/api/documents/:id/principal-approve', authorizeRole(['Principal', 'Admin']), async (req, res) => {
  try {
    const { action, remarks, user_id, user_name } = req.body;
    const doc = await getOne(`SELECT * FROM documents WHERE id = ?`, [req.params.id]);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const now = new Date().toISOString();
    const isApproved = action === 'approve';
    const newStatus = isApproved ? 'Pending Digital Signature' : 'Rejected by Principal';

    await run(`
      UPDATE documents
      SET status = ?, principal_approved_by = ?, principal_approved_at = ?, principal_remarks = ?
      WHERE id = ?
    `, [newStatus, user_name, now, remarks, req.params.id]);

    // Record Audit Event
    await recordAuditEvent({
      userId: user_id || 'usr-prin-1',
      userName: user_name || 'Dr. A. K. Sharma',
      userRole: req.headers['x-user-role'] || 'Principal',
      action: isApproved ? 'Principal Approved' : 'Principal Rejected',
      docId: doc.id,
      docTitle: doc.title,
      details: isApproved
        ? `Principal approved evidence document. Ready for Digital Signature application. Remarks: ${remarks || 'Approved'}`
        : `Principal rejected evidence document. Reason: ${remarks}`
    });

    const updatedDoc = await getOne(`SELECT * FROM documents WHERE id = ?`, [req.params.id]);
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Digital Signature Simulation — Principal or Admin ONLY
app.post('/api/documents/:id/digital-sign', authorizeRole(['Principal', 'Admin']), async (req, res) => {
  try {
    const { user_id, user_name, remarks } = req.body;
    const doc = await getOne(`SELECT * FROM documents WHERE id = ?`, [req.params.id]);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const now = new Date().toISOString();
    const dscSignatureId = `AV-DSC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const dscCertSerial = `AccrediVault-Class3-Cert-${Math.floor(10000 + Math.random() * 90000)}-2026`;
    const signerName = `${user_name || 'Dr. A. K. Sharma'} (Principal)`;
    const newStatus = 'Digitally Signed / Approved';

    await run(`
      UPDATE documents
      SET status = ?,
          principal_approved_by = COALESCE(principal_approved_by, ?),
          principal_approved_at = COALESCE(principal_approved_at, ?),
          principal_remarks = COALESCE(principal_remarks, ?),
          dsc_signature_id = ?,
          dsc_signed_at = ?,
          dsc_signer_name = ?,
          dsc_certificate_serial = ?
      WHERE id = ?
    `, [
      newStatus, user_name || 'Dr. A. K. Sharma', now, remarks || 'Approved & Signed digitally via AccrediVault Digital Signature Module.',
      dscSignatureId, now, signerName, dscCertSerial, req.params.id
    ]);

    // Record Audit Event for Digital Signature
    await recordAuditEvent({
      userId: user_id || 'usr-prin-1',
      userName: user_name || 'Dr. A. K. Sharma',
      userRole: req.headers['x-user-role'] || 'Principal',
      action: 'Document Digitally Signed',
      docId: doc.id,
      docTitle: doc.title,
      details: `AccrediVault Class-3 Digital Signature attached by ${signerName}. Serial: ${dscCertSerial}. Ref: ${dscSignatureId}`
    });

    const updatedDoc = await getOne(`SELECT * FROM documents WHERE id = ?`, [req.params.id]);
    res.json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN MANAGEMENT ROUTES (ADMIN ONLY) ---
app.get('/api/admin/users', authorizeRole(['Admin']), async (req, res) => {
  try {
    const users = await query(`SELECT id, name, email, role, department, avatar FROM users ORDER BY name ASC`);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/users', authorizeRole(['Admin']), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const id = `usr-${role.toLowerCase().slice(0, 3)}-${Math.floor(100 + Math.random() * 900)}`;
    const avatar = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`;

    await run(
      `INSERT INTO users (id, name, email, password, role, department, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, email.toLowerCase().trim(), password, role, department, avatar]
    );

    // Audit Event
    await recordAuditEvent({
      userId: req.body.admin_user_id || 'usr-admin-1',
      userName: req.body.admin_user_name || 'System Administrator',
      userRole: 'Admin',
      action: 'User Created',
      docId: 'SYS-USER-MGMT',
      docTitle: 'User Account Management',
      details: `Created new ${role} user account: ${name} (${email}) for ${department}.`
    });

    const newUser = await getOne(`SELECT id, name, email, role, department, avatar FROM users WHERE id = ?`, [id]);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/departments', authorizeRole(['Admin']), async (req, res) => {
  try {
    const depts = await query(`SELECT * FROM departments ORDER BY code ASC`);
    res.json(depts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/departments', authorizeRole(['Admin']), async (req, res) => {
  try {
    const { code, name, hod_name, faculty_count } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: 'Department code and name are required' });
    }

    const id = `dept-${code.toLowerCase()}`;
    await run(
      `INSERT INTO departments (id, code, name, hod_name, faculty_count, active) VALUES (?, ?, ?, ?, ?, 1)`,
      [id, code.toUpperCase(), name, hod_name || 'To Be Assigned', faculty_count || 0]
    );

    await recordAuditEvent({
      userId: req.body.admin_user_id || 'usr-admin-1',
      userName: req.body.admin_user_name || 'System Administrator',
      userRole: 'Admin',
      action: 'Department Created',
      docId: 'SYS-DEPT-MGMT',
      docTitle: 'Department Configuration',
      details: `Created new department: ${name} (${code}).`
    });

    const newDept = await getOne(`SELECT * FROM departments WHERE id = ?`, [id]);
    res.status(201).json(newDept);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/system-info', authorizeRole(['Admin']), async (req, res) => {
  try {
    const totalUsers = await getOne(`SELECT COUNT(*) as count FROM users`);
    const totalDepts = await getOne(`SELECT COUNT(*) as count FROM departments`);
    const totalDocs = await getOne(`SELECT COUNT(*) as count FROM documents`);
    const totalAuditLogs = await getOne(`SELECT COUNT(*) as count FROM audit_trail`);
    const dbFileStats = fs.existsSync(path.join(__dirname, 'accreditation.db'))
      ? fs.statSync(path.join(__dirname, 'accreditation.db')).size
      : 0;

    res.json({
      systemName: 'AccrediVault Enterprise Repository',
      version: '1.2.0-RBAC-SECURE',
      nodeVersion: process.version,
      uptimeSeconds: Math.round(process.uptime()),
      dbSizeBytes: dbFileStats,
      metrics: {
        users: totalUsers.count,
        departments: totalDepts.count,
        documents: totalDocs.count,
        auditLogs: totalAuditLogs.count
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- AUDIT TRAIL & INTEGRITY ROUTE ---
app.get('/api/audit-trail', async (req, res) => {
  try {
    const logs = await query(`SELECT * FROM audit_trail ORDER BY id DESC`);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/audit-trail/verify', async (req, res) => {
  try {
    const result = await verifyAuditIntegrity();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional Tamper Simulation endpoint
app.post('/api/audit-trail/tamper-toggle', async (req, res) => {
  try {
    const latest = await getOne(`SELECT * FROM audit_trail ORDER BY id DESC LIMIT 1`);
    if (!latest) return res.status(400).json({ error: 'No audit records to tamper' });

    if (latest.details.includes('[TAMPERED]')) {
      const cleanDetails = latest.details.replace(' [TAMPERED]', '');
      await run(`UPDATE audit_trail SET details = ? WHERE id = ?`, [cleanDetails, latest.id]);
      res.json({ message: 'Audit log restored to original state', tampered: false });
    } else {
      await run(`UPDATE audit_trail SET details = details || ' [TAMPERED]' WHERE id = ?`, [latest.id]);
      res.json({ message: `Audit record #${latest.id} tampered for testing`, tampered: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PUBLIC VERIFICATION & QR ROUTE ---
app.get('/api/verify/:verificationId', async (req, res) => {
  try {
    const rawId = decodeURIComponent(req.params.verificationId || '').trim();
    if (!rawId) {
      return res.status(400).json({ verified: false, error: 'Verification ID is required.' });
    }

    // Perform case-insensitive search across verification_id, id, and dsc_signature_id
    const doc = await getOne(
      `SELECT * FROM documents
       WHERE LOWER(verification_id) = LOWER(?)
          OR LOWER(id) = LOWER(?)
          OR LOWER(dsc_signature_id) = LOWER(?)`,
      [rawId, rawId, rawId]
    );

    if (!doc) {
      return res.status(404).json({
        verified: false,
        error: 'Verification Failed: Document not found or invalid verification ID.'
      });
    }

    const auditHistory = await query(
      `SELECT timestamp, user_name, user_role, action, details FROM audit_trail WHERE doc_id = ? ORDER BY id ASC`,
      [doc.id]
    );

    res.json({
      verified: true,
      document: doc,
      auditHistory
    });
  } catch (err) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AccrediVault Backend Server running on http://localhost:${PORT}`);
});
