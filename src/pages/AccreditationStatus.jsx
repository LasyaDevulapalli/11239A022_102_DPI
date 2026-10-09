import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  FileCheck,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Building2,
  ArrowRight,
  Search,
  Lock,
  Layers,
  FileText,
  History,
  QrCode
} from 'lucide-react';

export default function AccreditationStatus({ stats, setActiveTab }) {
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch('/api/documents');
        const data = await res.json();
        setDocuments(data);
      } catch (err) {
        console.error('Failed to fetch documents for accreditation status:', err);
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocuments();
  }, []);

  const ALL_CRITERIA = [
    { key: 'Criterion I: Curricular Aspects', label: 'Criterion I', name: 'Curricular Aspects', target: 5 },
    { key: 'Criterion II: Teaching-Learning & Evaluation', label: 'Criterion II', name: 'Teaching-Learning & Evaluation', target: 5 },
    { key: 'Criterion III: Research, Innovations & Extension', label: 'Criterion III', name: 'Research, Innovations & Extension', target: 5 },
    { key: 'Criterion IV: Infrastructure & Learning Resources', label: 'Criterion IV', name: 'Infrastructure & Learning Resources', target: 5 },
    { key: 'Criterion V: Student Support & Progression', label: 'Criterion V', name: 'Student Support & Progression', target: 5 },
    { key: 'Criterion VI: Governance, Leadership & Management', label: 'Criterion VI', name: 'Governance, Leadership & Management', target: 4 },
    { key: 'Criterion VII: Institutional Values & Best Practices', label: 'Criterion VII', name: 'Institutional Values & Best Practices', target: 4 }
  ];

  const getCriterionStats = (criterionKey) => {
    const matched = documents.filter(d => d.criterion === criterionKey);
    const total = matched.length;
    const approved = matched.filter(d => d.status === 'Digitally Signed / Approved').length;
    const pending = matched.filter(d => d.status.startsWith('Pending')).length;
    const rejected = matched.filter(d => d.status.startsWith('Rejected')).length;
    const progress = total > 0 ? Math.round((approved / total) * 100) : 0;

    return { total, approved, pending, rejected, progress };
  };

  const totalIndexed = stats?.total || documents.length || 0;
  const approvedTotal = stats?.approved || documents.filter(d => d.status === 'Digitally Signed / Approved').length || 0;
  const pendingTotal = stats?.pending || documents.filter(d => d.status.startsWith('Pending')).length || 0;
  const rejectedTotal = stats?.rejected || documents.filter(d => d.status.startsWith('Rejected')).length || 0;
  const readinessScore = stats?.accreditationProgress || (totalIndexed > 0 ? Math.round((approvedTotal / totalIndexed) * 100) : 85);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-3 py-0.5 rounded-full text-xs border border-emerald-400/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>NAAC & NBA COORDINATOR MONITOR</span>
            </span>
            <span className="text-xs text-slate-400">• IQAC Executive Cell</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Accreditation Status & Criteria Readiness</h1>
          <p className="text-slate-300 text-sm">
            Real-time monitoring of NAAC 7-Criteria compliance, department evidence readiness, and digital signature audit trail status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('repository')}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <FileText className="w-4 h-4" />
            <span>Evidence Repository</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Overall Readiness Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Readiness Score</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">{readinessScore}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Total Indexed Evidence */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Evidence</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{totalIndexed}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Documents indexed</div>
          </div>
        </div>

        {/* Digitally Signed & Approved */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved & Signed</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">{approvedTotal}</div>
            <div className="text-xs text-emerald-700/80 mt-1 font-medium">Ready for inspection</div>
          </div>
        </div>

        {/* Pending Review */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600">{pendingTotal}</div>
            <div className="text-xs text-amber-700/80 mt-1 font-medium">In approval workflow</div>
          </div>
        </div>

        {/* Rejected Documents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-600">{rejectedTotal}</div>
            <div className="text-xs text-rose-700/80 mt-1 font-medium">Requires revision</div>
          </div>
        </div>
      </div>

      {/* NAAC 7-Criteria Readiness Breakdown Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" /> NAAC 7-Criteria Accreditation Matrix
            </h3>
            <p className="text-xs text-slate-500">Breakdown of evidence document completeness per accreditation criterion</p>
          </div>

          <div className="bg-blue-50 text-blue-800 font-bold px-3 py-1 rounded-lg text-xs border border-blue-200">
            NAAC Grade A++ Audit Standard
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {ALL_CRITERIA.map((crit) => {
            const cStats = getCriterionStats(crit.key);
            return (
              <div key={crit.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {crit.label}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    cStats.progress >= 80 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    cStats.progress >= 50 ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {cStats.progress >= 80 ? 'High Compliance' : cStats.progress >= 50 ? 'Substantial' : 'In Progress'}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{crit.name}</h4>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {cStats.approved} approved of {cStats.total} submitted evidence files
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Approved Completion</span>
                    <span className="font-bold text-slate-900">{cStats.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        cStats.progress >= 80 ? 'bg-emerald-500' : cStats.progress >= 50 ? 'bg-amber-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${cStats.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 font-medium">
                  <span className="text-amber-700 font-semibold">{cStats.pending} Pending</span>
                  <span className="text-rose-700 font-semibold">{cStats.rejected} Rejected</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Department-wise Evidence Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Department Evidence Completion Index
            </h3>
            <p className="text-xs text-slate-500">Monitor academic evidence uploads across institutional departments</p>
          </div>
          <button
            onClick={() => setActiveTab('repository')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View All Department Files</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.departmentStats?.map((dept) => {
            const deptName = dept.department;
            const deptCode = deptName.split(' ')[0];
            const deptDocs = documents.filter(d => d.department === deptName);
            const deptApproved = deptDocs.filter(d => d.status === 'Digitally Signed / Approved').length;

            return (
              <div key={deptName} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    {deptCode}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{dept.count} files</span>
                </div>
                <div className="text-xs font-bold text-slate-800 line-clamp-1">{deptName}</div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  ✓ {deptApproved} Digitally Signed Files
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
