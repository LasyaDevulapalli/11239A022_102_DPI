import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Building2,
  ArrowRight,
  Upload,
  QrCode,
  GitPullRequest,
  Sliders
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ stats, setActiveTab }) {
  const { currentUser } = useAuth();
  const userRole = currentUser?.role || 'Faculty';

  if (!stats) {
    return (
      <div className="p-8 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        Loading Accreditation Dashboard...
      </div>
    );
  }

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

  const departmentData = stats.departmentStats?.map(item => ({
    name: item.department.split(' ')[0],
    fullName: item.department,
    count: item.count
  })) || [];

  const statusData = stats.statusStats?.map(item => ({
    name: item.status.replace('Digitally Signed / ', ''),
    value: item.count
  })) || [];

  // Determine role-specific quick action button
  const getQuickAction = () => {
    switch (userRole) {
      case 'Faculty':
        return { label: 'Upload Evidence', tab: 'upload', icon: Upload };
      case 'HOD':
        return { label: 'Review Pending Evidence', tab: 'workflow', icon: GitPullRequest };
      case 'Principal':
        return { label: 'Approval Workflow', tab: 'workflow', icon: GitPullRequest };
      case 'NAAC/NBA Coordinator':
        return { label: 'Evidence Repository', tab: 'repository', icon: FileText };
      case 'Admin':
        return { label: 'Admin Management', tab: 'admin', icon: Sliders };
      default:
        return { label: 'Upload Evidence', tab: 'upload', icon: Upload };
    }
  };

  const quickAction = getQuickAction();
  const QuickActionIcon = quickAction.icon;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 font-semibold px-2.5 py-0.5 rounded-md text-xs border border-blue-400/30">
              NAAC & NBA ACCREDITATION SYSTEM
            </span>
            <span className="text-xs text-slate-400">• Institutional Quality Assurance Cell (IQAC)</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Accreditation Evidence Dashboard</h1>
          <p className="text-slate-300 text-sm">
            Centralized repository tracking academic evidence documents, digital signatures, and tamper-evident audit trails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(quickAction.tab)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <QuickActionIcon className="w-4 h-4" />
            <span>{quickAction.label}</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>QR Verification</span>
          </button>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Documents */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Documents</span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">Indexed in repository</div>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600">{stats.pending}</div>
            <div className="text-xs text-amber-700/80 mt-1 font-medium">Awaiting HOD / Principal</div>
          </div>
        </div>

        {/* Approved & Signed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved & Signed</span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-emerald-600">{stats.approved}</div>
            <div className="text-xs text-emerald-700/80 mt-1 font-medium">Digitally Signed & Verified</div>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</span>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-600">{stats.rejected}</div>
            <div className="text-xs text-rose-700/80 mt-1 font-medium">Requires revision</div>
          </div>
        </div>

        {/* NAAC Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accreditation</span>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-purple-600">{stats.accreditationProgress}%</div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${stats.accreditationProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Evidence Count (Bar Chart) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Department-wise Accreditation Evidence
              </h3>
              <p className="text-xs text-slate-500">Distribution of evidence documents submitted per department</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value, name, props) => [value, props.payload.fullName]}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]}>
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2563eb', '#6366f1', '#0ea5e9', '#10b981', '#8b5cf6'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Status Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Document Workflow Status
            </h3>
            <p className="text-xs text-slate-500">Real-time status breakdown across repository</p>
          </div>

          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
            {statusData.map((st, i) => (
              <div key={st.name} className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                <span className="truncate">{st.name}:</span>
                <span className="font-bold text-slate-900">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities Audit Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Audit Trail Activities</h3>
            <p className="text-xs text-slate-500 font-medium">Cryptographically hashed actions recorded in tamper-evident trail</p>
          </div>
          <button
            onClick={() => setActiveTab('audit')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View Full Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 overflow-hidden">
          {stats.recentActivities?.map((act) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50 px-2 rounded-lg transition-colors">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-0.5 font-bold rounded ${
                  act.action.includes('Signed') ? 'bg-purple-100 text-purple-800' :
                  act.action.includes('Approved') ? 'bg-emerald-100 text-emerald-800' :
                  act.action.includes('Uploaded') ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {act.action}
                </span>
                <div>
                  <span className="font-bold text-slate-800">{act.doc_title}</span>
                  <span className="text-slate-500 ml-2 font-medium">by {act.user_name} ({act.user_role})</span>
                </div>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
