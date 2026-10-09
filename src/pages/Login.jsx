import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, ArrowRight, CheckCircle2, Lock, Key, AlertCircle, FileCheck, History, QrCode } from 'lucide-react';

export default function Login() {
  const { loginWithCredentials } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await loginWithCredentials(email, password);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/50 text-slate-800 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden font-sans">
      {/* Soft Blurred Background Ambient Accents */}
      <div className="w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl absolute -top-20 -left-20 pointer-events-none"></div>
      <div className="w-[500px] h-[500px] bg-teal-200/30 rounded-full blur-3xl absolute -bottom-20 -right-20 pointer-events-none"></div>
      <div className="w-[400px] h-[400px] bg-indigo-100/40 rounded-full blur-3xl absolute top-1/3 left-1/3 pointer-events-none"></div>

      {/* Two-Column Responsive Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        
        {/* Left Side: Branding & Product Statement */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-teal-50 border border-teal-200/80 rounded-full text-teal-800 text-xs font-bold shadow-xs">
            <ShieldCheck className="w-4 h-4 text-teal-700" />
            <span>AccrediVault Enterprise Portal</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              AccrediVault
            </h1>
            <p className="text-lg font-bold text-teal-800 tracking-wide">
              Accreditation Evidence Management Platform
            </p>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            Centralized institutional repository for NAAC &amp; NBA accreditation evidence collection, paperless approval workflows, digital signature simulation, and SHA-256 tamper-evident audit trails.
          </p>

          {/* Feature Highlights Grid */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-white/70 border border-slate-200/80 rounded-2xl flex items-center space-x-3 shadow-xs backdrop-blur-md">
              <div className="p-2 bg-blue-50 text-blue-700 rounded-xl">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Cryptographic Audit Trail</h4>
                <p className="text-[11px] text-slate-500">SHA-256 hash chain linking all evidence approval events</p>
              </div>
            </div>

            <div className="p-3.5 bg-white/70 border border-slate-200/80 rounded-2xl flex items-center space-x-3 shadow-xs backdrop-blur-md">
              <div className="p-2 bg-purple-50 text-purple-700 rounded-xl">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Paperless Multi-Stage Workflow</h4>
                <p className="text-[11px] text-slate-500">Role-authenticated Faculty, HOD, and Principal reviews</p>
              </div>
            </div>

            <div className="p-3.5 bg-white/70 border border-slate-200/80 rounded-2xl flex items-center space-x-3 shadow-xs backdrop-blur-md">
              <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Public QR Verification Portal</h4>
                <p className="text-[11px] text-slate-500">Instant verification of approved document authenticity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Light Translucent Glassmorphism Card */}
        <div className="lg:col-span-6">
          <div className="bg-white/80 border border-slate-200/80 backdrop-blur-xl rounded-3xl p-8 sm:p-10 shadow-2xl shadow-slate-200/60 space-y-6">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base font-extrabold text-slate-900">
                  <Lock className="w-5 h-5 text-slate-900" /> Secure Sign In
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-full border border-slate-200">
                  RBAC SECURE
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Enter your credentials to access your institutional workspace
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Password *</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-2 focus:ring-slate-800/10 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 disabled:opacity-50 mt-3 cursor-pointer"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">
                AccrediVault Enterprise Portal • Paperless Office v1.2
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
