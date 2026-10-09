import { query, run, getOne, computeHash } from '../db.js';

/**
 * Appends a new event to the tamper-evident audit trail hash chain.
 * Computes SHA-256(prev_hash + timestamp + user_id + user_name + user_role + action + doc_id + doc_title + details)
 */
export async function recordAuditEvent({ userId, userName, userRole, action, docId, docTitle, details, ipAddress = '127.0.0.1' }) {
  const timestamp = new Date().toISOString();

  // Fetch the latest entry in audit trail to get its current_hash
  const lastEntry = await getOne(`SELECT current_hash FROM audit_trail ORDER BY id DESC LIMIT 1`);
  const prevHash = lastEntry ? lastEntry.current_hash : '0000000000000000000000000000000000000000000000000000000000000000';

  const rawData = `${prevHash}|${timestamp}|${userId}|${userName}|${userRole}|${action}|${docId}|${docTitle}|${details}`;
  const currentHash = computeHash(rawData);

  const result = await run(
    `INSERT INTO audit_trail (timestamp, user_id, user_name, user_role, action, doc_id, doc_title, details, ip_address, prev_hash, current_hash)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [timestamp, userId, userName, userRole, action, docId, docTitle, details, ipAddress, prevHash, currentHash]
  );

  return {
    id: result.id,
    timestamp,
    action,
    docId,
    prevHash,
    currentHash
  };
}

/**
 * Verifies the integrity of the audit trail hash chain.
 * Iterates through every record from ID 1 to N and recalculates current_hash.
 */
export async function verifyAuditIntegrity() {
  const logs = await query(`SELECT * FROM audit_trail ORDER BY id ASC`);
  let isValid = true;
  let brokenIndex = null;

  for (let i = 0; i < logs.length; i++) {
    const record = logs[i];
    let expectedPrevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    if (i > 0) {
      expectedPrevHash = logs[i - 1].current_hash;
    }

    if (record.prev_hash !== expectedPrevHash) {
      isValid = false;
      brokenIndex = record.id;
      break;
    }

    const rawData = `${record.prev_hash}|${record.timestamp}|${record.user_id}|${record.user_name}|${record.user_role}|${record.action}|${record.doc_id}|${record.doc_title}|${record.details}`;
    const calculatedHash = computeHash(rawData);

    if (calculatedHash !== record.current_hash) {
      isValid = false;
      brokenIndex = record.id;
      break;
    }
  }

  return {
    verified: isValid,
    totalRecords: logs.length,
    timestamp: new Date().toISOString(),
    brokenIndex
  };
}
