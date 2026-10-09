import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GitPullRequest,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2
} from 'lucide-react';
import DigitalSignatureModal from '../components/DigitalSignatureModal';

export default function Workflow({ onWorkflowUpdate, onSelectDoc }) {
  const { currentUser } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDocForAction, setSelectedDocForAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'hod_approve', 'hod_reject', 'principal_approve', 'principal_reject'
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [accessDeniedMsg, setAccessDeniedMsg] = useState(null);

  const [showSignModal, setShowSignModal] = useState(false);
  const [signingDoc, setSigningDoc] = useState(null);

  const userRole = currentUser?.role || 'Faculty';
  const isFaculty = userRole === 'Faculty';
  const isHOD = userRole === 'HOD';
  const isPrincipal = userRole === 'Principal';
  const isCoordinator = userRole === 'NAAC/NBA Coordinator';
  const isAdmin = userRole === 'Admin';

  const fetchWorkflowDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflowDocs();
  }, []);

  const handleActionSubmit = async () => {
    if (!selectedDocForAction || !actionType) return;
    if (actionType.includes('reject') && !remarks.trim()) {
      alert('Please provide a reason for rejecting this document.');
      return;
    }

    setProcessing(true);
    setAccessDeniedMsg(null);

    try {
      let endpoint = '';
      let body = {
        action: actionType.includes('approve') ? 'approve' : 'reject',
        remarks: remarks || (actionType.includes('approve') ? 'Approved by Principal.' : 'Rejected.'),
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role
      };

      if (actionType.startsWith('hod')) {
        endpoint = `/api/documents/${selectedDocForAction.id}/hod-approve`;
      } else if (actionType.startsWith('principal')) {
        endpoint = `/api/documents/${selectedDocForAction.id}/principal-approve`;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json();
        if (res.status === 403) {
          setAccessDeniedMsg(errData.error || '403 — Access Denied: Unauthorized role action');
          setSelectedDocForAction(null);
          return;
        }
        throw new Error(errData.error || 'Workflow action failed');
      }

      setSelectedDocForAction(null);
      setActionType(null);
      setRemarks('');
      fetchWorkflowDocs();
      if (onWorkflowUpdate) onWorkflowUpdate();
    } catch (err) {
      console.error(err);
      alert('Error: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  // Role-Based Document Filtering
  const facultyMyDocs = documents.filter(d => d.uploaded_by === currentUser?.email);
  const pendingHODDocs = documents.filter(d => d.status === 'Pending HOD Review');
  const pendingPrincipalDocs = documents.filter(d => d.status === 'Pending Principal Review' || d.status === 'Pending Digital Signature');

  const renderFacultyStageStepper = (doc) => {
    let currentStep = 1;
    if (doc.status === 'Pending Principal Review' || doc.status === 'Pending Digital Signature') currentStep = 3;
    if (doc.status === 'Digitally Signed / Approved') currentStep = 4;
    if (doc.status.startsWith('Rejected')) currentStep = -1;

    if (currentStep === -1) {
      return (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-rose-600" />
          <span>Workflow Rejected ({doc.status})</span>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-1.5 text-[11px] font-semibold">
        <span className={`px-2 py-0.5 rounded-full ${currentStep >= 1 ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
          1. Uploaded
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-2 py-0.5 rounded-full ${currentStep >= 2 ? (doc.status === 'Pending HOD Review' ? 'bg-amber-100 text-amber-800 font-bold animate-pulse' : 'bg-blue-100 text-blue-800 font-bold') : 'bg-slate-100 text-slate-400'}`}>
          2. HOD Review
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-2 py-0.5 rounded-full ${currentStep >= 3 ? (doc.status.includes('Principal') || doc.status.includes('Signature') ? 'bg-purple-100 text-purple-800 font-bold animate-pulse' : 'bg-blue-100 text-blue-800 font-bold') : 'bg-slate-100 text-slate-400'}`}>
          3. Principal Approval
        </span>
        <span className="text-slate-300">→</span>
        <span className={`px-2 py-0.5 rounded-full ${currentStep === 4 ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-slate-100 text-slate-400'}`}>
          4. Digitally Signed
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Access Denied Alert Banner */}
      {accessDeniedMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs font-bold flex items-center justify-between shadow-md animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{accessDeniedMsg}</span>
          </div>
          <button onClick={() => setAccessDeniedMsg(null)} className="text-rose-700 hover:text-rose-900 font-extrabold px-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <GitPullRequest className="w-6 h-6 text-indigo-600" /> Accreditation Paperless Approval Workflow
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isFaculty && "Track real-time approval status for evidence documents submitted by your account."}
              {isHOD && "Departmental HOD evidence review and approval queue."}
              {isPrincipal && "Principal final approval and institutional digital signature execution queue."}
              {(isCoordinator || isAdmin) && "Institutional accreditation approval workflow monitor."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Authenticated Role:</span>
            <span className="bg-purple-100 text-purple-800 font-extrabold px-3 py-1 rounded-xl text-xs border border-purple-200">
              {currentUser?.role} ({currentUser?.name})
            </span>
          </div>
        </div>

        {/* Workflow Stepper Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className={`p-3 border rounded-xl font-semibold flex items-center gap-2 ${isFaculty ? 'bg-blue-50 border-blue-300 text-blue-900 ring-2 ring-blue-500/20' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
            <span>Faculty Upload</span>
          </div>
          <div className={`p-3 border rounded-xl font-semibold flex items-center gap-2 ${isHOD ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-500/20' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
            <span>HOD Review</span>
          </div>
          <div className={`p-3 border rounded-xl font-semibold flex items-center gap-2 ${isPrincipal ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-500/20' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
            <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
            <span>Principal Approval</span>
          </div>
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
            <span>Digital Signature</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading Workflow...</div>
      ) : (
        <div className="space-y-8">
          {/* ROLE 1: FACULTY VIEW */}
          {isFaculty && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-base font-bold text-slate-900">My Submitted Evidence Documents</h2>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {facultyMyDocs.length} uploaded by {currentUser.name}
                  </span>
                </div>
              </div>

              {facultyMyDocs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <FileText className="w-10 h-10 mx-auto text-slate-300" />
                  <div className="text-sm font-semibold">You have not submitted any accreditation evidence documents yet.</div>
                  <p className="text-xs text-slate-500">Use the Upload Evidence tab in the menu to submit new documents.</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {facultyMyDocs.map((doc) => (
                    <div key={doc.id} className="py-4 space-y-3 hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              {doc.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-500">{doc.department}</span>
                            <span className="text-xs text-slate-400 font-mono">&bull; Submitted: {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                          </div>
                          <h3
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer"
                            onClick={() => onSelectDoc(doc)}
                          >
                            {doc.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1">{doc.description}</p>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${
                            doc.status === 'Digitally Signed / Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            doc.status.startsWith('Pending') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}>
                            {doc.status === 'Digitally Signed / Approved' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5" />}
                            <span>{doc.status}</span>
                          </span>

                          <button
                            onClick={() => onSelectDoc(doc)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Workflow Stage:</span>
                        {renderFacultyStageStepper(doc)}
                      </div>

                      {doc.status.startsWith('Rejected') && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <XCircle className="w-4 h-4 text-rose-600" /> Rejection Notice
                          </div>
                          <p className="text-slate-700 font-medium">
                            Remarks: "{doc.hod_remarks || doc.principal_remarks || 'No specific remarks provided.'}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ROLE 2: HOD VIEW */}
          {(isHOD || isAdmin) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <h2 className="text-base font-bold text-slate-900">Pending HOD Review Queue</h2>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {pendingHODDocs.length} pending
                  </span>
                </div>
                <span className="text-xs text-slate-400 italic">Department: {currentUser.department}</span>
              </div>

              {pendingHODDocs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No documents currently pending HOD review.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingHODDocs.map((doc) => (
                    <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {doc.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{doc.department}</span>
                          <span className="text-xs text-slate-400 font-mono">&bull; {new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => onSelectDoc(doc)}>
                          {doc.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{doc.description}</p>
                        <div className="flex gap-2 text-[11px] text-slate-500 font-medium">
                          <span>Criterion: <strong>{doc.criterion}</strong></span>
                          <span>&bull;</span>
                          <span>AY: <strong>{doc.academic_year}</strong></span>
                          <span>&bull;</span>
                          <span>Uploaded by: <strong>{doc.uploaded_by_name}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => onSelectDoc(doc)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          <span className="hidden sm:inline">View</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDocForAction(doc);
                            setActionType('hod_approve');
                            setRemarks('Evidence verified against NAAC guidelines. Approved.');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDocForAction(doc);
                            setActionType('hod_reject');
                            setRemarks('');
                          }}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ROLE 3: PRINCIPAL VIEW */}
          {(isPrincipal || isAdmin) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                  <h2 className="text-base font-bold text-slate-900">Pending Principal Review & Digital Signing Queue</h2>
                  <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {pendingPrincipalDocs.length} pending
                  </span>
                </div>
                <span className="text-xs text-slate-400 italic">Institutional Sign-Off</span>
              </div>

              {pendingPrincipalDocs.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">No documents currently pending Principal approval or digital signature.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pendingPrincipalDocs.map((doc) => (
                    <div key={doc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 px-3 rounded-xl transition-colors">
                      <div className="space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {doc.id}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">{doc.department}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded">
                            HOD Approved by {doc.hod_approved_by || 'Dr. Sunita Rao'}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer" onClick={() => onSelectDoc(doc)}>
                          {doc.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">HOD Remarks: "{doc.hod_remarks}"</p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => onSelectDoc(doc)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4 text-slate-500" />
                          <span className="hidden sm:inline">View</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDocForAction(doc);
                            setActionType('principal_approve');
                            setRemarks('Approved by Principal. Ready for Digital Signature application.');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>

                        <button
                          onClick={() => {
                            setSigningDoc(doc);
                            setShowSignModal(true);
                          }}
                          className="bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-purple-900/20 flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Apply Digital Signature</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedDocForAction(doc);
                            setActionType('principal_reject');
                            setRemarks('');
                          }}
                          className="bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs px-3 py-2.5 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ROLE 4: COORDINATOR VIEW */}
          {isCoordinator && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-base font-bold text-slate-900">Coordinator Read-Only Workflow Monitor</h2>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded-full">
                    {documents.length} Total Workflow Items
                  </span>
                </div>
                <span className="text-xs text-slate-400 italic">IQAC Coordinator Oversight</span>
              </div>

              <div className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700">{doc.id}</span>
                        <span className="font-bold text-slate-900 text-xs">{doc.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{doc.department} &bull; {doc.criterion}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        doc.status === 'Digitally Signed / Approved' ? 'bg-emerald-100 text-emerald-800' :
                        doc.status.startsWith('Pending') ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {doc.status}
                      </span>
                      <button
                        onClick={() => onSelectDoc(doc)}
                        className="p-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Dialog Modal */}
      {selectedDocForAction && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-extrabold text-slate-900 text-lg">
              {actionType?.includes('approve') ? 'Approve Evidence Document' : 'Reject Evidence Document'}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Document: <strong>{selectedDocForAction.title}</strong> ({selectedDocForAction.id})
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {actionType?.includes('reject') ? 'Reason for Rejection *' : 'Approval Remarks'}
              </label>
              <textarea
                rows={3}
                required={actionType?.includes('reject')}
                placeholder={actionType?.includes('reject') ? 'State clearly why this document is rejected...' : 'Enter approval notes...'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setSelectedDocForAction(null)}
                className="text-slate-600 font-bold text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleActionSubmit}
                disabled={processing}
                className={`font-bold text-sm px-5 py-2 rounded-xl text-white transition-colors ${
                  actionType?.includes('approve') ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {processing ? 'Saving...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Modal */}
      {showSignModal && signingDoc && (
        <DigitalSignatureModal
          document={signingDoc}
          onClose={() => {
            setShowSignModal(false);
            setSigningDoc(null);
          }}
          onSignComplete={() => {
            setShowSignModal(false);
            setSigningDoc(null);
            fetchWorkflowDocs();
            if (onWorkflowUpdate) onWorkflowUpdate();
          }}
        />
      )}
    </div>
  );
}
