import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  collegeId: number | null;
  collegeName: string;
  primaryRole: string;
  mustChangePassword: boolean;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  hasPermission: (permissionCode: string) => boolean;
  updateUserPasswordState: (mustChange: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('campus_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('campus_jwt_token');
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('campus_jwt_token', newToken);
    localStorage.setItem('campus_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('campus_jwt_token');
    localStorage.removeItem('campus_user');
  };

  const hasPermission = (permissionCode: string) => {
    if (!user) return false;
    if (user.primaryRole === 'Platform Admin') return true;
    return user.permissions.includes(permissionCode);
  };

  const updateUserPasswordState = (mustChange: boolean) => {
    if (user) {
      const updated = { ...user, mustChangePassword: mustChange };
      setUser(updated);
      localStorage.setItem('campus_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasPermission, updateUserPasswordState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
