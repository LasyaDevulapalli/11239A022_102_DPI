import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, ShieldCheck, FileText, Download, QrCode } from 'lucide-react';

export default function DocumentDetailModal({ document, onClose, onNavigateToVerification }) {
  if (!document) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-400/30">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <span className="font-mono text-xs font-bold text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded">
                {document.id}
              </span>
              <h2 className="text-base font-extrabold text-white mt-0.5">Accreditation Evidence Details</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title & Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">{document.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{document.description}</p>
            </div>

            <span className={`self-start sm:self-center shrink-0 px-3 py-1 text-xs font-bold rounded-full ${
              document.status === 'Digitally Signed / Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
              document.status.startsWith('Pending') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
            }`}>
              {document.status}
            </span>
          </div>

          {/* AccrediVault Digital Signature Simulation Stamp (if signed) */}
          {document.dsc_signature_id && (
            <div className="signature-stamp p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-6 h-6 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                      AccrediVault Digital Signature Simulation Metadata
                    </h4>
                    <p className="text-[11px] text-blue-700 font-medium">PKI Authenticated Simulation Stamp</p>
                  </div>
                </div>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  SIMULATED SIGNATURE
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Signer:</span>
                  <span className="font-bold text-slate-900">{document.dsc_signer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Signature Ref:</span>
                  <span className="font-mono text-slate-800 font-bold">{document.dsc_signature_id}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Signed Date:</span>
                  <span className="font-semibold text-slate-800">{new Date(document.dsc_signed_at).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Simulation Reference ID:</span>
                  <span className="font-mono text-slate-800 font-semibold text-[10px]">{document.dsc_certificate_serial}</span>
                </div>
              </div>
            </div>
          )}

          {/* Grid Metadata */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium block">Department:</span>
              <span className="font-bold text-slate-800">{document.department}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Criterion:</span>
              <span className="font-bold text-slate-800">{document.criterion}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Academic Year:</span>
              <span className="font-bold text-slate-800">{document.academic_year}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Document Type:</span>
              <span className="font-bold text-slate-800">{document.doc_type}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Uploaded By:</span>
              <span className="font-bold text-slate-800">{document.uploaded_by_name}</span>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Verification ID:</span>
              <span className="font-mono font-bold text-blue-700">{document.verification_id}</span>
            </div>
          </div>

          {/* Approval Trail Notes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Approval Notes & Remarks</h4>
            <div className="space-y-2 text-xs">
              {document.hod_approved_by && (
                <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                  <div className="font-bold text-indigo-900">HOD Approval by {document.hod_approved_by}</div>
                  <div className="text-indigo-800 mt-0.5">"{document.hod_remarks || 'Approved.'}"</div>
                </div>
              )}

              {document.principal_approved_by && (
                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <div className="font-bold text-purple-900">Principal Approval by {document.principal_approved_by}</div>
                  <div className="text-purple-800 mt-0.5">"{document.principal_remarks || 'Approved & Signed.'}"</div>
                </div>
              )}
            </div>
          </div>

          {/* QR Code and Actions */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
                <QRCodeSVG
                  value={`${window.location.origin}/verify?id=${document.verification_id}`}
                  size={60}
                />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800">QR Verification Available</div>
                <div className="text-slate-500">Scan to view public verification page</div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (onNavigateToVerification) onNavigateToVerification(document.verification_id);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Verify Page</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold text-sm px-4 py-2"
          >
            Close
          </button>
          <button
            onClick={() => alert(`Downloading evidence file: ${document.title} (${document.id}.pdf)`)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Evidence File</span>
          </button>
        </div>
      </div>
    </div>
  );
}
