import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DigitalSignatureModal({ document, onClose, onSignComplete }) {
  const { currentUser } = useAuth();
  const [remarks, setRemarks] = useState('Approved and digitally signed for NAAC / NBA evidence portal submission.');
  const [signing, setSigning] = useState(false);

  if (!document) return null;

  const currentTimestamp = new Date().toISOString();
  const simulatedSignatureRef = `AV-DSC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const handleDigitalSign = async () => {
    setSigning(true);

    try {
      const res = await fetch(`/api/documents/${document.id}/digital-sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser?.role || 'Principal'
        },
        body: JSON.stringify({
          user_id: currentUser?.id || 'usr-prin-1',
          user_name: currentUser?.name || 'Dr. A. K. Sharma',
          user_role: currentUser?.role || 'Principal',
          remarks
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Digital signature failed');
      }

      const updatedDoc = await res.json();

      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onSignComplete) onSignComplete(updatedDoc);
    } catch (err) {
      console.error(err);
      alert('Error digitally signing document: ' + err.message);
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <Lock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                AccrediVault Digital Signature Module
              </h2>
              <p className="text-xs text-blue-200">Class-3 Institutional Digital Signature Simulation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>DIGITAL SIGNATURE SIMULATION:</strong> This feature simulates a Principal digital signature workflow with SHA-256 cryptographic hashing for prototype demonstration purposes.
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Document Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {document.id}
              </span>
              <span className="text-xs text-slate-500 font-semibold">{document.department}</span>
            </div>
            <h3 className="font-bold text-slate-900 text-base">{document.title}</h3>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600 pt-1">
              <span className="bg-white px-2 py-1 rounded border border-slate-200 font-medium">{document.criterion}</span>
              <span className="bg-white px-2 py-1 rounded border border-slate-200 font-medium">AY: {document.academic_year}</span>
            </div>
          </div>

          {/* Visual Digital Signature Stamp Simulation */}
          <div className="signature-stamp p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                    AccrediVault Digital Signature Simulation Metadata
                  </div>
                  <div className="text-[11px] text-blue-700 font-medium">Verified Signer Identity</div>
                </div>
              </div>
              <div className="text-right">
                <span className="bg-blue-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
                  SIMULATED SIGNATURE
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-medium block">Document Name:</span>
                <span className="font-bold text-slate-900 truncate block">{document.title}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Signer Name:</span>
                <span className="font-extrabold text-slate-900">{currentUser?.name || 'Dr. A. K. Sharma'} (Principal)</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Role:</span>
                <span className="font-extrabold text-purple-700">Principal</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Timestamp:</span>
                <span className="font-mono text-slate-800 font-semibold text-[11px]">{new Date(currentTimestamp).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Document ID:</span>
                <span className="font-mono text-slate-800 font-semibold text-[11px]">{document.id}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Signature Reference ID:</span>
                <span className="font-mono text-blue-700 font-bold text-[11px]">{simulatedSignatureRef}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium block">Signature Status:</span>
                <span className="font-extrabold text-emerald-600">Pending Execution</span>
              </div>
            </div>
          </div>

          {/* Principal Remarks Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Principal Approval Remarks
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleDigitalSign}
            disabled={signing}
            className="bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-700/30 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{signing ? 'Attaching Digital Signature...' : 'Apply Digital Signature'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
