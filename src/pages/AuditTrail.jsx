import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, CheckCircle2, AlertOctagon, RefreshCw, Lock, AlertTriangle } from 'lucide-react';

export default function AuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [tamperedState, setTamperedState] = useState(false);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit-trail');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleVerifyIntegrity = async () => {
    setVerifying(true);
    setVerificationResult(null);

    try {
      const res = await fetch('/api/audit-trail/verify');
      const data = await res.json();
      setVerificationResult(data);
    } catch (err) {
      console.error(err);
      setVerificationResult({ verified: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  const handleToggleTamper = async () => {
    try {
      const res = await fetch('/api/audit-trail/tamper-toggle', { method: 'POST' });
      const data = await res.json();
      setTamperedState(data.tampered);
      await fetchAuditLogs();
      if (verificationResult) {
        handleVerifyIntegrity();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600" /> Tamper-Evident Audit Trail Module
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            SHA-256 hash chain linking audit events and providing tamper-evident integrity verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleTamper}
            className={`px-3 py-2 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 border ${
              tamperedState
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
            }`}
            title="Simulate data tampering to test hash-chain verification failure"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>{tamperedState ? 'Restore Original Log' : 'Simulate Tamper Test'}</span>
          </button>

          <button
            onClick={handleVerifyIntegrity}
            disabled={verifying}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            {verifying ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            <span>{verifying ? 'Verifying Hashes...' : 'Verify Audit Integrity'}</span>
          </button>
        </div>
      </div>

      {/* Verification Result Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-4 duration-300 ${
            verificationResult.verified
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              verificationResult.verified ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {verificationResult.verified ? <CheckCircle2 className="w-7 h-7" /> : <AlertOctagon className="w-7 h-7" />}
            </div>
            <div>
              <h3 className="text-base font-extrabold">
                {verificationResult.verified ? '✓ Audit Trail Integrity Verified' : '❌ Audit Trail Integrity Check Failed'}
              </h3>
              <p className="text-xs mt-0.5 opacity-90">
                {verificationResult.verified
                  ? `Cryptographic SHA-256 chain calculation confirmed valid across all ${verificationResult.totalRecords} audit log entries. Zero record modifications detected.`
                  : `Hash mismatch discovered at log entry #${verificationResult.brokenIndex}. Audit trail tamper detected.`}
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="font-mono text-[11px] font-semibold opacity-75">Verified at {new Date(verificationResult.timestamp).toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-amber-600" /> SHA-256 TAMPER-EVIDENT HASH CHAIN
          </span>
          <span className="text-slate-400">{logs.length} Hashed Actions Recorded</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading Audit Log...</div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User & Role</th>
                  <th>Action</th>
                  <th>Document ID & Title</th>
                  <th>Description / Details</th>
                  <th>Previous Hash</th>
                  <th>Current Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="text-xs font-mono text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <div className="text-xs font-bold text-slate-900">{log.user_name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {log.user_role}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({log.ip_address})</span>
                      </div>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        log.action.includes('Signed') ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                        log.action.includes('Approved') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        log.action.includes('Uploaded') ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="max-w-xs">
                      <div className="text-xs font-bold text-slate-800 truncate">{log.doc_title}</div>
                      <div className="text-[11px] font-mono text-blue-600">{log.doc_id}</div>
                    </td>
                    <td className="max-w-xs">
                      <p className="text-xs text-slate-600 line-clamp-2">{log.details}</p>
                    </td>
                    <td>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 block truncate max-w-[120px]">
                        {log.prev_hash?.slice(0, 16)}...
                      </span>
                    </td>
                    <td>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 block truncate max-w-[120px] font-semibold">
                        {log.current_hash?.slice(0, 16)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
