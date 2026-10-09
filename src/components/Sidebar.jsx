import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  GitPullRequest,
  FileText,
  History,
  QrCode,
  ShieldCheck,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ activeTab, setActiveTab, pendingCount = 0 }) {
  const { currentUser } = useAuth();

  const userRole = currentUser?.role || 'Faculty';

  // Role-specific sidebar configurations matching exact user requirements
  const ROLE_NAV_CONFIGS = {
    Faculty: [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'upload', label: 'Upload Evidence', icon: UploadCloud },
      { id: 'workflow', label: 'My Approval Status', icon: GitPullRequest },
      { id: 'my-evidence', label: 'My Evidence', icon: FileText },
      { id: 'verification', label: 'QR Document Verification', icon: QrCode },
    ],
    HOD: [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'workflow', label: 'Approval Workflow', icon: GitPullRequest, badge: pendingCount },
      { id: 'dept-evidence', label: 'Department Evidence', icon: FileText },
      { id: 'repository', label: 'Evidence Repository', icon: FileText },
      { id: 'verification', label: 'QR Document Verification', icon: QrCode },
      { id: 'audit', label: 'Audit Trail & Integrity', icon: History },
    ],
    Principal: [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'workflow', label: 'Approval Workflow', icon: GitPullRequest, badge: pendingCount },
      { id: 'repository', label: 'Evidence Repository', icon: FileText },
      { id: 'audit', label: 'Audit Trail & Integrity', icon: History },
      { id: 'verification', label: 'QR Document Verification', icon: QrCode },
    ],
    'NAAC/NBA Coordinator': [
      { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      { id: 'repository', label: 'Evidence Repository', icon: FileText },
      { id: 'accreditation-status', label: 'Accreditation Status', icon: ShieldCheck },
      { id: 'audit', label: 'Audit Trail & Integrity', icon: History },
      { id: 'verification', label: 'QR Document Verification', icon: QrCode },
    ],
    Admin: [
      { id: 'admin-dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
      { id: 'admin', label: 'Admin Management', icon: Sliders },
      { id: 'repository', label: 'Evidence Repository', icon: FileText },
      { id: 'audit', label: 'Audit Trail & Integrity', icon: History },
      { id: 'verification', label: 'QR Document Verification', icon: QrCode },
    ]
  };

  const navItems = ROLE_NAV_CONFIGS[userRole] || ROLE_NAV_CONFIGS.Faculty;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-60px)] flex flex-col justify-between p-4 border-r border-slate-800 shrink-0">
      <div className="space-y-6">
        <div>
          <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {userRole} Workspace
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40 font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge > 0 ? (
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive ? 'bg-white text-blue-700' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Accreditation Quick Status */}
        <div className="p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> NAAC / NBA Status
            </span>
            <span className="text-emerald-400 font-bold">READY</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Evidence secured with AccrediVault SHA-256 tamper-evident hash chain.
          </p>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="pt-4 border-t border-slate-800/80 text-center">
        <div className="text-[11px] text-slate-400 font-medium">AccrediVault Repository</div>
        <div className="text-[10px] text-slate-500 mt-0.5">{userRole} Portal v1.2</div>
      </div>
    </aside>
  );
}
