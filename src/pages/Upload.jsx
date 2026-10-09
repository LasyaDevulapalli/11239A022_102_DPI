import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function Upload({ onUploadSuccess, setActiveTab }) {
  const { currentUser } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState(currentUser?.department || 'Computer Science and Engineering');
  const [criterion, setCriterion] = useState('Criterion I: Curricular Aspects');
  const [academicYear, setAcademicYear] = useState('2025-26');
  const [docType, setDocType] = useState('Syllabus & Curriculum');
  const [selectedFile, setSelectedFile] = useState(null);

  const [departmentsList, setDepartmentsList] = useState([
    'Computer Science and Engineering',
    'Artificial Intelligence and Machine Learning',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering'
  ]);
  const [criteriaList, setCriteriaList] = useState([
    'Criterion I: Curricular Aspects',
    'Criterion II: Teaching-Learning & Evaluation',
    'Criterion III: Research, Innovations & Extension',
    'Criterion IV: Infrastructure & Learning Resources',
    'Criterion V: Student Support & Progression',
    'Criterion VI: Governance, Leadership & Management',
    'Criterion VII: Institutional Values & Best Practices'
  ]);
  const [academicYearsList, setAcademicYearsList] = useState(['2025-26', '2024-25', '2023-24']);
  const [docTypesList, setDocTypesList] = useState([
    'Syllabus & Curriculum',
    'Workshop & Pedagogy Report',
    'Research Paper Publication',
    'Lab Audit & Maintenance',
    'Student Placement & Alumni',
    'Examination & Evaluation Log',
    'Environmental Audit'
  ]);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successDoc, setSuccessDoc] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch active departments & upload form options from backend
  useEffect(() => {
    let isMounted = true;
    const fetchUploadOptions = async () => {
      setLoadingOptions(true);
      try {
        const res = await fetch('/api/upload/options');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.departments && data.departments.length > 0) {
              const fetchedDeptNames = data.departments.map(d => d.name);
              setDepartmentsList(fetchedDeptNames);
              if (currentUser?.department && fetchedDeptNames.includes(currentUser.department)) {
                setDepartment(currentUser.department);
              } else if (fetchedDeptNames.length > 0) {
                setDepartment(fetchedDeptNames[0]);
              }
            }
            if (data.criteria) setCriteriaList(data.criteria);
            if (data.academicYears) setAcademicYearsList(data.academicYears);
            if (data.docTypes) setDocTypesList(data.docTypes);
          }
        }
      } catch (err) {
        console.warn('Backend upload options fetch note:', err.message);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    };

    fetchUploadOptions();
    return () => { isMounted = false; };
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a document title.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('department', department);
      formData.append('criterion', criterion);
      formData.append('academic_year', academicYear);
      formData.append('doc_type', docType);
      formData.append('uploaded_by', currentUser.email);
      formData.append('uploaded_by_name', currentUser.name);

      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'x-user-role': currentUser.role
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to upload document');
      }

      const data = await res.json();
      setSuccessDoc(data);
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Error uploading document');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-blue-600" /> Accreditation Evidence Submission
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit new evidence document. Status will automatically set to <strong className="text-amber-600">Pending HOD Review</strong>.
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl text-xs border border-blue-200">
          {currentUser?.role} Submission Form
        </div>
      </div>

      {successDoc ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-emerald-900">Document Uploaded Successfully!</h2>
            <p className="text-sm text-emerald-700 mt-1">
              Document ID: <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{successDoc.id}</strong>
            </p>
            <p className="text-xs text-emerald-600 mt-2">
              Status set to <strong>Pending HOD Review</strong>. SHA-256 hash recorded in Audit Trail.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => {
                setSuccessDoc(null);
                setTitle('');
                setDescription('');
                setSelectedFile(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md"
            >
              Upload Another Evidence
            </button>
            <button
              onClick={() => setActiveTab('workflow')}
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex items-center gap-2 shadow-md"
            >
              <span>Go to Workflow Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Document Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. NAAC Crit 1 - Student Feedback & CO-PO Attainment Analysis 2025-26"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Department (Loaded from API) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Academic Year *</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {academicYearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* NAAC / NBA Criterion */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">NAAC / NBA Criterion *</label>
              <select
                value={criterion}
                onChange={(e) => setCriterion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {criteriaList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Document Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Document Type *</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
              >
                {docTypesList.map((dt) => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Evidence Description</label>
              <textarea
                rows={3}
                placeholder="Provide details regarding the evidence file, key outcome metrics, and compliance notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* File Dropzone */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Upload File (PDF / DOC / Image)</label>
              <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 rounded-2xl p-6 text-center cursor-pointer transition-colors">
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                />
                <label htmlFor="file-input" className="cursor-pointer space-y-2 block">
                  <FileText className="w-8 h-8 text-blue-600 mx-auto" />
                  {selectedFile ? (
                    <div className="text-sm font-bold text-slate-800">
                      Selected: <span className="text-blue-600">{selectedFile.name}</span> ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm font-semibold text-slate-800">Click or drag & drop evidence file here</div>
                      <div className="text-xs text-slate-500">Supports PDF, DOCX, XLSX, PNG</div>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 text-sm disabled:opacity-50"
            >
              {submitting ? 'Submitting & Computing Hash...' : 'Submit Evidence for Review'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
