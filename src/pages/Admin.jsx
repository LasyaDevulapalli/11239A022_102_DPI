import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Building2,
  Server,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  Cpu,
  UserCheck
} from 'lucide-react';

export default function Admin() {
  const { currentUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users', 'departments', 'system'
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [systemInfo, setSystemInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Faculty');
  const [newDept, setNewDept] = useState('Computer Science and Engineering');
  const [userMsg, setUserMsg] = useState(null);

  // New Department Form State
  const [newCode, setNewCode] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newHodName, setNewHodName] = useState('');
  const [deptMsg, setDeptMsg] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const headers = { 'x-user-role': currentUser?.role || 'Admin' };

      const [usersRes, deptsRes, sysRes] = await Promise.all([
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/departments', { headers }),
        fetch('/api/admin/system-info', { headers })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (deptsRes.ok) setDepartments(await deptsRes.json());
      if (sysRes.ok) setSystemInfo(await sysRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    setUserMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
          department: newDept,
          admin_user_id: currentUser.id,
          admin_user_name: currentUser.name
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create user');
      }

      setUserMsg({ type: 'success', text: `User ${newName} created successfully!` });
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      fetchAdminData();
    } catch (err) {
      setUserMsg({ type: 'error', text: err.message });
    }
  };

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!newCode || !newDeptName) return;

    setDeptMsg(null);
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          code: newCode,
          name: newDeptName,
          hod_name: newHodName,
          faculty_count: 5,
          admin_user_id: currentUser.id,
          admin_user_name: currentUser.name
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create department');
      }

      setDeptMsg({ type: 'success', text: `Department ${newDeptName} created successfully!` });
      setNewCode('');
      setNewDeptName('');
      setNewHodName('');
      fetchAdminData();
    } catch (err) {
      setDeptMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" /> Admin System Management Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            System administration, user account management, department configuration, and diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('users')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'users' ? 'bg-white text-blue-700 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users ({users.length})
          </button>
          <button
            onClick={() => setActiveSubTab('departments')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'departments' ? 'bg-white text-blue-700 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Departments ({departments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('system')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeSubTab === 'system' ? 'bg-white text-blue-700 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> System Info
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-500">Loading System Management Console...</div>
      ) : (
        <>
          {/* SubTab 1: User Management */}
          {activeSubTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Create User Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <PlusCircle className="w-5 h-5 text-blue-600" /> Create New User Account
                </h2>

                {userMsg && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    userMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {userMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{userMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Ananya Sen"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ananya@demo.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Password *</label>
                    <input
                      type="password"
                      required
                      placeholder="Assign initial password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Role *</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="Faculty">Faculty</option>
                      <option value="HOD">HOD</option>
                      <option value="Principal">Principal</option>
                      <option value="NAAC/NBA Coordinator">NAAC/NBA Coordinator</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Department *</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
                    >
                      <option value="Computer Science and Engineering">Computer Science and Engineering</option>
                      <option value="Artificial Intelligence and Machine Learning">Artificial Intelligence and Machine Learning</option>
                      <option value="Electronics and Communication Engineering">Electronics and Communication Engineering</option>
                      <option value="Electrical and Electronics Engineering">Electrical and Electronics Engineering</option>
                      <option value="Administration">Administration</option>
                      <option value="IQAC Cell">IQAC Cell</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/30"
                  >
                    Add User Account
                  </button>
                </form>
              </div>

              {/* Right Column: User Directory Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>SYSTEM USER DIRECTORY ({users.length})</span>
                </div>
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>User Name & Email</th>
                        <th>Role</th>
                        <th>Department</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td>
                            <div className="flex items-center space-x-3">
                              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border" />
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{u.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.role === 'Principal' ? 'bg-purple-100 text-purple-800' :
                              u.role === 'HOD' ? 'bg-indigo-100 text-indigo-800' :
                              u.role === 'Faculty' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="text-xs text-slate-600 font-medium">{u.department}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 2: Department Management */}
          {activeSubTab === 'departments' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Add Dept Form */}
              <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <PlusCircle className="w-5 h-5 text-blue-600" /> Add New Academic Department
                </h2>

                {deptMsg && (
                  <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    deptMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {deptMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                    <span>{deptMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Dept Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MECH or CIVIL"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500 uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Department Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mechanical Engineering"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 uppercase tracking-wider">Head of Department (HOD)</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. K. V. Sharma"
                      value={newHodName}
                      onChange={(e) => setNewHodName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-blue-900/30"
                  >
                    Add Department
                  </button>
                </form>
              </div>

              {/* Department Directory Table */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>INSTITUTIONAL DEPARTMENTS ({departments.length})</span>
                </div>
                <div className="overflow-x-auto">
                  <table>
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Department Name</th>
                        <th>HOD Name</th>
                        <th>Faculty Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {departments.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                          <td>
                            <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                              {d.code}
                            </span>
                          </td>
                          <td className="text-xs font-bold text-slate-900">{d.name}</td>
                          <td className="text-xs text-slate-700 font-medium">{d.hod_name || 'Unassigned'}</td>
                          <td className="text-xs font-semibold text-slate-600">{d.faculty_count} members</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SubTab 3: System Diagnostics */}
          {activeSubTab === 'system' && systemInfo && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">{systemInfo.metrics?.users}</div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments</span>
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">{systemInfo.metrics?.departments}</div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Documents</span>
                    <HardDrive className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">{systemInfo.metrics?.documents}</div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audit Trail Logs</span>
                    <Cpu className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="mt-3 text-3xl font-extrabold text-slate-900">{systemInfo.metrics?.auditLogs}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">System Specifications</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">System Name:</span>
                    <span className="font-bold text-slate-900">{systemInfo.systemName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Build Version:</span>
                    <span className="font-mono font-bold text-blue-700">{systemInfo.version}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Node Environment:</span>
                    <span className="font-mono text-slate-800">{systemInfo.nodeVersion}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Database Size:</span>
                    <span className="font-mono text-slate-800">{(systemInfo.dbSizeBytes / 1024).toFixed(1)} KB</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
