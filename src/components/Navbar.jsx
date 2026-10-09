import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, CheckCircle2 } from 'lucide-react';

export default function Navbar({ activeTab }) {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Left Title & System Status */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">AccrediVault</span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Accreditation Repository
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">NAAC & NBA Paperless Office with Digital Signature</p>
            </div>
          </div>
        </div>

        {/* Right User Area & Logout */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure Role-Based Session</span>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/20 border border-white"
              />
              <div className="text-left hidden sm:block">
                <div className="text-sm font-extrabold text-slate-900 leading-tight">{currentUser.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-extrabold px-2 py-0.2 rounded uppercase ${
                    currentUser.role === 'Principal' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                    currentUser.role === 'HOD' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    currentUser.role === 'Faculty' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {currentUser.role}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{currentUser.department.split(' ')[0]}</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors ml-2 border border-rose-200"
                title="Sign out of AccrediVault"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
