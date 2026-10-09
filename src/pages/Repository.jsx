import React, { useState, useEffect } from 'react';
import {
  Search,
  FileText,
  Eye,
  Download,
  ShieldCheck,
  Clock,
  QrCode,
  CheckCircle2
} from 'lucide-react';

export default function Repository({ onSelectDoc, setActiveTab }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [critFilter, setCritFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (deptFilter !== 'All') params.append('department', deptFilter);
      if (critFilter !== 'All') params.append('criterion', critFilter);
      if (yearFilter !== 'All') params.append('year', yearFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [searchTerm, deptFilter, critFilter, yearFilter, statusFilter]);

  const handleDownload = (doc) => {
    alert(`Downloading evidence file: ${doc.title} (${doc.id}.pdf)\nDigital signature verification hash intact.`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Central Accreditation Evidence Repository
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Searchable institutional archive of NAAC & NBA evidence documents with cryptographic signatures.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-800 font-bold px-3.5 py-1.5 rounded-xl text-xs border border-emerald-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{documents.length} Documents Indexed</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents by title, ID (e.g. DOC-2026-CSE-001), keywords, or verification code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Department Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Departments</option>
              <option value="Computer Science and Engineering">Computer Science & Engineering</option>
              <option value="Artificial Intelligence and Machine Learning">AI & Machine Learning</option>
              <option value="Electronics and Communication Engineering">Electronics & Communication</option>
              <option value="Electrical and Electronics Engineering">Electrical & Electronics</option>
            </select>
          </div>

          {/* Criterion Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Criterion</label>
            <select
              value={critFilter}
              onChange={(e) => setCritFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Criteria</option>
              <option value="Criterion I: Curricular Aspects">Criterion I: Curricular Aspects</option>
              <option value="Criterion II: Teaching-Learning & Evaluation">Criterion II: Teaching-Learning & Evaluation</option>
              <option value="Criterion III: Research, Innovations & Extension">Criterion III: Research, Innovations & Extension</option>
              <option value="Criterion IV: Infrastructure & Learning Resources">Criterion IV: Infrastructure & Learning Resources</option>
              <option value="Criterion V: Student Support & Progression">Criterion V: Student Support & Progression</option>
              <option value="Criterion VI: Governance, Leadership & Management">Criterion VI: Governance, Leadership & Management</option>
              <option value="Criterion VII: Institutional Values & Best Practices">Criterion VII: Institutional Values & Best Practices</option>
            </select>
          </div>

          {/* Academic Year Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Academic Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Academic Years</option>
              <option value="2025-26">2025-26</option>
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approval Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Digitally Signed / Approved">Digitally Signed / Approved</option>
              <option value="Pending HOD Review">Pending HOD Review</option>
              <option value="Pending Principal Review">Pending Principal Review</option>
              <option value="Rejected by HOD">Rejected by HOD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Document Repository Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Searching Repository...</div>
        ) : documents.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <div className="text-sm font-semibold">No documents found matching filter criteria.</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setDeptFilter('All');
                setCritFilter('All');
                setYearFilter('All');
                setStatusFilter('All');
              }}
              className="text-xs text-blue-600 font-bold hover:underline mt-1"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Doc ID</th>
                  <th>Document Title</th>
                  <th>Department</th>
                  <th>Criterion</th>
                  <th>AY</th>
                  <th>Uploaded By</th>
                  <th>Status</th>
                  <th>Signed By</th>
                  <th>Upload Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td>
                      <span className="font-mono text-[11px] font-extrabold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {doc.id}
                      </span>
                    </td>
                    <td className="max-w-xs">
                      <div
                        onClick={() => onSelectDoc(doc)}
                        className="font-bold text-slate-900 text-xs hover:text-blue-600 cursor-pointer line-clamp-1"
                      >
                        {doc.title}
                      </div>
                      <div className="text-[10px] text-slate-400 line-clamp-1">{doc.doc_type}</div>
                    </td>
                    <td className="text-xs font-medium text-slate-800 max-w-[140px] truncate">{doc.department.split(' ')[0]}</td>
                    <td className="text-[11px] text-slate-600 max-w-[130px] truncate">{doc.criterion.split(':')[0]}</td>
                    <td className="text-xs font-semibold text-slate-700">{doc.academic_year}</td>
                    <td className="text-xs text-slate-600 font-medium">{doc.uploaded_by_name}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === 'Digitally Signed / Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        doc.status.startsWith('Pending') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {doc.status === 'Digitally Signed / Approved' ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Clock className="w-3 h-3" />}
                        <span>{doc.status.replace('Digitally Signed / ', '')}</span>
                      </span>
                    </td>
                    <td className="text-xs text-slate-600 font-medium">
                      {doc.dsc_signer_name ? (
                        <span className="text-purple-700 font-bold text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> {doc.dsc_signer_name.split(' ')[0]} {doc.dsc_signer_name.split(' ')[1]}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">—</span>
                      )}
                    </td>
                    <td className="text-[11px] text-slate-500 font-mono">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => onSelectDoc(doc)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Download Evidence File"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
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
