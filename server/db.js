import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'accreditation.db');
const uploadsDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database Connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite DB:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Helper function for SHA-256 cryptographic hashing
export function computeHash(dataString) {
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

// Promisified DB helpers
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Initialize Tables and Seed Demo Data
export async function initDb() {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Users Table
        await run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            department TEXT NOT NULL,
            avatar TEXT
          )
        `);

        // Departments Table
        await run(`
          CREATE TABLE IF NOT EXISTS departments (
            id TEXT PRIMARY KEY,
            code TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            hod_name TEXT,
            faculty_count INTEGER DEFAULT 0,
            active INTEGER DEFAULT 1
          )
        `);

        // Documents Table
        await run(`
          CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            verification_id TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            department TEXT NOT NULL,
            criterion TEXT NOT NULL,
            academic_year TEXT NOT NULL,
            doc_type TEXT NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_size INTEGER DEFAULT 1048576,
            status TEXT NOT NULL,
            uploaded_by TEXT NOT NULL,
            uploaded_by_name TEXT NOT NULL,
            uploaded_at TEXT NOT NULL,
            hod_approved_by TEXT,
            hod_approved_at TEXT,
            hod_remarks TEXT,
            principal_approved_by TEXT,
            principal_approved_at TEXT,
            principal_remarks TEXT,
            dsc_signature_id TEXT,
            dsc_signed_at TEXT,
            dsc_signer_name TEXT,
            dsc_certificate_serial TEXT,
            document_hash TEXT NOT NULL
          )
        `);

        // Audit Trail Table with Tamper-Evident Hash Chain
        await run(`
          CREATE TABLE IF NOT EXISTS audit_trail (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            user_role TEXT NOT NULL,
            action TEXT NOT NULL,
            doc_id TEXT NOT NULL,
            doc_title TEXT NOT NULL,
            details TEXT NOT NULL,
            ip_address TEXT DEFAULT '127.0.0.1',
            prev_hash TEXT NOT NULL,
            current_hash TEXT NOT NULL
          )
        `);

        // Check if users exist
        const userCount = await getOne(`SELECT COUNT(*) as count FROM users`);
        if (userCount.count === 0) {
          console.log('Seeding demo database with users, departments, realistic accreditation documents, and tamper-evident audit logs...');
          await seedDatabase();
        }

        resolve(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        reject(err);
      }
    });
  });
}

async function seedDatabase() {
  // Demo Departments
  const depts = [
    { id: 'dept-cse', code: 'CSE', name: 'Computer Science and Engineering', hod_name: 'Dr. Sunita Rao', faculty_count: 24 },
    { id: 'dept-aiml', code: 'AIML', name: 'Artificial Intelligence and Machine Learning', hod_name: 'Dr. Sunita Rao', faculty_count: 18 },
    { id: 'dept-ece', code: 'ECE', name: 'Electronics and Communication Engineering', hod_name: 'Dr. Vikram Malhotra', faculty_count: 20 },
    { id: 'dept-eee', code: 'EEE', name: 'Electrical and Electronics Engineering', hod_name: 'Dr. Ramesh Babu', faculty_count: 15 }
  ];

  for (const d of depts) {
    await run(
      `INSERT INTO departments (id, code, name, hod_name, faculty_count, active) VALUES (?, ?, ?, ?, ?, 1)`,
      [d.id, d.code, d.name, d.hod_name, d.faculty_count]
    );
  }

  // Demo Users matching exact requirements
  const users = [
    { id: 'usr-fac-1', name: 'Prof. Rajesh Kumar', email: 'faculty@demo.com', password: 'faculty123', role: 'Faculty', department: 'Computer Science and Engineering', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    { id: 'usr-hod-cse', name: 'Dr. Sunita Rao', email: 'hod@demo.com', password: 'hod123', role: 'HOD', department: 'Computer Science and Engineering', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
    { id: 'usr-prin-1', name: 'Dr. A. K. Sharma', email: 'principal@demo.com', password: 'principal123', role: 'Principal', department: 'Administration', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
    { id: 'usr-coord-1', name: 'Prof. Meena Reddy', email: 'coordinator@demo.com', password: 'coordinator123', role: 'NAAC/NBA Coordinator', department: 'IQAC Cell', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
    { id: 'usr-admin-1', name: 'System Administrator', email: 'admin@demo.com', password: 'admin123', role: 'Admin', department: 'IT Infrastructure', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
  ];

  for (const u of users) {
    await run(
      `INSERT INTO users (id, name, email, password, role, department, avatar) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.name, u.email, u.password, u.role, u.department, u.avatar]
    );
  }

  // Pre-populated Documents with chronologically consistent timestamps
  const rawDocs = [
    {
      id: 'DOC-2026-CSE-001',
      verification_id: 'VER-8912-CSE-001',
      title: 'Student Placement Report',
      description: 'Comprehensive placement metrics, CTC distribution histograms, and company-wise offer letters for CSE graduating batch.',
      department: 'Computer Science and Engineering',
      criterion: 'Criterion V: Student Support & Progression',
      academic_year: '2025-26',
      doc_type: 'Student Placement & Alumni',
      status: 'Digitally Signed / Approved',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-01T10:15:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-02T11:30:00Z',
      hod_remarks: 'Placement verification audit completed. Approved.',
      principal_approved_by: 'Dr. A. K. Sharma',
      principal_approved_at: '2026-08-03T14:20:00Z',
      principal_remarks: 'Approved for NAAC Criterion V evidence repository. Digitally signed.',
      dsc_signature_id: 'AV-DSC-2026-8819',
      dsc_signed_at: '2026-08-03T14:21:10Z',
      dsc_signer_name: 'Dr. A. K. Sharma (Principal)',
      dsc_certificate_serial: 'AccrediVault-Class3-8819-2026-AKS'
    },
    {
      id: 'DOC-2026-CSE-002',
      verification_id: 'VER-7741-CSE-002',
      title: 'Faculty Research Publication Report',
      description: 'Compendium of Scopus & Web of Science indexed journal papers, citation counts, and impact factors of CSE faculty members.',
      department: 'Computer Science and Engineering',
      criterion: 'Criterion III: Research, Innovations & Extension',
      academic_year: '2025-26',
      doc_type: 'Research Paper Publication',
      status: 'Digitally Signed / Approved',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-04T09:00:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-05T15:10:00Z',
      hod_remarks: 'Publication DOIs and indexations verified.',
      principal_approved_by: 'Dr. A. K. Sharma',
      principal_approved_at: '2026-08-06T11:45:00Z',
      principal_remarks: 'High research contribution score. Signed and approved.',
      dsc_signature_id: 'AV-DSC-2026-9042',
      dsc_signed_at: '2026-08-06T11:46:00Z',
      dsc_signer_name: 'Dr. A. K. Sharma (Principal)',
      dsc_certificate_serial: 'AccrediVault-Class3-9042-2026-AKS'
    },
    {
      id: 'DOC-2026-ECE-001',
      verification_id: 'VER-6629-ECE-001',
      title: 'Faculty Development Program Report',
      description: '5-day AICTE sponsored national workshop on 5G Communication & VLSI Design attended by ECE department faculty.',
      department: 'Electronics and Communication Engineering',
      criterion: 'Criterion III: Research, Innovations & Extension',
      academic_year: '2025-26',
      doc_type: 'Workshop & Pedagogy Report',
      status: 'Digitally Signed / Approved',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-07T14:30:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-08T10:20:00Z',
      hod_remarks: 'FDP participant certificates and outcome reports verified.',
      principal_approved_by: 'Dr. A. K. Sharma',
      principal_approved_at: '2026-08-09T16:00:00Z',
      principal_remarks: 'Approved and digitally signed for NBA accreditation.',
      dsc_signature_id: 'AV-DSC-2026-9118',
      dsc_signed_at: '2026-08-09T16:01:22Z',
      dsc_signer_name: 'Dr. A. K. Sharma (Principal)',
      dsc_certificate_serial: 'AccrediVault-Class3-9118-2026-AKS'
    },
    {
      id: 'DOC-2026-AIML-001',
      verification_id: 'VER-5510-AIML-001',
      title: 'Laboratory Utilization Report',
      description: 'High-performance GPU AI Lab log, workstation maintenance schedules, student batch usage, and safety compliance records.',
      department: 'Artificial Intelligence and Machine Learning',
      criterion: 'Criterion IV: Infrastructure & Learning Resources',
      academic_year: '2025-26',
      doc_type: 'Lab Audit & Maintenance',
      status: 'Pending Principal Review',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-10T11:00:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-11T12:00:00Z',
      hod_remarks: 'Lab hardware inventory and software licenses verified. Forwarded to Principal.',
      principal_approved_by: null,
      principal_approved_at: null,
      principal_remarks: null,
      dsc_signature_id: null,
      dsc_signed_at: null,
      dsc_signer_name: null,
      dsc_certificate_serial: null
    },
    {
      id: 'DOC-2026-CSE-003',
      verification_id: 'VER-4409-CSE-003',
      title: 'Student Achievement Report',
      description: 'National hackathon winners, patent filings, and competitive coding awards achieved by CSE students during the academic year.',
      department: 'Computer Science and Engineering',
      criterion: 'Criterion V: Student Support & Progression',
      academic_year: '2025-26',
      doc_type: 'Student Placement & Alumni',
      status: 'Pending HOD Review',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-12T09:30:00Z',
      hod_approved_by: null,
      hod_approved_at: null,
      hod_remarks: null,
      principal_approved_by: null,
      principal_approved_at: null,
      principal_remarks: null,
      dsc_signature_id: null,
      dsc_signed_at: null,
      dsc_signer_name: null,
      dsc_certificate_serial: null
    },
    {
      id: 'DOC-2026-EEE-001',
      verification_id: 'VER-3321-EEE-001',
      title: 'Industry Interaction Report',
      description: 'MoU execution details, industrial expert lectures, and student factory visits organized in association with L&T and Siemens.',
      department: 'Electrical and Electronics Engineering',
      criterion: 'Criterion III: Research, Innovations & Extension',
      academic_year: '2025-26',
      doc_type: 'MoU & Industrial Collaboration',
      status: 'Digitally Signed / Approved',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-01T14:00:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-02T16:00:00Z',
      hod_remarks: 'Industrial collaboration proofs verified.',
      principal_approved_by: 'Dr. A. K. Sharma',
      principal_approved_at: '2026-08-03T17:30:00Z',
      principal_remarks: 'Excellent industry-academia linkage. Signed.',
      dsc_signature_id: 'AV-DSC-2026-7734',
      dsc_signed_at: '2026-08-03T17:31:00Z',
      dsc_signer_name: 'Dr. A. K. Sharma (Principal)',
      dsc_certificate_serial: 'AccrediVault-Class3-7734-2026-AKS'
    },
    {
      id: 'DOC-2026-ECE-002',
      verification_id: 'VER-2210-ECE-002',
      title: 'Student Attendance Summary',
      description: 'LMS biometric attendance logs, condonation records, and continuous monitoring reports for B.Tech ECE courses.',
      department: 'Electronics and Communication Engineering',
      criterion: 'Criterion II: Teaching-Learning & Evaluation',
      academic_year: '2025-26',
      doc_type: 'Examination & Evaluation Log',
      status: 'Pending HOD Review',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-13T10:00:00Z',
      hod_approved_by: null,
      hod_approved_at: null,
      hod_remarks: null,
      principal_approved_by: null,
      principal_approved_at: null,
      principal_remarks: null,
      dsc_signature_id: null,
      dsc_signed_at: null,
      dsc_signer_name: null,
      dsc_certificate_serial: null
    },
    {
      id: 'DOC-2026-CSE-004',
      verification_id: 'VER-1109-CSE-004',
      title: 'Alumni Feedback Report',
      description: 'Consolidated feedback analysis from alumni working across global technology firms regarding curriculum relevance.',
      department: 'Computer Science and Engineering',
      criterion: 'Criterion I: Curricular Aspects',
      academic_year: '2024-25',
      doc_type: 'Syllabus & Curriculum',
      status: 'Pending Principal Review',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-11T16:20:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-12T11:00:00Z',
      hod_remarks: 'Alumni feedback action-taken report attached. Recommended for approval.',
      principal_approved_by: null,
      principal_approved_at: null,
      principal_remarks: null,
      dsc_signature_id: null,
      dsc_signed_at: null,
      dsc_signer_name: null,
      dsc_certificate_serial: null
    },
    {
      id: 'DOC-2026-CSE-005',
      verification_id: 'VER-7766-CSE-005',
      title: 'Continuous Internal Evaluation (CIE) Question Paper Quality Audit',
      description: 'Bloom\'s Taxonomy difficulty matrix analysis and moderation committee minutes for Mid-Term Exams.',
      department: 'Computer Science and Engineering',
      criterion: 'Criterion II: Teaching-Learning & Evaluation',
      academic_year: '2025-26',
      doc_type: 'Examination & Evaluation Log',
      status: 'Rejected by HOD',
      uploaded_by: 'faculty@demo.com',
      uploaded_by_name: 'Prof. Rajesh Kumar',
      uploaded_at: '2026-08-08T16:00:00Z',
      hod_approved_by: 'Dr. Sunita Rao',
      hod_approved_at: '2026-08-09T09:00:00Z',
      hod_remarks: 'Bloom\'s Taxonomy breakdown missing for Elective III. Please revise and resubmit.',
      principal_approved_by: null,
      principal_approved_at: null,
      principal_remarks: null,
      dsc_signature_id: null,
      dsc_signed_at: null,
      dsc_signer_name: null,
      dsc_certificate_serial: null
    }
  ];

  let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

  for (const doc of rawDocs) {
    const docHash = computeHash(`${doc.id}:${doc.title}:${doc.uploaded_at}:${doc.uploaded_by}`);

    await run(
      `INSERT INTO documents (
        id, verification_id, title, description, department, criterion, academic_year, doc_type,
        file_name, file_path, file_size, status, uploaded_by, uploaded_by_name, uploaded_at,
        hod_approved_by, hod_approved_at, hod_remarks, principal_approved_by, principal_approved_at,
        principal_remarks, dsc_signature_id, dsc_signed_at, dsc_signer_name, dsc_certificate_serial, document_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        doc.id, doc.verification_id, doc.title, doc.description, doc.department, doc.criterion,
        doc.academic_year, doc.doc_type, `${doc.id}.pdf`, `/uploads/${doc.id}.pdf`, 1542890,
        doc.status, doc.uploaded_by, doc.uploaded_by_name, doc.uploaded_at,
        doc.hod_approved_by, doc.hod_approved_at, doc.hod_remarks,
        doc.principal_approved_by, doc.principal_approved_at, doc.principal_remarks,
        doc.dsc_signature_id, doc.dsc_signed_at, doc.dsc_signer_name, doc.dsc_certificate_serial, docHash
      ]
    );

    // Create corresponding audit log entries matching exact user role identities
    const uploadDetails = `Evidence uploaded by ${doc.uploaded_by_name} for ${doc.department} under ${doc.criterion}`;
    const uploadTime = doc.uploaded_at;
    const uCurrHash = computeHash(`${prevHash}|${uploadTime}|usr-fac-1|Prof. Rajesh Kumar|Faculty|Document Uploaded|${doc.id}|${doc.title}|${uploadDetails}`);

    await run(
      `INSERT INTO audit_trail (timestamp, user_id, user_name, user_role, action, doc_id, doc_title, details, ip_address, prev_hash, current_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [uploadTime, 'usr-fac-1', 'Prof. Rajesh Kumar', 'Faculty', 'Document Uploaded', doc.id, doc.title, uploadDetails, '192.168.1.45', prevHash, uCurrHash]
    );
    prevHash = uCurrHash;

    if (doc.hod_approved_at || doc.status === 'Rejected by HOD') {
      const isApproved = doc.status !== 'Rejected by HOD';
      const hodAction = isApproved ? 'HOD Approved' : 'HOD Rejected';
      const hodTime = doc.hod_approved_at || '2026-08-09T09:00:00Z';
      const hodDetails = isApproved
        ? `Document approved by HOD ${doc.hod_approved_by}. Remarks: ${doc.hod_remarks}`
        : `Document rejected by HOD ${doc.hod_approved_by}. Remarks: ${doc.hod_remarks}`;

      const hCurrHash = computeHash(`${prevHash}|${hodTime}|usr-hod-cse|${doc.hod_approved_by || 'Dr. Sunita Rao'}|HOD|${hodAction}|${doc.id}|${doc.title}|${hodDetails}`);

      await run(
        `INSERT INTO audit_trail (timestamp, user_id, user_name, user_role, action, doc_id, doc_title, details, ip_address, prev_hash, current_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [hodTime, 'usr-hod-cse', doc.hod_approved_by || 'Dr. Sunita Rao', 'HOD', hodAction, doc.id, doc.title, hodDetails, '192.168.1.12', prevHash, hCurrHash]
      );
      prevHash = hCurrHash;
    }

    if (doc.dsc_signed_at) {
      const prinTime = doc.principal_approved_at;
      const prinDetails = `Principal approved document. Remarks: ${doc.principal_remarks}`;
      const pCurrHash = computeHash(`${prevHash}|${prinTime}|usr-prin-1|Dr. A. K. Sharma|Principal|Principal Approved|${doc.id}|${doc.title}|${prinDetails}`);

      await run(
        `INSERT INTO audit_trail (timestamp, user_id, user_name, user_role, action, doc_id, doc_title, details, ip_address, prev_hash, current_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [prinTime, 'usr-prin-1', 'Dr. A. K. Sharma', 'Principal', 'Principal Approved', doc.id, doc.title, prinDetails, '192.168.1.2', prevHash, pCurrHash]
      );
      prevHash = pCurrHash;

      const dscTime = doc.dsc_signed_at;
      const dscDetails = `AccrediVault Digital Signature attached by ${doc.dsc_signer_name}. Simulation Ref: ${doc.dsc_certificate_serial}. Ref: ${doc.dsc_signature_id}`;
      const dCurrHash = computeHash(`${prevHash}|${dscTime}|usr-prin-1|Dr. A. K. Sharma|Principal|Document Digitally Signed|${doc.id}|${doc.title}|${dscDetails}`);

      await run(
        `INSERT INTO audit_trail (timestamp, user_id, user_name, user_role, action, doc_id, doc_title, details, ip_address, prev_hash, current_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [dscTime, 'usr-prin-1', 'Dr. A. K. Sharma', 'Principal', 'Document Digitally Signed', doc.id, doc.title, dscDetails, '192.168.1.2', prevHash, dCurrHash]
      );
      prevHash = dCurrHash;
    }
  }

  console.log('Demo database seeding completed successfully for AccrediVault!');
}

export default db;
