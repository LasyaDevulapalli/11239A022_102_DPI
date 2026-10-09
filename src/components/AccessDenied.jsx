import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AccessDenied({ requiredRole, onGoHome }) {
  const { currentUser } = useAuth();

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white rounded-3xl border border-rose-200 shadow-xl overflow-hidden text-center p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="space-y-2">
        <span className="bg-rose-100 text-rose-800 font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-rose-200">
          403 — Access Denied
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900">Restricted Functionality</h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Your current authenticated role (<strong>{currentUser?.role || 'Guest'}</strong>) is not authorized to access this module or execute this action.
        </p>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5 text-left max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500">Authenticated User:</span>
          <span className="font-bold text-slate-800">{currentUser?.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500">User Role:</span>
          <span className="font-bold text-blue-700">{currentUser?.role}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500">Department:</span>
          <span className="font-bold text-slate-800">{currentUser?.department}</span>
        </div>
        {requiredRole && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-rose-700 font-bold">
            <span>Required Role:</span>
            <span>{requiredRole}</span>
          </div>
        )}
      </div>

      <div className="pt-2 flex justify-center gap-3">
        <button
          onClick={onGoHome}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
