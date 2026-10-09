import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Workflow from './pages/Workflow';
import Repository from './pages/Repository';
import AuditTrail from './pages/AuditTrail';
import Verification from './pages/Verification';
import Admin from './pages/Admin';
import AccreditationStatus from './pages/AccreditationStatus';
import AccessDenied from './components/AccessDenied';
import DocumentDetailModal from './components/DocumentDetailModal';

// Strict Tab Role Permissions Mapping
const TAB_ROLES = {
  dashboard: ['Faculty', 'HOD', 'Principal', 'NAAC/NBA Coordinator'],
  'admin-dashboard': ['Admin'],
  upload: ['Faculty'],
  workflow: ['Faculty', 'HOD', 'Principal'],
  'my-evidence': ['Faculty'],
  'dept-evidence': ['HOD'],
  repository: ['Faculty', 'HOD', 'Principal', 'NAAC/NBA Coordinator', 'Admin'],
  'accreditation-status': ['NAAC/NBA Coordinator'],
  audit: ['HOD', 'Principal', 'NAAC/NBA Coordinator', 'Admin'],
  verification: ['Faculty', 'HOD', 'Principal', 'NAAC/NBA Coordinator', 'Admin'],
  admin: ['Admin']
};

function MainApp() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [verificationIdToLoad, setVerificationIdToLoad] = useState(null);

  // Default activeTab based on user role when logged in
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'Admin') {
        setActiveTab('admin-dashboard');
      } else {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser?.role]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStats();
    }
  }, [currentUser, activeTab]);

  if (!currentUser) {
    return <Login />;
  }

  const userRole = currentUser.role || 'Faculty';
  const allowedRolesForActiveTab = TAB_ROLES[activeTab] || [];
  const isTabAuthorized = allowedRolesForActiveTab.includes(userRole);

  const pendingCount = stats?.pending || 0;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Main Navbar */}
      <Navbar activeTab={activeTab} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pendingCount={pendingCount}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {!isTabAuthorized ? (
            <AccessDenied
              requiredRole={allowedRolesForActiveTab.join(' or ')}
              onGoHome={() => setActiveTab(userRole === 'Admin' ? 'admin-dashboard' : 'dashboard')}
            />
          ) : (
            <>
              {(activeTab === 'dashboard' || activeTab === 'admin-dashboard') && (
                <Dashboard
                  stats={stats}
                  setActiveTab={setActiveTab}
                  onRefresh={fetchStats}
                />
              )}

              {activeTab === 'accreditation-status' && (
                <AccreditationStatus
                  stats={stats}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'upload' && (
                <Upload
                  onUploadSuccess={() => {
                    fetchStats();
                  }}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'workflow' && (
                <Workflow
                  onWorkflowUpdate={() => {
                    fetchStats();
                  }}
                  onSelectDoc={(doc) => setSelectedDocument(doc)}
                />
              )}

              {(activeTab === 'repository' || activeTab === 'my-evidence' || activeTab === 'dept-evidence') && (
                <Repository
                  onSelectDoc={(doc) => setSelectedDocument(doc)}
                  setActiveTab={setActiveTab}
                  presetDepartment={activeTab === 'dept-evidence' ? currentUser.department : undefined}
                />
              )}

              {activeTab === 'audit' && (
                <AuditTrail />
              )}

              {activeTab === 'verification' && (
                <Verification initialVerificationId={verificationIdToLoad} />
              )}

              {activeTab === 'admin' && (
                <Admin />
              )}
            </>
          )}
        </main>
      </div>

      {/* Detail Modal */}
      {selectedDocument && (
        <DocumentDetailModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onNavigateToVerification={(verId) => {
            setSelectedDocument(null);
            setVerificationIdToLoad(verId);
            setActiveTab('verification');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
