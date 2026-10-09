import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_USERS = [
  { id: 'usr-fac-1', name: 'Prof. Rajesh Kumar', email: 'faculty@demo.com', password: 'faculty123', role: 'Faculty', department: 'Computer Science and Engineering', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  { id: 'usr-hod-cse', name: 'Dr. Sunita Rao', email: 'hod@demo.com', password: 'hod123', role: 'HOD', department: 'Computer Science and Engineering', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: 'usr-prin-1', name: 'Dr. A. K. Sharma', email: 'principal@demo.com', password: 'principal123', role: 'Principal', department: 'Administration', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
  { id: 'usr-coord-1', name: 'Prof. Meena Reddy', email: 'coordinator@demo.com', password: 'coordinator123', role: 'NAAC/NBA Coordinator', department: 'IQAC Cell', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
  { id: 'usr-admin-1', name: 'System Administrator', email: 'admin@demo.com', password: 'admin123', role: 'Admin', department: 'IT Infrastructure', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150' }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('accredivault_user');
    return saved ? JSON.parse(saved) : null; // Require explicit login or default demo
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('accredivault_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('accredivault_user');
    }
  }, [currentUser]);

  const loginWithCredentials = async (email, password) => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid email or password');
      }
      const user = await res.json();
      setCurrentUser(user);
      return user;
    } catch (err) {
      // Local fallback matching
      const localUser = DEMO_USERS.find(u => u.email === cleanEmail && u.password === password);
      if (localUser) {
        setCurrentUser(localUser);
        return localUser;
      }
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('accredivault_user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loginWithCredentials, logout, DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
