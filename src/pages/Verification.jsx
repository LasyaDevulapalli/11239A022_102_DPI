import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Search, CheckCircle2, ShieldCheck, Lock, AlertCircle, XCircle } from 'lucide-react';

export default function Verification({ initialVerificationId }) {
  const [verificationId, setVerificationId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (idToSearch) => {
    const targetId = idToSearch !== undefined ? idToSearch : verificationId;
    if (!targetId || !targetId.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/verify/${encodeURIComponent(targetId.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        verified: false,
        error: 'Verification Failed: Document not found or invalid verification ID.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idFromUrl = urlParams.get('id') || urlParams.get('verificationId') || urlParams.get('ver');

    const activeId = initialVerificationId || idFromUrl || 'VER-8912-CSE-001';
    setVerificationId(activeId);
    handleVerify(activeId);
  }, [initialVerificationId]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <QrCode className="w-6 h-6 text-emerald-600" /> Public Document Verification Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify authenticity, digital signatures, and audit approval sequence for any NAAC / NBA evidence document.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 font-bold px-3 py-1.5 rounded-xl text-xs border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>AccrediVault Verifier</span>
        </div>
      </div>

      {/* Lookup Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); handleVerify(); }} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Enter Verification ID or Document ID (e.g. VER-8912-CSE-001 or DOC-2026-CSE-001)"
              value={verificationId}
              onChange={(e) => setVerificationId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-6 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Verifying...' : 'Verify Document'}</span>
          </button>
        </form>

        {/* Preset Quick Lookup Buttons */}
        <div className="flex items-center gap-2 text-xs text-slate-500 pt-1 flex-wrap">
          <span className="font-semibold">Preset Test IDs:</span>
          <button
            onClick={() => { setVerificationId('VER-8912-CSE-001'); handleVerify('VER-8912-CSE-001'); }}
            className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-blue-700 font-mono font-semibold"
          >
            VER-8912-CSE-001 (Valid Signed)
          </button>
          <button
            onClick={() => { setVerificationId('VER-5510-AIML-001'); handleVerify('VER-5510-AIML-001'); }}
            className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-blue-700 font-mono font-semibold"
          >
            VER-5510-AIML-001 (Pending Review)
          </button>
          <button
            onClick={() => { setVerificationId('VER-INVALID-999'); handleVerify('VER-INVALID-999'); }}
            className="bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-rose-700 font-mono font-semibold"
          >
            VER-INVALID-999 (Invalid Code)
          </button>
        </div>
      </div>

      {/* Verification Result Section */}
      {result && (
        <div className="space-y-6">
          {result.verified && result.document ? (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-md overflow-hidden space-y-6 p-6 animate-in fade-in duration-200">
              {/* Verified Success Header */}
              <div className="bg-emerald-600 text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold">✓ Document Verified</h2>
                    <p className="text-xs text-emerald-100">
                      Authentic evidence document verified in AccrediVault Institutional Repository
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-white/20">
                  Verification ID: {result.document.verification_id}
                </div>
              </div>

              {/* QR Code and Metadata Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* QR Code Graphic Column */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-white rounded-xl shadow-xs border border-slate-200">
                    <QRCodeSVG
                      value={`${window.location.origin}/verify?id=${result.document.verification_id}`}
                      size={150}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 font-semibold">Scan QR Code to Verify</div>
                  <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-extrabold">
                    AccrediVault Verified
                  </div>
                </div>

                {/* Metadata Fields Column */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {result.document.id}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{result.document.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{result.document.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 font-semibold block">Document Title</span>
                      <span className="font-bold text-slate-800">{result.document.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Document ID</span>
                      <span className="font-mono font-bold text-blue-700">{result.document.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Verification ID</span>
                      <span className="font-mono font-bold text-slate-800">{result.document.verification_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Department</span>
                      <span className="font-bold text-slate-800">{result.document.department}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Academic Year</span>
                      <span className="font-bold text-slate-800">{result.document.academic_year}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Approved By</span>
                      <span className="font-bold text-slate-800">{result.document.principal_approved_by || result.document.hod_approved_by || 'Not Approved'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Digital Signature Status</span>
                      <span className={`font-bold ${result.document.status === 'Digitally Signed / Approved' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {result.document.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-semibold block">Approval Date</span>
                      <span className="font-bold text-slate-800">
                        {result.document.dsc_signed_at
                          ? new Date(result.document.dsc_signed_at).toLocaleDateString()
                          : (result.document.principal_approved_at
                            ? new Date(result.document.principal_approved_at).toLocaleDateString()
                            : (result.document.hod_approved_at ? new Date(result.document.hod_approved_at).toLocaleDateString() : '—'))}
                      </span>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-500 font-semibold">Verification Status</span>
                      <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[11px]">
                        ✓ Document Verified
                      </span>
                    </div>
                  </div>

                  {/* Digital Signature Simulation Card */}
                  {result.document.dsc_signature_id ? (
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
                          <Lock className="w-4 h-4 text-purple-700" /> Digital Signature Simulation Metadata
                        </span>
                        <span className="bg-purple-200 text-purple-900 font-bold px-2 py-0.2 rounded text-[10px]">
                          SIMULATED SIGNATURE
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-purple-950 font-medium">
                        <div>Signature Status: <strong className="text-emerald-700">Digitally Signed / Approved</strong></div>
                        <div>Signer Name: <strong>{result.document.dsc_signer_name}</strong></div>
                        <div>Signature Ref ID: <strong className="font-mono">{result.document.dsc_signature_id}</strong></div>
                        <div>Simulation Reference ID: <strong className="font-mono text-[10px]">{result.document.dsc_certificate_serial}</strong></div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium">
                      Status: <strong>{result.document.status}</strong> (Pending Principal approval and digital signature)
                    </div>
                  )}
                </div>
              </div>

              {/* Audit History Timeline */}
              {result.auditHistory && result.auditHistory.length > 0 && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Audit Trail Approval Sequence</h4>
                  <div className="space-y-2">
                    {result.auditHistory.map((audit, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-slate-800">{audit.action}</span>
                          <span className="text-slate-500">by {audit.user_name} ({audit.user_role})</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">
                          {new Date(audit.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Verification Failed Card for Invalid IDs */
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-3 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-extrabold text-rose-900">✗ Verification Failed</h2>
              <p className="text-xs text-rose-700 font-medium">
                {result?.error || 'Document not found or invalid verification ID.'}
              </p>
              <div className="text-[11px] text-slate-500 pt-2">
                Please check the Verification ID or Document ID and try again.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
